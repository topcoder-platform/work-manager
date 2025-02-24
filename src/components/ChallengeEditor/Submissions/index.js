/* eslint jsx-a11y/no-static-element-interactions:0 */
/**
 * Submissions tab component.
 */

import React from 'react'
import PT from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import { STUDIO_URL, SUBMISSION_REVIEW_APP_URL, getTCMemberURL } from '../../../config/constants'
import { OutlineButton, PrimaryButton } from '../../Buttons'
import AlertModal from '../../Modal/AlertModal'
import cn from 'classnames'
import ReactSVG from 'react-svg'
import {
  getRatingLevel,
  sortList,
  getProvisionalScore,
  getFinalScore,
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
const assets = require.context('../../../assets/images', false, /svg/)
const ArrowDown = './arrow-down.svg'
const Lock = './lock.svg'
const Download = './IconSquareDownload.svg'

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
      sortedSubmissions: [],
      downloadingAll: false,
      alertMessage: '',
      selectedSubmissionId: ''
    }
    this.getSubmissionsSortParam = this.getSubmissionsSortParam.bind(this)
    this.updateSortedSubmissions = this.updateSortedSubmissions.bind(this)
    this.sortSubmissions = this.sortSubmissions.bind(this)
    this.onSortChange = this.onSortChange.bind(this)
    this.checkIsReviewPhaseComplete = this.checkIsReviewPhaseComplete.bind(
      this
    )
  }

  componentDidMount () {
    this.updateSortedSubmissions()
  }

  /**
   * Get submission sort parameter
   */
  getSubmissionsSortParam () {
    const { submissionsSort } = this.state
    let { field, sort } = submissionsSort
    if (!field) {
      field = 'Submission Date' // default field for submission sorting
    }

    if (!sort) {
      sort = 'asc' // default order for submission sorting
    }

    return {
      field,
      sort
    }
  }

  /**
   * Update sorted submission array
   */
  updateSortedSubmissions () {
    const { submissions } = this.props
    const sortedSubmissions = _.cloneDeep(submissions)
    this.sortSubmissions(sortedSubmissions)
    this.setState({ sortedSubmissions })
  }

  /**
   * Sort array of submission
   * @param {Array} submissions array of submission
   */
  sortSubmissions (submissions) {
    const { field, sort } = this.getSubmissionsSortParam()
    let isHaveFinalScore = false
    if (field === 'Initial / Final Score') {
      isHaveFinalScore = _.some(
        submissions,
        s => !_.isNil(s.reviewSummation && s.reviewSummation[0].aggregateScore)
      )
    }
    return sortList(submissions, field, sort, (a, b) => {
      let valueA = 0
      let valueB = 0
      let valueIsString = false
      switch (field) {
        case 'Country': {
          valueA = a.registrant ? a.registrant.countryCode : ''
          valueB = b.registrant ? b.registrant.countryCode : ''
          valueIsString = true
          break
        }
        case 'Rating': {
          valueA = a.registrant ? a.registrant.rating : 0
          valueB = b.registrant ? b.registrant.rating : 0
          break
        }
        case 'Username': {
          valueA = _.get(a.registrant, 'memberHandle', '').toLowerCase()
          valueB = _.get(b.registrant, 'memberHandle', '').toLowerCase()
          valueIsString = true
          break
        }
        case 'Email': {
          valueA = _.get(a.registrant, 'email', '').toLowerCase()
          valueB = _.get(b.registrant, 'email', '').toLowerCase()
          valueIsString = true
          break
        }
        case 'Time':
          valueA = new Date(a.submissions && a.submissions[0].submissionTime)
          valueB = new Date(b.submissions && b.submissions[0].submissionTime)
          break
        case 'Submission Date': {
          valueA = new Date(a.created)
          valueB = new Date(b.created)
          break
        }
        case 'Initial / Final Score': {
          if (isHaveFinalScore) {
            valueA = getFinalScore(a)
            valueB = getFinalScore(b)
          } else {
            valueA = !_.isEmpty(a.review) && a.review[0].score
            valueB = !_.isEmpty(b.review) && b.review[0].score
          }
          break
        }
        case 'Final Rank': {
          if (this.checkIsReviewPhaseComplete()) {
            valueA = a.finalRank ? a.finalRank : 0
            valueB = b.finalRank ? b.finalRank : 0
          }
          break
        }
        case 'Provisional Rank': {
          valueA = a.provisionalRank ? a.provisionalRank : 0
          valueB = b.provisionalRank ? b.provisionalRank : 0
          break
        }
        case 'Final Score': {
          valueA = getFinalScore(a)
          valueB = getFinalScore(b)
          break
        }
        case 'Provisional Score': {
          valueA = getProvisionalScore(a)
          valueB = getProvisionalScore(b)
          break
        }
        default:
      }

      if (valueIsString === false) {
        if (valueA === '-') valueA = 0
        if (valueB === '-') valueB = 0
      }

      return {
        valueA,
        valueB,
        valueIsString
      }
    })
  }

  onSortChange (sort) {
    this.setState({
      submissionsSort: sort
    })
    this.updateSortedSubmissions()
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
      selectedSubmissionId: ''
    })
  }

  render () {
    const { challenge, token, loggedInUserResource } = this.props
    const { checkpoints, track, type, tags } = challenge
    const canDownloadSubmission =
      (loggedInUserResource && checkDownloadSubmissionRoles(loggedInUserResource.roles)) ||
      checkAdmin(token)

    const { field, sort } = this.getSubmissionsSortParam()
    const revertSort = sort === 'desc' ? 'asc' : 'desc'

    const { sortedSubmissions, downloadingAll, alertMessage } = this.state

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
    _.forEach(sortedSubmissions, s => {
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
              {sortedSubmissions.map(renderSubmission)}
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
                      <button
                        type='button'
                        onClick={() => {
                          this.onSortChange({
                            field: 'Rating',
                            sort: field === 'Rating' ? revertSort : 'desc'
                          })
                        }}
                        className={cn(styles['col-2Table'], styles['header-sort'])}
                      >
                        <span>Rating</span>
                        <div
                          className={cn(styles['col-arrow'], {
                            [styles['col-arrow-sort-asc']]:
                              field === 'Rating' && sort === 'asc',
                            [styles['col-arrow-is-sorting']]: field === 'Rating'
                          })}
                        >
                          <ReactSVG path={assets(`${ArrowDown}`)} />
                        </div>
                      </button>
                    </th>
                  )}
                  <th>
                    <button
                      type='button'
                      onClick={() => {
                        this.onSortChange({
                          field: 'Username',
                          sort: field === 'Username' ? revertSort : 'desc'
                        })
                      }}
                      className={cn(styles['col-3Table'], styles['header-sort'])}
                    >
                      <span>Username</span>
                      <div
                        className={cn(styles['col-arrow'], {
                          [styles['col-arrow-sort-asc']]: field === 'Username' && sort === 'asc',
                          [styles['col-arrow-is-sorting']]: field === 'Username'
                        })}
                      >
                        <ReactSVG path={assets(`${ArrowDown}`)} />
                      </div>
                    </button>
                  </th>
                  <th>
                    <button
                      type='button'
                      onClick={() => {
                        this.onSortChange({
                          field: 'Email',
                          sort: field === 'Email' ? revertSort : 'desc'
                        })
                      }}
                      className={cn(styles['col-9Table'], styles['header-sort'])}
                    >
                      <span>Email</span>
                      <div
                        className={cn(styles['col-arrow'], {
                          [styles['col-arrow-sort-asc']]: field === 'Email' && sort === 'asc',
                          [styles['col-arrow-is-sorting']]: field === 'Email'
                        })}
                      >
                        <ReactSVG path={assets(`${ArrowDown}`)} />
                      </div>
                    </button>
                  </th>
                  <th>
                    <button
                      type='button'
                      onClick={() => {
                        this.onSortChange({
                          field: 'Submission Date',
                          sort: field === 'Submission Date' ? revertSort : 'desc'
                        })
                      }}
                      className={cn(styles['col-4Table'], styles['header-sort'])}
                    >
                      <span>Submission Date</span>
                      <div
                        className={cn(styles['col-arrow'], {
                          [styles['col-arrow-sort-asc']]: field === 'Submission Date' && sort === 'asc',
                          [styles['col-arrow-is-sorting']]: field === 'Submission Date'
                        })}
                      >
                        <ReactSVG path={assets(`${ArrowDown}`)} />
                      </div>
                    </button>
                  </th>
                  <th>
                    <button
                      type='button'
                      onClick={() => {
                        this.onSortChange({
                          field: 'Initial / Final Score',
                          sort: field === 'Initial / Final Score' ? revertSort : 'desc'
                        })
                      }}
                      className={cn(styles['col-5Table'], styles['header-sort'])}
                    >
                      <span>Initial / Final Score</span>
                      <div
                        className={cn('col-arrow', {
                          'col-arrow-sort-asc':
                            field === 'Initial / Final Score' && sort === 'asc',
                          'col-arrow-is-sorting': field === 'Initial / Final Score'
                        })}
                      >
                        <ReactSVG path={assets(`${ArrowDown}`)} />
                      </div>
                    </button>
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
                {sortedSubmissions.map(s => {
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
                          <button
                            className={styles['download-submission-button']}
                            onClick={() => {
                              // download submission
                              const reactLib = getTopcoderReactLib()
                              const { getService } = reactLib.services.submissions
                              const submissionsService = getService(token)
                              submissionsService.downloadSubmission(s.id)
                                .then((blob) => {
                                  isValidDownloadFile(blob).then((isValidFile) => {
                                    if (isValidFile.success) {
                                      // eslint-disable-next-line no-undef
                                      const url = window.URL.createObjectURL(new Blob([blob]))
                                      const link = document.createElement('a')
                                      link.href = url
                                      let fileName = s.legacySubmissionId
                                      if (!fileName) {
                                        fileName = s.id
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
                            }}
                          >
                            <ReactSVG path={assets(`${Download}`)} />
                          </button>

                          <OutlineButton
                            text='Download Artifacts'
                            type='info'
                            className={styles['download-artifacts-button']}
                            onClick={async () => {
                              this.setState({ selectedSubmissionId: s.id })
                            }}
                          />
                        </div>
                      </td>) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {
            this.state.selectedSubmissionId ? (
              <ArtifactsListModal
                submissionId={this.state.selectedSubmissionId}
                token={this.props.token}
                theme={theme}
                onClose={() => {
                  this.setState({
                    selectedSubmissionId: ''
                  })
                }}
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
                    if (downloadedFile === sortedSubmissions.length) {
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
                  _.forEach(sortedSubmissions, (submission) => {
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
  loggedInUserResource: PT.any
}

export default SubmissionsComponent
