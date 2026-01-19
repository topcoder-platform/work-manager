import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'
import moment from 'moment-timezone'
import { toastr } from 'react-redux-toastr'

import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import { PrimaryButton, OutlineButton } from '../../components/Buttons'
import { loadProject } from '../../actions/projects'
import { loadEngagementDetails } from '../../actions/engagements'
import { checkAdmin, checkManager } from '../../util/tc'
import { PROJECT_ROLES } from '../../config/constants'
import {
  fetchEngagementFeedback,
  createEngagementFeedback,
  generateEngagementFeedbackLink
} from '../../services/engagements'
import styles from './styles.module.scss'

const CUSTOMER_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FEEDBACK_TEXT_LIMIT = 2000

const EngagementFeedback = ({
  projectId,
  engagementId,
  match,
  engagementDetails,
  projectDetail,
  isLoading,
  auth,
  loadProject,
  loadEngagementDetails
}) => {
  const resolvedProjectId = useMemo(() => {
    const value = projectId || _.get(match, 'params.projectId')
    return value ? parseInt(value, 10) : null
  }, [projectId, match])

  const resolvedEngagementId = useMemo(() => {
    return engagementId || _.get(match, 'params.engagementId') || null
  }, [engagementId, match])

  const assignmentId = useMemo(() => {
    const assignments = _.get(engagementDetails, 'assignments', [])
    if (!Array.isArray(assignments) || !assignments.length) {
      return null
    }
    const assignmentWithId = assignments.find((assignment) => assignment && assignment.id)
    return assignmentWithId ? assignmentWithId.id : null
  }, [engagementDetails])

  const canManage = useMemo(() => {
    const isAdmin = checkAdmin(auth.token)
    const isManager = checkManager(auth.token)
    const members = _.get(projectDetail, 'members', [])
    const userId = _.get(auth, 'user.userId')
    const isProjectManager = members.some(member => member.userId === userId && member.role === PROJECT_ROLES.MANAGER)
    return isAdmin || isManager || isProjectManager
  }, [auth, projectDetail])

  const [feedback, setFeedback] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const [showAddFeedbackModal, setShowAddFeedbackModal] = useState(false)
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false)
  const [generatedLink, setGeneratedLink] = useState(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [rating, setRating] = useState('')
  const [feedbackFormError, setFeedbackFormError] = useState('')
  const [generateError, setGenerateError] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)

  useEffect(() => {
    if (resolvedProjectId) {
      loadProject(resolvedProjectId)
    }
    if (resolvedEngagementId) {
      loadEngagementDetails(resolvedProjectId, resolvedEngagementId)
    }
  }, [resolvedProjectId, resolvedEngagementId, loadProject, loadEngagementDetails])

  const fetchFeedback = useCallback(async () => {
    if (!resolvedEngagementId || !assignmentId || !canManage) {
      setFeedback([])
      setFeedbackError('')
      setFeedbackLoading(false)
      return
    }
    setFeedbackLoading(true)
    setFeedbackError('')
    try {
      const response = await fetchEngagementFeedback(resolvedEngagementId, assignmentId)
      const data = _.get(response, 'data', [])
      setFeedback(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = _.get(err, 'response.data.message') || (err && err.message) || 'Unable to load feedback.'
      setFeedbackError(errorMessage)
      toastr.error('Error', errorMessage)
    } finally {
      setFeedbackLoading(false)
    }
  }, [resolvedEngagementId, assignmentId, canManage])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const resetFeedbackForm = useCallback(() => {
    setFeedbackText('')
    setRating('')
    setFeedbackFormError('')
    setIsSubmittingFeedback(false)
  }, [])

  const resetGenerateForm = useCallback(() => {
    setCustomerEmail('')
    setGeneratedLink(null)
    setGenerateError('')
    setIsGeneratingLink(false)
  }, [])

  const handleCloseAddFeedbackModal = useCallback(() => {
    setShowAddFeedbackModal(false)
    resetFeedbackForm()
  }, [resetFeedbackForm])

  const handleCloseGenerateLinkModal = useCallback(() => {
    setShowGenerateLinkModal(false)
    resetGenerateForm()
  }, [resetGenerateForm])

  const handleAddFeedbackSubmit = useCallback(async (event) => {
    event.preventDefault()
    if (isSubmittingFeedback) {
      return
    }
    if (!resolvedEngagementId) {
      setFeedbackFormError('Engagement is required to submit feedback.')
      return
    }
    if (!assignmentId) {
      setFeedbackFormError('Assignment is required to submit feedback.')
      return
    }
    const trimmedFeedback = feedbackText.trim()
    if (!trimmedFeedback) {
      setFeedbackFormError('Feedback is required.')
      return
    }
    if (trimmedFeedback.length > FEEDBACK_TEXT_LIMIT) {
      setFeedbackFormError('Feedback must be 2000 characters or less.')
      return
    }

    let ratingValue = null
    if (rating !== '' && rating != null) {
      const parsedRating = Number(rating)
      if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        setFeedbackFormError('Rating must be between 1 and 5.')
        return
      }
      ratingValue = parsedRating
    }

    setIsSubmittingFeedback(true)
    setFeedbackFormError('')
    try {
      await createEngagementFeedback(resolvedEngagementId, assignmentId, {
        feedbackText: trimmedFeedback,
        rating: ratingValue || undefined
      })
      toastr.success('Success', 'Feedback submitted successfully.')
      handleCloseAddFeedbackModal()
      await fetchFeedback()
    } catch (err) {
      const errorMessage = _.get(err, 'response.data.message') || (err && err.message) || 'Unable to submit feedback.'
      setFeedbackFormError(errorMessage)
      toastr.error('Error', errorMessage)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }, [
    isSubmittingFeedback,
    resolvedEngagementId,
    assignmentId,
    feedbackText,
    rating,
    handleCloseAddFeedbackModal,
    fetchFeedback
  ])

  const handleGenerateLinkSubmit = useCallback(async (event) => {
    event.preventDefault()
    if (isGeneratingLink) {
      return
    }
    if (!resolvedEngagementId) {
      setGenerateError('Engagement is required to generate a link.')
      return
    }
    if (!assignmentId) {
      setGenerateError('Assignment is required to generate a link.')
      return
    }
    const trimmedEmail = customerEmail.trim()
    if (!trimmedEmail) {
      setGenerateError('Customer email is required.')
      return
    }
    if (!CUSTOMER_EMAIL_PATTERN.test(trimmedEmail)) {
      setGenerateError('Enter a valid email address.')
      return
    }

    setIsGeneratingLink(true)
    setGenerateError('')
    try {
      const response = await generateEngagementFeedbackLink(resolvedEngagementId, assignmentId, {
        customerEmail: trimmedEmail
      })
      setGeneratedLink(_.get(response, 'data', null))
      toastr.success('Success', 'Feedback link generated successfully.')
    } catch (err) {
      const errorMessage = _.get(err, 'response.data.message') || (err && err.message) || 'Unable to generate feedback link.'
      setGenerateError(errorMessage)
      toastr.error('Error', errorMessage)
    } finally {
      setIsGeneratingLink(false)
    }
  }, [isGeneratingLink, resolvedEngagementId, assignmentId, customerEmail])

  const handleCopyLink = useCallback(async () => {
    const feedbackUrl = _.get(generatedLink, 'feedbackUrl')
    if (!feedbackUrl) {
      return
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(feedbackUrl)
      } else if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea')
        textArea.value = feedbackUrl
        textArea.setAttribute('readonly', '')
        textArea.style.position = 'absolute'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      toastr.success('Success', 'Link copied to clipboard.')
    } catch (err) {
      const errorMessage = (err && err.message) || 'Unable to copy link. Please try again.'
      toastr.error('Error', errorMessage)
    }
  }, [generatedLink])

  const feedbackTitle = engagementDetails && engagementDetails.title
    ? `${engagementDetails.title} Feedback`
    : 'Feedback'

  const pendingAssignment = engagementDetails && engagementDetails.status === 'Pending Assignment'

  const renderFeedbackContent = () => {
    if (!canManage) {
      return (
        <div className={styles.emptyState}>
          Feedback is available to project managers and admins only.
        </div>
      )
    }

    if (feedbackLoading) {
      return (
        <div className={styles.loadingState}>Loading feedback...</div>
      )
    }

    if (feedbackError) {
      return (
        <div className={styles.errorState}>
          <span>{feedbackError}</span>
          <OutlineButton text='Retry' type='info' onClick={fetchFeedback} />
        </div>
      )
    }

    if (!feedback.length) {
      return (
        <div className={styles.emptyState}>No feedback yet.</div>
      )
    }

    return (
      <div className={styles.feedbackList}>
        {feedback.map(item => {
          const authorLabel = item.givenByHandle
            ? `Topcoder PM: ${item.givenByHandle}`
            : `Customer: ${item.givenByEmail || 'Unknown'}`
          const createdAt = item.createdAt
            ? moment(item.createdAt).format('MMM DD, YYYY')
            : '-'
          return (
            <div key={item.id || `${authorLabel}-${createdAt}`} className={styles.feedbackItem}>
              <p className={styles.feedbackText}>{item.feedbackText}</p>
              <div className={styles.feedbackMeta}>
                <span className={styles.feedbackAuthor}>{authorLabel}</span>
                {item.rating ? (
                  <span className={styles.feedbackRating}>{`Rating: ${item.rating}/5`}</span>
                ) : null}
                <span className={styles.feedbackDate}>{createdAt}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading && !_.get(engagementDetails, 'id')) {
    return <Loader />
  }

  if (!_.get(engagementDetails, 'id') && !isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Engagement not found.</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{feedbackTitle}</div>
          {engagementDetails && engagementDetails.description && (
            <div className={styles.subtitle}>{engagementDetails.description}</div>
          )}
        </div>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Status:</span>
            <span>{engagementDetails && engagementDetails.status ? engagementDetails.status : '-'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Last updated:</span>
            <span>
              {engagementDetails && engagementDetails.updatedAt
                ? moment(engagementDetails.updatedAt).format('MMM DD, YYYY')
                : '-'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Feedback</div>
            <div className={styles.panelDescription}>
              Capture internal notes and gather customer feedback.
            </div>
          </div>
          {canManage && (
            <div className={styles.panelActions}>
              <PrimaryButton
                text='Add Feedback'
                type='info'
                onClick={() => setShowAddFeedbackModal(true)}
              />
              <OutlineButton
                text='Generate Customer Feedback Link'
                type='info'
                onClick={() => setShowGenerateLinkModal(true)}
              />
            </div>
          )}
        </div>

        {pendingAssignment && (
          <div className={styles.notice}>
            This engagement has not been assigned yet. Feedback will be available once a member is assigned.
          </div>
        )}

        {renderFeedbackContent()}
      </div>

      {showAddFeedbackModal && (
        <Modal onCancel={handleCloseAddFeedbackModal}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Add Feedback</div>
            <form className={styles.modalForm} onSubmit={handleAddFeedbackSubmit}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor='feedback-text'>Feedback</label>
                <textarea
                  id='feedback-text'
                  className={styles.textarea}
                  maxLength={FEEDBACK_TEXT_LIMIT}
                  value={feedbackText}
                  onChange={(event) => setFeedbackText(event.target.value)}
                  placeholder='Share your feedback...'
                  disabled={isSubmittingFeedback}
                  required
                />
                <div className={styles.characterCount}>
                  {`${feedbackText.length} / ${FEEDBACK_TEXT_LIMIT} characters`}
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor='feedback-rating'>Rating (optional)</label>
                <input
                  id='feedback-rating'
                  type='number'
                  min='1'
                  max='5'
                  step='1'
                  className={styles.input}
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  disabled={isSubmittingFeedback}
                />
              </div>

              {feedbackFormError && (
                <div className={styles.formError}>{feedbackFormError}</div>
              )}

              <div className={styles.modalActions}>
                <div className={styles.modalAction}>
                  <PrimaryButton
                    text={isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    type='info'
                    submit
                    disabled={isSubmittingFeedback}
                  />
                </div>
                <div className={styles.modalAction}>
                  <OutlineButton
                    text='Cancel'
                    type='info'
                    onClick={handleCloseAddFeedbackModal}
                    disabled={isSubmittingFeedback}
                  />
                </div>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {showGenerateLinkModal && (
        <Modal onCancel={handleCloseGenerateLinkModal}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Generate Customer Feedback Link</div>
            {!generatedLink && (
              <form className={styles.modalForm} onSubmit={handleGenerateLinkSubmit}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel} htmlFor='customer-email'>Customer Email</label>
                  <input
                    id='customer-email'
                    type='email'
                    className={styles.input}
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    placeholder='customer@example.com'
                    disabled={isGeneratingLink}
                    required
                  />
                </div>

                {generateError && (
                  <div className={styles.formError}>{generateError}</div>
                )}

                <div className={styles.modalActions}>
                  <div className={styles.modalAction}>
                    <PrimaryButton
                      text={isGeneratingLink ? 'Generating...' : 'Generate Link'}
                      type='info'
                      submit
                      disabled={isGeneratingLink}
                    />
                  </div>
                  <div className={styles.modalAction}>
                    <OutlineButton
                      text='Cancel'
                      type='info'
                      onClick={handleCloseGenerateLinkModal}
                      disabled={isGeneratingLink}
                    />
                  </div>
                </div>
              </form>
            )}

            {generatedLink && (
              <div className={styles.modalForm}>
                <div className={styles.linkMessage}>Feedback link generated successfully.</div>
                <div className={styles.linkDisplay}>
                  <input
                    className={styles.linkInput}
                    type='text'
                    value={generatedLink.feedbackUrl || ''}
                    readOnly
                  />
                  <OutlineButton text='Copy Link' type='info' onClick={handleCopyLink} />
                </div>
                {generatedLink.expiresAt && (
                  <div className={styles.linkMeta}>
                    {`Expires on ${moment(generatedLink.expiresAt).format('MMM DD, YYYY')}`}
                  </div>
                )}
                <div className={styles.modalActions}>
                  <div className={styles.modalAction}>
                    <PrimaryButton text='Close' type='info' onClick={handleCloseGenerateLinkModal} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

EngagementFeedback.defaultProps = {
  projectId: null,
  engagementId: null,
  match: null,
  engagementDetails: null,
  projectDetail: null,
  isLoading: false
}

EngagementFeedback.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  engagementId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string,
      engagementId: PropTypes.string
    })
  }),
  engagementDetails: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    updatedAt: PropTypes.string
  }),
  projectDetail: PropTypes.shape({
    members: PropTypes.arrayOf(PropTypes.shape())
  }),
  isLoading: PropTypes.bool,
  auth: PropTypes.shape({
    token: PropTypes.string,
    user: PropTypes.shape({
      userId: PropTypes.number
    })
  }).isRequired,
  loadProject: PropTypes.func.isRequired,
  loadEngagementDetails: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  engagementDetails: state.engagements.engagementDetails,
  projectDetail: state.projects.projectDetail,
  isLoading: state.engagements.isLoading,
  auth: state.auth
})

const mapDispatchToProps = {
  loadProject,
  loadEngagementDetails
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EngagementFeedback)
)
