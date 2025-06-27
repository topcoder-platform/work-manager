/* eslint jsx-a11y/no-static-element-interactions:0 */
/**
 * Submissions tab component.
 */

import React from 'react'
import PT from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import { PAGINATION_PER_PAGE_OPTIONS, STUDIO_URL, SUBMISSION_REVIEW_APP_URL, getTCMemberURL } from '../../../config/constants'
import { PrimaryButton } from '../../Buttons'
import AlertModal from '../../Modal/AlertModal'
import cn from 'classnames'
import ReactSVG from 'react-svg'
import {
  getRatingLevel,
  checkDownloadSubmissionRoles,
  checkAdmin
} from '../../../util/tc'
import {
  getTopcoderReactLib,
  isValidDownloadFile
} from '../../../util/topcoder-react-lib'
import {
  compressFiles
} from '../../../util/files'
import styles from './Submissions.module.scss'
import modalStyles from '../../../styles/modal.module.scss'
import { ArtifactsListModal } from '../ArtifactsListModal'
import Tooltip from '../../Tooltip'
import { RatingsListModal } from '../RatingsListModal'
import Select from '../../Select'
import Pagination from 'react-js-pagination'
const assets = require.context('../../../assets/images', false, /svg/)
const Lock = './lock.svg'
const Download = './IconSquareDownload.svg'
const DownloadArtifact = './IconDownloadArtifacts.svg'
const ReviewRatingList = './IconReviewRatingList.svg'

const theme = {
  container: modalStyles.modalContainer
}

class SubmissionsComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      submissionsSort: {
        field: '',
        sort: ''
      },
      isShowInformation: false,
      memberOfModal: '',
      submissions: [],
      downloadingAll: false,
      alertMessage: '',
      selectedSubmissionId: '',
      showArtifactsListModal: false,
      showRatingsListModal: false
    }
    this.checkIsReviewPhaseComplete = this.checkIsReviewPhaseComplete.bind(
      this
    )
    this.downloadSubmission = this.downloadSubmission.bind(this)
    this.handlePageChange = this.handlePageChange.bind(this)
    this.handlePerPageChange = this.handlePerPageChange.bind(this)
  }

  /**
   * Check if review phase complete
   */
  checkIsReviewPhaseComplete () {
    const { challenge } = this.props

    const allPhases = challenge.phases || []

    let isReviewPhaseComplete = false
    _.forEach(allPhases, phase => {
      if (
        phase.name === 'Review' &&
        !phase.isOpen &&
        moment(phase.scheduledStartDate).isBefore()
      ) {
        isReviewPhaseComplete = true
      }
    })
    return isReviewPhaseComplete
  }

  closeArtifactsModal () {
    this.setState({
      selectedSubmissionId: '',
      showArtifactsListModal: false
    })
  }

  async downloadSubmission (submission) {
    // download submission
    const reactLib = getTopcoderReactLib()
    const { getService } = reactLib.services.submissions
    const submissionsService = getService(this.props.token)
    submissionsService.downloadSubmission(submission.id)
      .then((blob) => {
        isValidDownloadFile(blob).then((isValidFile) => {
          if (isValidFile.success) {
            // eslint-disable-next-line no-undef
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            let fileName = submission.legacySubmissionId
            if (!fileName) {
              fileName = submission.id
            }
            fileName = fileName + '.zip'
            link.setAttribute('download', `${fileName}`)
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
          } else {
            this.setState({
              alertMessage: isValidFile.message || 'Can not download this submission.'
            })
          }
        })
      })
  }

  /**
   * Update filter for getting project by pagination
   * @param {Number} perPageNumber per page number
   */
  handlePerPageChange (option) {
    const perPageNumber = option.value
    const {
      submissionsPerPage,
      loadSubmissions,
      challenge: {
        id
      }
    } = this.props

    if (submissionsPerPage !== perPageNumber) {
      loadSubmissions(id, {
        page: 1,
        perPage: perPageNumber
      })
    }
  }

  /**
   * Update filter for getting project by pagination
   * @param {Number} pageNumber page number
   */
  async handlePageChange (pageNumber) {
    const {
      page,
      submissionsPerPage,
      loadSubmissions,
      challenge: {
        id
      }
    } = this.props

    if (page !== pageNumber) {
      loadSubmissions(id, {
        page: pageNumber,
        perPage: submissionsPerPage
      })
    }
  }

  render () {
    const { challenge, token, loggedInUserResource, page, submissionsPerPage, totalSubmissions, submissions } = this.props
    const { checkpoints, track, type, tags } = challenge
    const canDownloadSubmission =
      (loggedInUserResource && checkDownloadSubmissionRoles(loggedInUserResource.roles)) ||
      checkAdmin(token)

    const { downloadingAll, alertMessage } = this.state

    const renderSubmission = s => (
      <div className={styles.submission} key={s.id}>
        <a
          href={`${STUDIO_URL}?module=DownloadSubmission&sbmid=${s.id}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <img
            alt=''
            src={`${STUDIO_URL}/studio.jpg?module=DownloadSubmission&sbmid=${s.id}&sbt=small&sfi=1`}
          />
        </a>
        <div className={styles['bottom-info']}>
          <div className={styles['links']}>
            <a
              href={`${STUDIO_URL}?module=DownloadSubmission&sbmid=${s.id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              {`#${s.id}`}
            </a>
            <a
              href={getTCMemberURL(_.get(s.registrant, 'memberHandle', ''))}
              target={`${
                _.includes(window.origin, 'www') ? '_self' : '_blank'
              }`}
              rel='noopener noreferrer'
              className={cn(styles[`level-${getRatingLevel(_.get(s.registrant, 'rating', 0))}`])} >
              {_.get(s.registrant, 'memberHandle', '')}
            </a>
          </div>
          <div>{moment(s.submissionTime).format('MMM DD,YYYY HH:mm')}</div>
        </div>
      </div>
    )

    const isF2F = type === 'First2Finish'
    const isBugHunt = _.includes(tags, 'Bug Hunt')

    // copy colorStyle from registrants to submissions
    _.forEach(submissions, s => {
      if (s.registrant && s.registrant.colorStyle && !s.colorStyle) {
        const { colorStyle } = s.registrant
        /* eslint-disable no-param-reassign */
        s.colorStyle = JSON.parse(
          colorStyle.replace(/(\w+):\s*([^;]*)/g, '{"$1": "$2"}')
        )
        /* eslint-enable no-param-reassign */
      }

      if (s.registrant && s.registrant.rating && !s.rating) {
        const { rating } = s.registrant
        /* eslint-disable no-param-reassign */
        s.rating = rating
        /* eslint-enable no-param-reassign */
      }
    })

    let checkpointsUI = null
    if (track.toLowerCase() === 'design') {
      if (challenge.submissionViewable === 'true') {
        checkpointsUI = (
          <div className={cn(styles.container, styles.view)}>
            <div className={styles['title']}>ROUND 2 (FINAL) SUBMISSIONS</div>
            <div className={styles['content']}>
              {submissions.map(renderSubmission)}
            </div>
            {checkpoints.length > 0 && (
              <div className={styles['title']}>
                ROUND 1 (CHECKPOINT) SUBMISSIONS
              </div>
            )}
            {checkpoints.length > 0 && (
              <div className={styles['content']}>
                {checkpoints.map(renderSubmission)}
              </div>
            )}
          </div>
        )
      } else if (!canDownloadSubmission) {
        return (
          <div className={cn(styles['container'], styles['no-view'])}>
            <ReactSVG className={styles['lock']} path={assets(`${Lock}`)} />
            <div className={styles['title']}>Private Challenge</div>
            <div className={styles['subtitle']}>
              Submissions are not viewable for this challenge
            </div>
            <div className={styles['desc']}>
              There are many reason why the submissions may not be viewable, such
              as the allowance of stock art, or a client&apos;s desire to keep the
              work private.
            </div>
          </div>
        )
      }
    }

    return (
      <>
        {checkpointsUI}

        <div className={cn(styles.container, styles.dev, styles['non-mm'])}>
          {canDownloadSubmission ? (<div className={styles['empty-left']} />) : null}
          <div className={styles.submissionsContainerTable}>
            <table>
              <thead className={styles.headTable}>
                <tr>
                  {!isF2F && !isBugHunt && (
                    <th>
                      <span>Rating</span>
                    </th>
                  )}
                  <th>
                    <span>Username</span>
                  </th>
                  <th>
                    <span>Email</span>
                  </th>
                  <th>
                    <span>Submission Date</span>
                  </th>
                  <th>
                    <span>Initial / Final Score</span>
                  </th>
                  <th
                    className={cn(styles['col-6Table'])}
                  >
                    <span>Submission ID (UUID)</span>
                  </th>
                  <th
                    className={cn(styles['col-7Table'])}
                  >
                    <span>Legacy submission ID</span>
                  </th>
                  {canDownloadSubmission ? (<th
                    className={cn(styles['col-8Table'])}
                  >
                    <span>Actions</span>
                  </th>) : null}
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => {
                  const rating = s.registrant && !_.isNil(s.registrant.rating)
                    ? s.registrant.rating
                    : '-'
                  const memberHandle = _.get(s.registrant, 'memberHandle', '')
                  const email = _.get(s.registrant, 'email', '')
                  const submissionDate = moment(s.created).format('MMM DD, YYYY HH:mm')
                  return (
                    <tr
                      key={_.get(s.registrant, 'memberHandle', '') + s.created}
                      className={styles.rowTable}
                    >
                      {!isF2F && !isBugHunt && (
                        <td
                          className={cn(styles['col-2Table'], styles['col-bodyTable'], styles[`level-${getRatingLevel(_.get(s.registrant, 'rating', 0))}`])}
                        >
                          <span title={rating}>
                            {rating}
                          </span>
                        </td>
                      )}
                      <td className={cn(styles['col-3Table'], styles['col-bodyTable'])}>
                        <a
                          title={memberHandle}
                          href={`${window.origin}/members/${_.get(
                            s.registrant,
                            'memberHandle',
                            ''
                          )}`}
                          target={`${
                            _.includes(window.origin, 'www') ? '_self' : '_blank'
                          }`}
                          rel='noopener noreferrer'
                          className={cn(
                            styles['handle'],
                            styles[`level-${getRatingLevel(_.get(s.registrant, 'rating', 0))}`]
                          )}
                        >
                          {memberHandle}
                        </a>
                      </td>
                      <td className={cn(styles['col-9Table'], styles['col-bodyTable'])}>
                        <span title={email}>
                          {email}
                        </span>
                      </td>
                      <td className={cn(styles['col-4Table'], styles['col-bodyTable'])}>
                        <span title={submissionDate}>
                          {submissionDate}
                        </span>
                      </td>
                      <td className={cn(styles['col-5Table'], styles['col-bodyTable'])}>
                        <a href={`${SUBMISSION_REVIEW_APP_URL}/${challenge.legacyId}/submissions/${s.id} `} target='_blank'>
                          {!_.isEmpty(s.review) && s.review[0].score
                            ? parseFloat(s.review[0].score).toFixed(2)
                            : 'N/A'}
                          &zwnj; &zwnj;/ &zwnj;
                          {s.reviewSummation && s.reviewSummation[0].aggregateScore
                            ? parseFloat(s.reviewSummation[0].aggregateScore).toFixed(2)
                            : 'N/A'}
                        </a>
                      </td>
                      <td className={cn(styles['col-6Table'], styles['col-bodyTable'])}>
                        <span title={s.id}>
                          {s.id}
                        </span>
                      </td>
                      <td className={cn(styles['col-7Table'], styles['col-bodyTable'])}>
                        <span title={s.legacySubmissionId}>
                          {s.legacySubmissionId}
                        </span>
                      </td>
                      {canDownloadSubmission ? (<td className={cn(styles['col-8Table'], styles['col-bodyTable'])}>
                        <div className={styles['button-wrapper']}>
                          <Tooltip content='Download Submission'>
                            <button
                              className={styles['download-submission-button']}
                              onClick={() => this.downloadSubmission(s)}
                            >
                              <ReactSVG path={assets(`${Download}`)} />
                            </button>
                          </Tooltip>

                          <Tooltip content='Download Submission Artifacts' closeOnClick>
                            <button
                              className={styles['download-submission-button']}
                              onClick={async () => {
                                this.setState({ selectedSubmissionId: s.id, showArtifactsListModal: true })
                              }}
                            >
                              <ReactSVG path={assets(`${DownloadArtifact}`)} />
                            </button>
                          </Tooltip>

                          <Tooltip content='Ratings' closeOnClick>
                            <button
                              className={styles['download-submission-button']}
                              onClick={() => {
                                this.setState({ selectedSubmissionId: s.id, showRatingsListModal: true })
                              }}
                            >
                              <ReactSVG path={assets(`${ReviewRatingList}`)} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {
            this.state.showArtifactsListModal ? (
              <ArtifactsListModal
                submissionId={this.state.selectedSubmissionId}
                token={this.props.token}
                theme={theme}
                onClose={() => {
                  this.setState({
                    selectedSubmissionId: '',
                    showArtifactsListModal: false
                  })
                }}
              />
            ) : null
          }

          {
            this.state.showRatingsListModal ? (
              <RatingsListModal
                token={this.props.token}
                theme={theme}
                onClose={() => {
                  this.setState({ showRatingsListModal: false })
                }}
                submissionId={this.state.selectedSubmissionId}
                challengeId={this.props.challenge.id}
              />
            ) : null
          }

          {canDownloadSubmission ? (<div className={styles['top-title']} >

            <div className={styles.btnManageSubmissions} >
              <PrimaryButton
                text='Download All'
                type='info'
                disabled={downloadingAll}
                onClick={async () => {
                  const reactLib = getTopcoderReactLib()
                  const { getService } = reactLib.services.submissions
                  // download submission
                  this.setState({
                    downloadingAll: true
                  })
                  const submissionsService = getService(token)
                  const allFiles = []
                  let downloadedFile = 0
                  const checkToCompressFiles = () => {
                    if (downloadedFile === submissions.length) {
                      if (downloadedFile > 0) {
                        compressFiles(allFiles, 'all-submissions.zip', () => {
                          this.setState({
                            downloadingAll: false
                          })
                        })
                      } else {
                        this.setState({
                          downloadingAll: false
                        })
                      }
                    }
                  }
                  checkToCompressFiles()
                  _.forEach(submissions, (submission) => {
                    let fileName = submission.legacySubmissionId
                    if (!fileName) {
                      fileName = submission.id
                    }
                    fileName = fileName + '.zip'
                    submissionsService.downloadSubmission(submission.id)
                      .then((blob) => {
                        isValidDownloadFile(blob).then((isValidFile) => {
                          if (isValidFile.success) {
                            const file = new window.File([blob], `${fileName}`)
                            allFiles.push(file)
                          }
                          downloadedFile += 1
                          checkToCompressFiles()
                        })
                      }).catch(() => {
                        downloadedFile += 1
                        checkToCompressFiles()
                      })
                  })
                }}
              />
            </div>
          </div>) : null}
        </div>

        <div className={styles.paginationWrapper}>
          <div className={styles.perPageContainer}>
            <Select
              styles={styles}
              name='perPage'
              value={{ label: submissionsPerPage, value: submissionsPerPage }}
              placeholder='Per page'
              options={PAGINATION_PER_PAGE_OPTIONS}
              onChange={this.handlePerPageChange}
            />
          </div>
          <div className={styles.paginationContainer}>
            <Pagination
              activePage={page}
              itemsCountPerPage={submissionsPerPage}
              totalItemsCount={totalSubmissions}
              pageRangeDisplayed={5}
              onChange={this.handlePageChange}
              itemClass='page-item'
              linkClass='page-link'
            />
          </div>
        </div>

        {alertMessage ? (
          <AlertModal
            title=''
            message={alertMessage}
            theme={theme}
            closeText='OK'
            onClose={() => {
              this.setState({
                alertMessage: ''
              })
            }}
          />
        ) : null}
      </>
    )
  }
}

SubmissionsComponent.defaultProps = {
  submissions: [],
  token: '',
  loggedInUserResource: null
}

SubmissionsComponent.propTypes = {
  challenge: PT.shape({
    id: PT.any,
    checkpoints: PT.arrayOf(PT.object),
    submissions: PT.arrayOf(PT.object),
    submissionViewable: PT.string,
    track: PT.string.isRequired,
    type: PT.string.isRequired,
    tags: PT.arrayOf(PT.string),
    registrants: PT.any,
    phases: PT.any
  }).isRequired,
  submissions: PT.arrayOf(PT.shape()),
  token: PT.string,
  loggedInUserResource: PT.any,
  page: PT.number,
  submissionsPerPage: PT.number,
  totalSubmissions: PT.number,
  loadSubmissions: PT.func
}

export default SubmissionsComponent
