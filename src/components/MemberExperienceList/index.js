import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import { OutlineButton } from '../Buttons'
import styles from './styles.module.scss'

const getExperienceContent = (experience) => {
  if (!experience || typeof experience !== 'object') {
    return ''
  }
  return (
    experience.experienceText ||
    experience.content ||
    experience.text ||
    experience.notes ||
    experience.summary ||
    ''
  )
}

const getSortTime = (experience) => {
  if (!experience || typeof experience !== 'object') {
    return 0
  }
  const rawValue = experience.createdAt || experience.updatedAt
  if (!rawValue) {
    return 0
  }
  const parsed = new Date(rawValue)
  const timestamp = parsed.getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const MemberExperienceList = ({ experiences, isLoading, error, onRetry }) => {
  const sortedExperiences = useMemo(() => {
    if (!Array.isArray(experiences)) {
      return []
    }
    return [...experiences].sort((a, b) => getSortTime(b) - getSortTime(a))
  }, [experiences])

  if (isLoading) {
    return (
      <div className={styles.loadingState}>Loading experience records...</div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <span>{error}</span>
        {onRetry && (
          <OutlineButton text='Retry' type='info' onClick={onRetry} />
        )}
      </div>
    )
  }

  if (!sortedExperiences.length) {
    return (
      <div className={styles.emptyState}>No experience records yet.</div>
    )
  }

  return (
    <div className={styles.experienceList}>
      {sortedExperiences.map((experience, index) => {
        const createdAt = experience.createdAt
        const updatedAt = experience.updatedAt
        const createdMoment = createdAt ? moment(createdAt) : null
        const updatedMoment = updatedAt ? moment(updatedAt) : null
        const createdLabel = createdMoment && createdMoment.isValid()
          ? createdMoment.format('MMM DD, YYYY HH:mm')
          : '-'
        const updatedLabel = updatedMoment && updatedMoment.isValid()
          ? updatedMoment.format('MMM DD, YYYY HH:mm')
          : null
        const showUpdated = updatedLabel &&
          (!createdMoment || !createdMoment.isValid() || updatedMoment.valueOf() !== createdMoment.valueOf())
        const experienceText = getExperienceContent(experience)
        const markdownSource = experienceText != null ? String(experienceText) : ''
        const experienceKey = experience.id || experience.createdAt || `experience-${index}`
        return (
          <div key={experienceKey} className={styles.experienceItem}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
              rehypePlugins={[rehypeKatex, rehypeStringify, rehypeRaw]}
              className={styles.experienceContent}
            >
              {markdownSource}
            </ReactMarkdown>
            <div className={styles.experienceMeta}>
              <span className={styles.experienceDate}>{createdLabel}</span>
              {showUpdated && (
                <span className={styles.experienceDate}>{`Updated: ${updatedLabel}`}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

MemberExperienceList.defaultProps = {
  experiences: [],
  isLoading: false,
  error: '',
  onRetry: null
}

MemberExperienceList.propTypes = {
  experiences: PropTypes.arrayOf(PropTypes.shape()),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func
}

export default MemberExperienceList
