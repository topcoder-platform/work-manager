/**
 * Component to render submission details
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faDownload } from '@fortawesome/free-solid-svg-icons'
import cn from 'classnames'
import Table from '../../Table'
import Handle from '../../Handle'
import Loader from '../../Loader'
import { downloadSubmissionURL, SUBMISSION_DETAILS_TABS, downloadSubmissionArtifactURL } from '../../../config/constants'
import NoRecords from './NoRecords'
import styles from './SubmissionDetails.module.scss'

// Table options for review list
const reviewOptions = [
  {
    name: 'Review Type',
    width: 6,
    bgColor: 'white'
  },
  {
    name: 'Reviewer',
    width: 5,
    bgColor: 'white'
  },
  {
    name: 'Score',
    width: 3,
    bgColor: 'white'
  },
  {
    name: 'Status',
    width: 1,
    bgColor: 'white'
  }
]

const artifactOptions = [
  {
    name: 'Artifact ID',
    width: 11,
    bgColor: 'white'
  },
  {
    name: 'Action',
    width: 4,
    bgColor: 'white'
  }
]

function formattedScore (score) {
  if (typeof score === 'number') {
    return score.toFixed(2)
  } else {
    return score
  }
}

const SubmissionDetails = ({
  submissionId,
  submissionDetails,
  challengeId,
  isSubmissionLoading,
  downloadToken,
  currentTab,
  isArtifactsLoading,
  submissionArtifacts,
  switchTab
}) => {
  const { review, reviewSummation } = submissionDetails
  const { artifacts } = submissionArtifacts
  const challengeDetailsLink = `/challenges/${challengeId}`

  if (isSubmissionLoading || isArtifactsLoading) {
    return <Loader />
  }

  const finalReview = {
    reviewType: 'Final score',
    reviewer: '',
    score: reviewSummation ? reviewSummation.aggregateScore : 'N/A',
    isPassing: reviewSummation ? reviewSummation.isPassing : undefined,
    className: '-'
  }

  const reviewRows = review && [...review, finalReview].map(
    (r, i) => {
      const { reviewType, reviewer, color, score, isPassing } = r
      const isFailed = isPassing === false
      const isPassed = isPassing === true
      const statusIsDefined = isPassed || isFailed
      const status = isPassing ? 'Passed' : 'Failed'
      return (
        <Table.Row key={`review-${reviewType}-${reviewer}-${i}`} className={styles.itemReview}>
          <Table.Col width={reviewOptions[0].width}>
            <span className={r.className || styles.type}>{reviewType}</span>
          </Table.Col>
          <Table.Col width={reviewOptions[1].width}>
            <Handle handle={reviewer} color={color} />
          </Table.Col>
          <Table.Col width={reviewOptions[2].width}>
            <span className={cn(styles.score, { [styles.fail]: isFailed })}>{formattedScore(score)}</span>
          </Table.Col>
          <Table.Col width={reviewOptions[3].width}>
            <span className={cn(styles.status, {
              [styles.fail]: isFailed,
              [styles.passed]: isPassed
            })}>{statusIsDefined ? status : 'N/A'}</span>
          </Table.Col>
        </Table.Row>
      )
    }
  )

  const artifactRows = artifacts && artifacts.map(
    (id, i) => {
      return (
        <Table.Row key={`artifact-${id}-${i}`} className={styles.itemArtifact}>
          <Table.Col width={artifactOptions[0].width}>
            <span className={id.className || styles.type}>{id}</span>
          </Table.Col>
          <Table.Col width={artifactOptions[1].width}>
            <a href={downloadSubmissionArtifactURL(submissionId, id, downloadToken)} className={styles.action}>
              <FontAwesomeIcon icon={faDownload} />
            </a>
          </Table.Col>
        </Table.Row>
      )
    }
  )

  const clickTab = (e, tab) => {
    e.preventDefault()
    setImmediate(() => {
      switchTab(tab)
    })
  }

  const loadData = (tab) => {
    switch (tab) {
      case SUBMISSION_DETAILS_TABS.REVIEW_SUMMARY:
        return (
          (!review || review.length === 0)
            ? <NoRecords name='reviews' />
            : (
              <>
                <Table rows={reviewRows} options={reviewOptions} className={styles.list} />
              </>
            )
        )
      case SUBMISSION_DETAILS_TABS.ARTIFACTS:
        return (
          (!artifacts || artifacts.length === 0)
            ? <NoRecords name='artifacts' />
            : (
              <>
                <Table rows={artifactRows} options={artifactOptions} className={styles.list} />
              </>
            )
        )
      default:
        return <div>&nsbp;</div>
    }
  }

  return (
      <>
        <div className={styles.header}>
          <div className={styles.backButton}>
            <Link to={challengeDetailsLink} className='link-button'><FontAwesomeIcon icon={faChevronLeft} /></Link>
          </div>
          <h2 className={styles.heading}>
            Submission details
            (
            <a href={downloadSubmissionURL(submissionId, downloadToken)}>
              {submissionId}
              <FontAwesomeIcon icon={faDownload} />
            </a>
            )
          </h2>
        </div>
        <div className={styles.tabs}>
          <div className={currentTab === SUBMISSION_DETAILS_TABS.REVIEW_SUMMARY ? cn(styles.tab, styles.active) : styles.tab} onClick={e => clickTab(e, SUBMISSION_DETAILS_TABS.REVIEW_SUMMARY)}>Review Summary</div>
          <div className={currentTab === SUBMISSION_DETAILS_TABS.ARTIFACTS ? cn(styles.tab, styles.active) : styles.tab} onClick={e => clickTab(e, SUBMISSION_DETAILS_TABS.ARTIFACTS)}>Artifacts</div>
        </div>
        {
          loadData(currentTab)
        }
      </>
  )
}

SubmissionDetails.propTypes = {
  submissionId: PropTypes.string,
  submissionDetails: PropTypes.object,
  challengeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isSubmissionLoading: PropTypes.bool,
  downloadToken: PropTypes.string,
  currentTab: PropTypes.string,
  isArtifactsLoading: PropTypes.bool,
  submissionArtifacts: PropTypes.object,
  switchTab: PropTypes.func
}

export default SubmissionDetails
