/* eslint jsx-a11y/no-static-element-interactions:0 */
/**
 * Resources tab component.
 */

import React from 'react'
import PT from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cn from 'classnames'
import { getTCMemberURL, CHALLENGE_STATUS } from '../../../config/constants'
import ReactSVG from 'react-svg'
import { getRatingLevel, sortList } from '../../../util/tc'
import { getCurrentPhase } from '../../../util/phase'
import styles from './styles.module.scss'
import ResourcesDeleteModal from '../ResourcesDeleteModal'

const assets = require.context('../../../assets/images', false, /svg/)
const ArrowDown = './arrow-down.svg'
const Trash = './ico-trash.svg'

function getSelectorStyle (selectedView, currentView) {
  return cn(styles['challenge-selector-common'], {
    [styles['challenge-selected-view']]: selectedView === currentView,
    [styles['challenge-unselected-view']]: selectedView !== currentView
  })
}

function formatDate (date) {
  if (!date) return '-'
  return moment(date)
    .local()
    .format('MMM DD, YYYY HH:mm')
}

const tabs = [
  {
    name: 'All',
    roles: null
  },
  {
    name: 'Submitters',
    roles: ['submitter']
  },
  {
    name: 'Reviewers',
    roles: ['reviewer']
  },
  {
    name: 'Managers, Copilots & Observers',
    roles: ['manager', 'copilot', 'observer']
  }
]

export default class Resources extends React.Component {
  constructor (props, context) {
    super(props, context)

    this.state = {
      sortedResources: [],
      resourcesSort: {
        field: '',
        sort: ''
      },
      selectedTab: 0,
      showDeleteResourceModal: null,
      exceptionResourceIdDeleteList: {}
    }

    this.sortResources = this.sortResources.bind(this)
    this.getResourcesSortParam = this.getResourcesSortParam.bind(this)
    this.updateSortedResources = this.updateSortedResources.bind(this)
    this.updateExceptionHandlesDelete = this.updateExceptionHandlesDelete.bind(this)
    this.onSortChange = this.onSortChange.bind(this)
    this.setSelectedTab = this.setSelectedTab.bind(this)
  }

  componentDidMount () {
    this.updateSortedResources()
    this.updateExceptionHandlesDelete()
  }

  componentDidUpdate (prevProps) {
    const {
      resources,
      resourcesSort,
      submissions,
      challenge,
      loggedInUserResource
    } = this.props
    if (
      !_.isEqual(prevProps.resources, resources) ||
      !_.isEqual(prevProps.resourcesSort, resourcesSort)
    ) {
      this.updateSortedResources()
    }
    if (
      !_.isEqual(prevProps.submissions, submissions) ||
      !_.isEqual(prevProps.challenge, challenge) ||
      !_.isEqual(prevProps.resources, resources) ||
      !_.isEqual(prevProps.loggedInUserResource, loggedInUserResource)
    ) {
      this.updateExceptionHandlesDelete()
    }
  }

  onSortChange (sort) {
    this.setState({
      resourcesSort: sort
    })
    this.updateSortedResources()
  }

  /**
   * Get registrans sort parameter
   */
  getResourcesSortParam () {
    const { resourcesSort } = this.state
    let { field, sort } = resourcesSort
    if (!field) {
      field = 'Registration Date' // default field for registrans sorting
    }
    if (!sort) {
      sort = 'asc' // default order for registrans sorting
    }

    return {
      field,
      sort
    }
  }

  /**
   * Update sorted registrant array
   */
  updateSortedResources () {
    const { resources } = this.props
    const { selectedTab } = this.state
    const roles = tabs[selectedTab].roles
    const sortedResources = _.cloneDeep(_.filter(resources, (rs) => {
      if (!roles) {
        return true
      }
      const matchRoles = _.filter(roles, role => `${rs.role}`.toLowerCase().indexOf(role) >= 0)
      return matchRoles.length > 0
    }))
    this.sortResources(sortedResources)
    this.setState({ sortedResources })
  }

  /**
   * Update exception handles delete
   */
  updateExceptionHandlesDelete () {
    const {
      submissions,
      challenge,
      resources,
      loggedInUserResource
    } = this.props
    const currentPhase = getCurrentPhase(challenge).toLowerCase()
    const isCurrentPhasesNotSubmissionOrRegistration = _.every(['submission', 'registration'], (phase) => currentPhase.indexOf(phase) < 0)
    const exceptionHandlesDeleteList = {}
    _.forEach(submissions, (s) => {
      // do not allow to delete submitters who submitted
      exceptionHandlesDeleteList[s.createdBy] = true
    })

    const exceptionResourceIdDeleteList = {}
    _.forEach(resources, (resourceItem) => {
      if (exceptionHandlesDeleteList[resourceItem.memberHandle]) {
        exceptionResourceIdDeleteList[resourceItem.id] = true
      }
      if (
        // if the challenge is in New or Draft status
        // we will allow removing reviewers and copilots
        _.some([
          CHALLENGE_STATUS.DRAFT,
          CHALLENGE_STATUS.NEW
        ], (status) => challenge.status.toUpperCase() === status)
      ) {
        if (
          // The creator of the challenge can't be deleted
          resourceItem.memberHandle === challenge.createdBy
        ) {
          // where the copilot has multiple roles, we should allow the additional roles to be deleted, but not the copilot role
          if (`${resourceItem.role}`.toLowerCase().indexOf('copilot') >= 0) {
            exceptionResourceIdDeleteList[resourceItem.id] = true
          }
        } else if (
          // Copilots can't delete themselves from the challenge
          loggedInUserResource &&
          _.some(loggedInUserResource.roles, (role) => `${role}`.toLowerCase().indexOf('copilot') >= 0) &&
          loggedInUserResource.memberHandle === resourceItem.memberHandle
        ) {
          exceptionResourceIdDeleteList[resourceItem.id] = true
        }
      } else if (
        // The creator of the challenge can't be deleted
        resourceItem.memberHandle === challenge.createdBy
      ) {
        exceptionResourceIdDeleteList[resourceItem.id] = true
      } else if (
        // If the current phase is not submission or registration
        // then we will disable removing reviewers and copilots.
        _.some(['reviewer', 'copilot'], (role) => `${resourceItem.role}`.toLowerCase().indexOf(role) >= 0) &&
        isCurrentPhasesNotSubmissionOrRegistration
      ) {
        exceptionResourceIdDeleteList[resourceItem.id] = true
      }
    })
    this.setState({ exceptionResourceIdDeleteList })
  }

  /**
   * Sort array of registrant
   * @param {Array} resources array of registrant
   */
  sortResources (resources) {
    const { field, sort } = this.getResourcesSortParam()
    return sortList(resources, field, sort, (a, b) => {
      let valueA = 0
      let valueB = 0
      let valueIsString = false
      switch (field) {
        case 'Role': {
          valueA = a.role
          valueB = b.role
          break
        }
        case 'Handle': {
          valueA = `${a.memberHandle}`.toLowerCase()
          valueB = `${b.memberHandle}`.toLowerCase()
          valueIsString = true
          break
        }
        case 'Email': {
          valueA = `${a.email}`.toLowerCase()
          valueB = `${b.email}`.toLowerCase()
          valueIsString = true
          break
        }
        case 'Registration Date': {
          valueA = new Date(a.created)
          valueB = new Date(b.created)
          break
        }
        default:
      }

      return {
        valueA,
        valueB,
        valueIsString
      }
    })
  }

  setSelectedTab (selectedTab) {
    const { resourcesSort } = this.state
    this.setState({ selectedTab })

    setTimeout(() => {
      this.onSortChange(resourcesSort)
    })
  }

  render () {
    const { challenge, canEditResource, deleteResource } = this.props
    const { track } = challenge

    const { sortedResources, selectedTab, showDeleteResourceModal, exceptionResourceIdDeleteList } = this.state

    const { field, sort } = this.getResourcesSortParam()
    const revertSort = sort === 'desc' ? 'asc' : 'desc'
    const isDesign = track.toLowerCase() === 'design'

    return (
      <div>
        <div className={styles['challenge-view-selector']}>
          {tabs.map((t, index) => (<a
            tabIndex={index}
            role='tab'
            aria-selected={selectedTab === index}
            onClick={e => {
              this.setSelectedTab(index)
            }}
            onKeyPress={e => {
              this.setSelectedTab(index)
            }}
            className={getSelectorStyle(selectedTab, index)}
          >
            {t.name}
          </a>))}
        </div>
        <div
          className={cn(styles.containerTable)}
        >
          <table
            aria-label='Resources'
          >
            <thead className={styles.headTable} role='row'>
              <tr>
                {!isDesign && (
                  <th>
                    <button
                      type='button'
                      onClick={() => {
                        this.onSortChange({
                          field: 'Role',
                          sort: field === 'Role' ? revertSort : 'desc'
                        })
                      }}
                      className={cn(styles['col-2Table'], styles['table-header'])}
                    >
                      <span role='columnheader'>Role</span>
                      <div
                        className={cn(styles['col-arrow'], {
                          [styles['col-arrow-sort-asc']]:
                            field === 'Role' && sort === 'asc',
                          [styles['col-arrow-is-sorting']]: field === 'Role'
                        })}
                        type='button'
                      >
                        <ReactSVG
                          path={assets(`${ArrowDown}`)}
                        />
                      </div>
                    </button>
                  </th>
                )}
                <th>
                  <button
                    onClick={() => {
                      this.onSortChange({
                        field: 'Handle',
                        sort: field === 'Handle' ? revertSort : 'desc'
                      })
                    }}
                    type='button'
                    className={cn(styles['col-3Table'], styles['table-header'])}
                  >
                    <span role='columnheader'>Handle</span>
                    <div
                      className={cn(styles['col-arrow'], {
                        [styles['col-arrow-sort-asc']]:
                          field === 'Handle' && sort === 'asc',
                        [styles['col-arrow-is-sorting']]: field === 'Handle'
                      })}
                    >
                      <ReactSVG path={assets(`${ArrowDown}`)} />
                    </div>
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => {
                      this.onSortChange({
                        field: 'Email',
                        sort: field === 'Email' ? revertSort : 'desc'
                      })
                    }}
                    type='button'
                    className={cn(styles['col-7Table'], styles['table-header'])}
                  >
                    <span role='columnheader'>Email</span>
                    <div
                      className={cn(styles['col-arrow'], {
                        [styles['col-arrow-sort-asc']]:
                          field === 'Email' && sort === 'asc',
                        [styles['col-arrow-is-sorting']]: field === 'Email'
                      })}
                    >
                      <ReactSVG path={assets(`${ArrowDown}`)} />
                    </div>
                  </button>
                </th>
                <th>
                  <button
                    className={cn(styles['col-4Table'], styles['table-header'])}
                    onClick={() => {
                      this.onSortChange({
                        field: 'Registration Date',
                        sort: field === 'Registration Date' ? revertSort : 'desc'
                      })
                    }}
                    type='button'
                  >
                    <span role='columnheader'>Registration Date</span>
                    <div
                      className={cn(styles['col-arrow'], {
                        [styles['col-arrow-sort-asc']]:
                          field === 'Registration Date' && sort === 'asc',
                        [styles['col-arrow-is-sorting']]: field === 'Registration Date'
                      })}
                    >
                      <ReactSVG path={assets(`${ArrowDown}`)} />
                    </div>
                  </button>
                </th>

                {canEditResource ? (<th
                  className={cn(styles['col-8Table'])}
                >
                  <span>Actions</span>
                </th>) : null}
              </tr>
            </thead>
            <tbody role='rowgroup'>
              {sortedResources.map(r => {
                return (
                  <tr className={styles.rowTable} key={r.id} role='row'>
                    <td className={styles['col-2Table']}>
                      <span role='cell'>{r.role}</span>
                    </td>
                    <td className={styles['col-3Table']}>
                      <span role='cell'>
                        <a
                          href={getTCMemberURL(r.memberHandle)}

                          className={cn({
                            [styles[`level-${getRatingLevel(_.get(r, 'rating', 0))}`]]: !isDesign
                          })}
                          target={`${
                            _.includes(window.origin, 'www') ? '_self' : '_blank'
                          }`}
                        >
                          {r.memberHandle}
                        </a>
                      </span>
                    </td>
                    <td className={styles['col-7Table']}>
                      <span role='cell'>{r.email}</span>
                    </td>
                    <td className={styles['col-4']}>
                      <span role='cell'>{formatDate(r.created)}</span>
                    </td>

                    {(canEditResource && !exceptionResourceIdDeleteList[r.id]) ? (
                      <td className={cn(styles['col-8Table'], styles['col-bodyTable'])}>
                        <button
                          onClick={() => {
                            this.setState({
                              showDeleteResourceModal: r
                            })
                          }}
                        >
                          <ReactSVG path={assets(`${Trash}`)} />
                        </button>
                      </td>) : null}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {showDeleteResourceModal ? (<ResourcesDeleteModal
          onClose={() => this.setState({ showDeleteResourceModal: null })}
          resource={showDeleteResourceModal}
          deleteResource={deleteResource}
        />) : null}
      </div>
    )
  }
}

Resources.defaultProps = {
  results: [],
  checkpointResults: {},
  resourcesSort: {},
  submissions: [],
  loggedInUserResource: null
}

Resources.propTypes = {
  challenge: PT.shape({
    phases: PT.arrayOf(
      PT.shape({
        actualEndDate: PT.string,
        name: PT.string.isRequired,
        scheduledEndDate: PT.string
      })
    ).isRequired,
    checkpoints: PT.arrayOf(PT.shape()),
    subTrack: PT.any,
    prizeSets: PT.arrayOf(PT.shape()).isRequired,
    resources: PT.arrayOf(PT.shape()).isRequired,
    round1Introduction: PT.string,
    round2Introduction: PT.string,
    type: PT.string,
    track: PT.string,
    status: PT.string,
    createdBy: PT.string
  }).isRequired,
  submissions: PT.arrayOf(PT.shape()),
  resources: PT.arrayOf(PT.shape()),
  resourcesSort: PT.shape({
    field: PT.string,
    sort: PT.string
  }),
  canEditResource: PT.bool.isRequired,
  deleteResource: PT.func.isRequired,
  loggedInUserResource: PT.any
}
