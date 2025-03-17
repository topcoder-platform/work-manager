/**
 * Component to render list of challenges
 */
import _, { debounce, map } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DebounceInput } from 'react-debounce-input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faUser } from '@fortawesome/free-solid-svg-icons'
import isAfter from 'date-fns/isAfter'
import DateTime from '@nateradebaugh/react-datetime'
import Pagination from 'react-js-pagination'
import cn from 'classnames'

import { OutlineButton, PrimaryButton } from '../../Buttons'
import Modal from '../../Modal'
import 'react-tabs/style/react-tabs.css'
import styles from './ChallengeList.module.scss'
import NoChallenge from '../NoChallenge'
import ChallengeCard from '../ChallengeCard'
import Message from '../Message'
import SortIcon from '../../../assets/images/sort-icon.svg'
import Select from '../../Select'
import Loader from '../../Loader'
import UpdateBillingAccount from '../../UpdateBillingAccount'

import { CHALLENGE_STATUS, PAGE_SIZE, PAGINATION_PER_PAGE_OPTIONS, PROJECT_ROLES } from '../../../config/constants'
import { checkAdmin, checkReadOnlyRoles } from '../../../util/tc'

require('bootstrap/scss/bootstrap.scss')

const defaultSearchParam = {
  searchText: '',
  challengeProjectOption: null,
  challengeStatus: 'all',
  challengeType: null,
  sortBy: 'startDate',
  sortOrder: 'desc',
  challengeDate: {}
}

const theme = {
  container: styles.modalContainer
}

class ChallengeList extends Component {
  constructor (props) {
    super(props)

    const defaultSearchParamClone = _.cloneDeep(defaultSearchParam)
    this.state = {
      searchText: this.props.filterChallengeName || defaultSearchParamClone.searchText,
      errorMessage: null,
      sortBy: this.props.filterSortBy || defaultSearchParamClone.sortBy,
      sortOrder: this.props.filterSortOrder || defaultSearchParamClone.sortOrder,
      challengeProjectOption: this.props.filterProjectOption || defaultSearchParamClone.challengeProjectOption,
      challengeStatus: this.props.status || defaultSearchParamClone.challengeStatus,
      challengeType: this.props.filterChallengeType || defaultSearchParamClone.challengeType,
      challengeDate: this.props.filterDate || defaultSearchParamClone.challengeDate
    }
    this.directUpdateSearchParam = this.updateSearchParam.bind(this) // update search param without debounce
    this.handlePageChange = this.handlePageChange.bind(this) // update search param without debounce
    this.handlePerPageChange = this.handlePerPageChange.bind(this)
    this.showError = this.showError.bind(this)
    this.hideError = this.hideError.bind(this)
    this.reloadChallengeList = this.reloadChallengeList.bind(this)
    this.updateSearchParam = debounce(this.updateSearchParam.bind(this), 1000)
    this.updateSort = this.updateSort.bind(this)
    this.update = debounce(this.updateSearchParam.bind(this), 1000)
    this.resetFilter = this.resetFilter.bind(this)
  }

  /**
   * Update filter for getting project
   * @param {String} searchText search text
   * @param {String} projectStatus project status
   */
  updateSearchParam (
    searchText,
    projectStatus,
    challengeType = {},
    challengeDate = {},
    projectOption = {}
  ) {
    const {
      dashboard,
      status,
      filterChallengeName,
      filterChallengeType,
      filterProjectOption,
      filterDate,
      loadChallengesByPage,
      activeProjectId,
      selfService
    } = this.props
    let projectId = dashboard ? projectOption : activeProjectId
    this.setState(
      {
        searchText,
        challengeProjectOption: projectOption,
        challengeStatus: projectStatus,
        challengeType,
        challengeDate
      },
      () => {
        if (
          status !== projectStatus ||
          searchText !== filterChallengeName ||
          (projectOption || {}).value !== (filterProjectOption || {}).value ||
          (challengeType || {}).value !== (filterChallengeType || {}).value ||
          !_.isEqual(filterDate, challengeDate)
        ) {
          loadChallengesByPage(
            1,
            projectId,
            projectStatus,
            dashboard,
            searchText,
            selfService,
            this.getHandle(),
            this.getLoginUserId(),
            challengeType,
            challengeDate
          )
        }
      }
    )
  }

  /**
   * Update filter for getting project by pagination
   * @param {Number} pageNumber page number
   */
  handlePageChange (pageNumber) {
    const { searchText, sortBy, sortOrder } = this.state
    const {
      page,
      perPage,
      loadChallengesByPage,
      activeProjectId,
      dashboard,
      filterProjectOption,
      status,
      selfService,
      filterChallengeType,
      filterDate
    } = this.props

    let projectId = dashboard ? filterProjectOption : activeProjectId
    if (page !== pageNumber) {
      loadChallengesByPage(
        pageNumber,
        projectId,
        status,
        dashboard,
        searchText,
        selfService,
        this.getHandle(),
        this.getLoginUserId(),
        filterChallengeType,
        filterDate,
        sortBy,
        sortOrder,
        perPage
      )
    }
  }

  /**
   * Update filter for getting project by pagination
   * @param {Number} perPageNumber per page number
   */
  handlePerPageChange (option) {
    const perPageNumber = option.value
    const { searchText, sortBy, sortOrder } = this.state
    const {
      perPage,
      loadChallengesByPage,
      activeProjectId,
      dashboard,
      filterProjectOption,
      status,
      selfService,
      filterChallengeType,
      filterDate
    } = this.props

    let projectId = dashboard ? filterProjectOption : activeProjectId
    if (perPage !== perPageNumber) {
      loadChallengesByPage(
        1,
        projectId,
        status,
        dashboard,
        searchText,
        selfService,
        this.getHandle(),
        this.getLoginUserId(),
        filterChallengeType,
        filterDate,
        sortBy,
        sortOrder,
        perPageNumber
      )
    }
  }

  /**
   * Reload challenge list
   */
  reloadChallengeList () {
    const { searchText } = this.state
    const {
      page,
      loadChallengesByPage,
      activeProjectId,
      status,
      selfService,
      dashboard
    } = this.props
    loadChallengesByPage(
      page,
      activeProjectId,
      status,
      dashboard,
      searchText,
      selfService,
      this.getHandle(),
      this.getLoginUserId()
    )
  }

  /**
   * Show error message
   * @param {String} errorMessage error message
   */
  showError (errorMessage) {
    this.setState({ errorMessage })
  }

  /**
   * Hide error message
   */
  hideError () {
    this.setState({ errorMessage: null })
  }

  getStatusTextFunc (selfService) {
    const draftText = selfService ? 'Waiting for approval' : 'Draft'
    return status => {
      switch (status) {
        case CHALLENGE_STATUS.DRAFT:
          return draftText
        default:
          return status
      }
    }
  }

  getHandle () {
    if (checkAdmin(this.props.auth.token)) {
      return null
    }
    return this.getLoginHandle()
  }

  getLoginHandle () {
    return this.props.auth && this.props.auth.user
      ? this.props.auth.user.handle
      : null
  }

  getLoginUserId () {
    return this.props.auth && this.props.auth.user
      ? this.props.auth.user.userId
      : null
  }

  /**
   * Hide error message
   */
  updateSort (name) {
    const {
      searchText,
      challengeType,
      sortBy,
      sortOrder,
      challengeDate
    } = this.state
    const {
      page,
      activeProjectId,
      status,
      dashboard,
      filterProjectOption,
      selfService,
      loadChallengesByPage
    } = this.props
    let order = sortOrder === 'asc' ? 'desc' : 'asc'

    if (sortBy !== name) {
      order = 'desc'
    }

    let projectId = dashboard ? filterProjectOption : activeProjectId
    loadChallengesByPage(
      page,
      projectId,
      status,
      dashboard,
      searchText,
      selfService,
      this.getHandle(),
      this.getLoginUserId(),
      challengeType,
      challengeDate,
      name,
      order
    )

    this.setState({
      sortBy: name,
      sortOrder: order
    })
  }

  renderSortIcon (currentSortBy) {
    const { sortBy, sortOrder } = this.state
    return sortBy === currentSortBy ? (
      <img
        className={cn(
          styles.sortIcon,
          sortOrder === 'asc' ? styles.asc : ''
        )}
        src={SortIcon}
      />
    ) : null
  }

  resetFilter () {
    const {
      activeProjectId,
      dashboard,
      selfService,
      loadChallengesByPage
    } = this.props

    this.setState(_.cloneDeep(defaultSearchParam))

    let projectId = dashboard ? undefined : activeProjectId

    loadChallengesByPage(
      1,
      projectId,
      defaultSearchParam.challengeStatus,
      dashboard,
      defaultSearchParam.searchText,
      selfService,
      this.getHandle(),
      this.getLoginUserId(),
      defaultSearchParam.challengeType,
      defaultSearchParam.challengeDate,
      defaultSearchParam.sortBy,
      defaultSearchParam.sortOrder,
      PAGE_SIZE
    )
  }

  render () {
    const {
      searchText,
      errorMessage,
      challengeProjectOption,
      challengeStatus,
      challengeType,
      challengeDate
    } = this.state

    const {
      activeProject,
      warnMessage,
      challenges,
      status,
      page,
      projects,
      dashboard,
      perPage,
      isLoading,
      totalChallenges,
      partiallyUpdateChallengeDetails,
      deleteChallenge,
      isBillingAccountExpired,
      setActiveProject,
      billingStartDate,
      billingEndDate,
      currentBillingAccount,
      billingAccounts,
      isBillingAccountsLoading,
      updateProject,
      isBillingAccountLoadingFailed,
      isBillingAccountLoading,
      selfService,
      challengeTypes,
      loginUserRoleInProject,
      fetchNextProjects
    } = this.props
    const isReadOnly = checkReadOnlyRoles(this.props.auth.token) || loginUserRoleInProject === PROJECT_ROLES.READ
    const isAdmin = checkAdmin(this.props.auth.token)

    if (warnMessage) {
      return <Message warnMessage={warnMessage} />
    }

    const statusOptions = _.map(CHALLENGE_STATUS, item => ({
      label: _.capitalize(item),
      value: _.capitalize(item)
    }))

    const challengeTypesOptions = challengeTypes.map(item => ({
      label: item.name,
      value: item.abbreviation
    }))

    let selectedTab = 0
    switch (status) {
      case CHALLENGE_STATUS.APPROVED:
        selectedTab = 1
        break
      case CHALLENGE_STATUS.NEW:
        selectedTab = selfService ? 3 : 1
        break
      case CHALLENGE_STATUS.DRAFT:
        selectedTab = 2
        break
      case CHALLENGE_STATUS.COMPLETED:
        selectedTab = 3
        break
      case CHALLENGE_STATUS.CANCELLED:
        selectedTab = 4
        break
    }

    let warningModal = null
    if (errorMessage) {
      warningModal = (
        <Modal theme={theme} onCancel={this.hideError}>
          <div className={cn(styles.contentContainer, styles.confirm)}>
            <div className={styles.title}>Error</div>
            {errorMessage}
            <div className={styles.buttonGroup}>
              <div className={styles.buttonSizeA}>
                <PrimaryButton
                  text={'Close'}
                  type={'info'}
                  onClick={this.hideError}
                />
              </div>
            </div>
          </div>
        </Modal>
      )
    }
    let projectOptions
    let projectOption
    if (dashboard) {
      projectOptions = projects.map(p => {
        return {
          label: p.name,
          value: p.id
        }
      })
      projectOptions.unshift({
        label: 'All Projects',
        value: -1
      })

      let projectId = (challengeProjectOption && challengeProjectOption.value) || -1
      projectOption = projectOptions.find(p => p.value === projectId)
    }

    return (
      <div className={styles.list}>
        {dashboard && <h2>My Challenges</h2>}
        <div className={cn(styles.row, { [styles.dashboardRow]: dashboard })}>
          {!dashboard ? (
            <div className={styles['col-6']}>
              <UpdateBillingAccount
                billingAccounts={billingAccounts}
                isBillingAccountsLoading={isBillingAccountsLoading}
                isBillingAccountLoading={isBillingAccountLoading}
                isBillingAccountLoadingFailed={isBillingAccountLoadingFailed}
                billingStartDate={billingStartDate}
                billingEndDate={billingEndDate}
                isBillingAccountExpired={isBillingAccountExpired}
                isAdmin={isAdmin}
                currentBillingAccount={currentBillingAccount}
                updateProject={updateProject}
                projectId={activeProject.id}
              />
            </div>
          ) : (
            <div className={styles['col-6']}>
              <div className={cn(styles.field, styles.input1)}>
                <label htmlFor='project'>Project :</label>
              </div>
              <div className={cn(styles.field, styles.input2)}>
                <Select
                  name='project'
                  options={projectOptions}
                  cacheOptions
                  captureMenuScroll
                  onMenuScrollBottom={fetchNextProjects}
                  placeholder='All Projects'
                  value={projectOption}
                  onChange={e =>
                    this.updateSearchParam(
                      searchText,
                      status,
                      challengeType,
                      challengeDate,
                      e
                    )
                  }
                />
              </div>
            </div>
          )}
          <div className={styles['col-6']}>
            <div className={cn(styles.field, styles.input1)}>
              <label htmlFor='startDate'>Search :</label>
            </div>
            <div className={styles['searchInputWrapper']}>
              <DebounceInput
                className={styles.challengeInput}
                minLength={2}
                debounceTimeout={300}
                placeholder='Search Challenges'
                onChange={e =>
                  this.updateSearchParam(
                    e.target.value,
                    status,
                    challengeType,
                    challengeDate,
                    projectOption
                  )
                }
                value={searchText}
              />
              <div className={styles['resetFilter']}>
                <OutlineButton text='Reset Filters' type={'info'} onClick={this.resetFilter} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles['col-6']}>
            <div className={cn(styles.field, styles.input1)}>
              <label htmlFor='status'>Challenge Status :</label>
            </div>
            <div className={cn(styles.field, styles.input2)}>
              <Select
                name='challengeStatus'
                options={statusOptions}
                placeholder='All Challenge Status'
                value={
                  challengeStatus && challengeStatus !== 'all'
                    ? { label: challengeStatus, value: challengeStatus }
                    : null
                }
                onChange={e =>
                  this.updateSearchParam(
                    searchText,
                    e ? e.value : null,
                    challengeType,
                    challengeDate,
                    projectOption
                  )
                }
                isClearable
              />
            </div>
          </div>
          <div className={styles['col-6']}>
            <div className={cn(styles.field, styles.input1)}>
              <label htmlFor='startDate'>Start Date :</label>
            </div>
            <div className={cn(styles.field, styles.input2)}>
              <DateTime
                className={styles.dateTimeInput}
                placeholder='Start Date From'
                value={
                  challengeDate.startDateStart
                    ? challengeDate.startDateStart
                    : null
                }
                onChange={e =>
                  this.updateSearchParam(
                    searchText,
                    status,
                    challengeType,
                    {
                      ...challengeDate,
                      startDateStart: e
                    },
                    projectOption
                  )
                }
              />
              <label className={cn(styles.field, styles.to)}>To: </label>
              <DateTime
                className={styles.dateTimeInput}
                placeholder='Start Date To'
                value={
                  challengeDate.startDateEnd ? challengeDate.startDateEnd : null
                }
                isValidDate={(current) => {
                  return isAfter(current, challengeDate.startDateStart)
                }}
                onChange={e =>
                  this.updateSearchParam(
                    searchText,
                    status,
                    challengeType,
                    {
                      ...challengeDate,
                      startDateEnd: e
                    },
                    projectOption
                  )
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles['col-6']}>
            <div className={cn(styles.field, styles.input1)}>
              <label htmlFor='type'>Challenge Type :</label>
            </div>
            <div className={cn(styles.field, styles.input2)}>
              <Select
                name='challengeTypes'
                options={challengeTypesOptions}
                placeholder='All Challenge Types'
                value={_.isEmpty(challengeType) ? null : challengeType}
                onChange={e =>
                  this.updateSearchParam(
                    searchText,
                    challengeStatus,
                    e,
                    challengeDate,
                    projectOption
                  )
                }
                isClearable
              />
            </div>
          </div>

          <div className={styles['col-6']}>
            <div className={cn(styles.field, styles.input1)}>
              <label htmlFor='endDate'>End Date :</label>
            </div>
            <div className={cn(styles.field, styles.input2)}>
              <DateTime
                className={styles.dateTimeInput}
                placeholder='End Date From'
                value={
                  challengeDate.endDateStart ? challengeDate.endDateStart : null
                }
                onChange={e =>
                  this.updateSearchParam(
                    searchText,
                    status,
                    challengeType,
                    {
                      ...challengeDate,
                      endDateStart: e
                    },
                    projectOption
                  )
                }
              />
              <label className={cn(styles.field, styles.to)}>To: </label>
              <DateTime
                className={styles.dateTimeInput}
                placeholder='End Date To'
                value={
                  challengeDate.endDateEnd ? challengeDate.endDateEnd : null
                }
                isValidDate={(current) => {
                  return isAfter(current, challengeDate.endDateStart)
                }}
                onChange={e =>
                  this.updateSearchParam(
                    searchText,
                    status,
                    challengeType,
                    {
                      ...challengeDate,
                      endDateEnd: e
                    },
                    projectOption
                  )
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.header}>
          <div
            className={cn(styles.col5)}
          >
            <span className={styles.filterItem}>
                      Type
              {this.renderSortIcon('type')}
            </span>
          </div>
          <div
            className={cn(styles.col2, styles.sortable)}
            onClick={() => this.updateSort('name')}
          >
            <span className={styles.filterItem}>
                      Challenge Name
              {this.renderSortIcon('name')}
            </span>
          </div>
          <div
            className={cn(styles.col3, styles.sortable)}
            onClick={() => this.updateSort('startDate')}
          >
            <span className={styles.filterItem}>
                      Start Date
              {this.renderSortIcon('startDate')}
            </span>
          </div>
          <div
            className={cn(styles.col3, styles.sortable)}
            onClick={() => this.updateSort('endDate')}
          >
            <span className={styles.filterItem}>
                      End Date
              {this.renderSortIcon('endDate')}
            </span>
          </div>
          <div
            className={cn(styles.col4, styles.sortable)}
            onClick={() => this.updateSort('numOfRegistrants')}
          >
            <span className={styles.filterItem}>
              <FontAwesomeIcon icon={faUser} className={styles.faIcon} />
              {this.renderSortIcon('numOfRegistrants')}
            </span>
          </div>
          <div
            className={cn(styles.col4, styles.sortable)}
            onClick={() => this.updateSort('numOfSubmissions')}
          >
            <span className={styles.filterItem}>
              <FontAwesomeIcon icon={faFile} className={styles.faIcon} />
              {this.renderSortIcon('numOfSubmissions')}
            </span>
          </div>
          <div
            className={cn(styles.col3)}
          >
            <span className={styles.filterItem}>
                      Status
              {this.renderSortIcon('status')}
            </span>
          </div>
          <div
            className={cn(styles.col3)}
          >
            <span className={styles.filterItem}>
              Phase
            </span>
          </div>
          {!isReadOnly ? (<div className={styles.col6}>&nbsp;</div>) : null}
          <div className={styles.col6}>&nbsp;</div>
          <div className={styles.col6}>&nbsp;</div>
          <div className={styles.col6}>&nbsp;</div>
        </div>

        {isLoading
          ? <Loader />
          : <>
            {challenges.length > 0
              ? <>
                <ul className={styles.challengeList}>
                  {map(challenges, c => {
                    return (
                      <li
                        className={styles.challengeItem}
                        key={`challenge-card-${c.id}`}
                      >
                        <ChallengeCard
                          shouldShowCurrentPhase={selectedTab === 0}
                          challenge={c}
                          setActiveProject={setActiveProject}
                          reloadChallengeList={this.reloadChallengeList}
                          partiallyUpdateChallengeDetails={
                            partiallyUpdateChallengeDetails
                          }
                          deleteChallenge={deleteChallenge}
                          isBillingAccountExpired={isBillingAccountExpired}
                          disableHover
                          getStatusText={this.getStatusTextFunc(selfService)}
                          challengeTypes={challengeTypes}
                          loginUserRoleInProject={loginUserRoleInProject}
                          auth={this.props.auth}
                        />
                      </li>
                    )
                  })}
                </ul>
              </> : (
                <NoChallenge activeProject={activeProject} selfService={selfService} />
              )
            }
        </>
        }

        <div className={styles.footer}>
          <div className={styles.perPageContainer}>
            <Select
              styles={styles}
              name='perPage'
              value={{ label: perPage, value: perPage }}
              placeholder='Per page'
              options={PAGINATION_PER_PAGE_OPTIONS}
              onChange={this.handlePerPageChange}
            />
          </div>
          <div className={styles.paginationContainer}>
            <Pagination
              activePage={page}
              itemsCountPerPage={perPage}
              totalItemsCount={totalChallenges}
              pageRangeDisplayed={5}
              onChange={this.handlePageChange}
              itemClass='page-item'
              linkClass='page-link'
            />
          </div>
        </div>
        {warningModal}
      </div>
    )
  }
}

ChallengeList.defaultProps = {
  isLoading: false,
  loginUserRoleInProject: ''
}

ChallengeList.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object),
  fetchNextProjects: PropTypes.func.isRequired,
  projects: PropTypes.arrayOf(PropTypes.object),
  activeProject: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  warnMessage: PropTypes.string,
  filterChallengeName: PropTypes.string,
  filterChallengeType: PropTypes.shape(),
  filterDate: PropTypes.shape(),
  filterSortBy: PropTypes.string,
  filterSortOrder: PropTypes.string,
  status: PropTypes.string,
  activeProjectId: PropTypes.number,
  filterProjectOption: PropTypes.shape(),
  loadChallengesByPage: PropTypes.func.isRequired,
  setActiveProject: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  totalChallenges: PropTypes.number.isRequired,
  partiallyUpdateChallengeDetails: PropTypes.func.isRequired,
  deleteChallenge: PropTypes.func.isRequired,
  isBillingAccountExpired: PropTypes.bool,
  billingStartDate: PropTypes.string,
  currentBillingAccount: PropTypes.number,
  updateProject: PropTypes.func.isRequired,
  isBillingAccountsLoading: PropTypes.bool,
  billingAccounts: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  isLoading: PropTypes.bool,
  billingEndDate: PropTypes.string,
  isBillingAccountLoadingFailed: PropTypes.bool,
  isBillingAccountLoading: PropTypes.bool,
  dashboard: PropTypes.bool,
  selfService: PropTypes.bool,
  auth: PropTypes.object.isRequired,
  challengeTypes: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loginUserRoleInProject: PropTypes.string
}

export default ChallengeList
