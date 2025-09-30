import React, { useCallback, useEffect, useState } from 'react'
import Modal from '../../Modal'

import styles from './RatingsListModal.module.scss'
import PropTypes from 'prop-types'
import { getTopcoderReactLib } from '../../../util/topcoder-react-lib'
import Loader from '../../Loader'
import { getReviewTypes } from '../../../services/challenges'
import { SystemReviewers } from '../../../config/constants'
import { getSubmissionsService } from '../../../services/submissions'

export const RatingsListModal = ({ onClose, theme, token, submissionId, challengeId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)

  const enrichSources = useCallback(async (submissionReviews, reviewSummation) => {
    const reactLib = getTopcoderReactLib()
    const { getService } = reactLib.services.members
    const membersService = getService(token)
    const resources = await membersService.getChallengeResources(challengeId)
    const reviewTypes = await getReviewTypes()

    const finalReview = {
      reviewType: 'Final score',
      reviewer: '',
      score: reviewSummation ? reviewSummation.aggregateScore : 'N/A',
      isPassing: reviewSummation ? reviewSummation.isPassing : undefined
    }

    return [...submissionReviews.map(review => {
      const reviewType = reviewTypes.find(rt => rt.id === review.typeId)
      const reviewer = resources.find(resource => resource.memberHandle === review.reviewerId) || SystemReviewers.Default
      return {
        ...review,
        reviewType: reviewType ? reviewType.name : '',
        reviewer
      }
    }), finalReview]
  }, [token])

  const getSubmission = useCallback(async () => {
    const submissionsService = getSubmissionsService(token)
    const submissionInfo = await submissionsService.getSubmissionInformation(submissionId)
    setReviews(await enrichSources(submissionInfo.review, submissionInfo.reviewSummation[0]))
    setLoading(false)
  }, [submissionId, token])

  useEffect(() => {
    setLoading(true)
    getSubmission()
  }, [submissionId])

  return (
    <Modal theme={theme} onCancel={onClose}>
      <div className={styles['container']}>
        <div className={styles['list']}>
          <div className={styles['header']}>
            <div className={styles['header-item']}>Review Type</div>
            <div className={styles['header-item']}>Reviewer</div>
            <div className={styles['header-item']}>Score</div>
            <div className={styles['header-item']}>Status</div>
          </div>
          {reviews.map(review => {
            const { isPassing } = review
            const isFailed = isPassing === false
            const isPassed = isPassing === true
            const statusIsDefined = isPassed || isFailed
            const status = isPassing ? 'Passed' : 'Failed'

            return (
              <div className={styles['list-item']}>
                <div className={styles['list-col-item']}>
                  {review.reviewType}
                </div>
                <div className={styles['list-col-item']}>
                  <strong>{review.reviewer}</strong>
                </div>
                <div className={styles['list-col-item']}>
                  {review.score}
                </div>
                <div className={styles['list-col-item']}>
                  {statusIsDefined ? status : 'N/A'}
                </div>
              </div>
            )
          })}
        </div>

        {
          loading && <Loader />
        }
      </div>
    </Modal>
  )
}

RatingsListModal.defaultProps = {
  onClose: () => {},
  theme: '',
  token: '',
  submissionId: '',
  challengeId: ''
}

RatingsListModal.propTypes = {
  onClose: PropTypes.func,
  theme: PropTypes.shape(),
  token: PropTypes.string,
  submissionId: PropTypes.string,
  challengeId: PropTypes.string
}
