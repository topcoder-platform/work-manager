/**
 * Component to render LegacyLinks of the app
 */
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './LegacyLinks.module.scss'
import { DIRECT_PROJECT_URL, MESSAGE, ONLINE_REVIEW_URL, SUBMISSION_REVIEW_URL } from '../../config/constants'
import PrimaryButton from '../Buttons/PrimaryButton'
import Tooltip from '../Tooltip'

const LegacyLinks = ({ challenge, challengeView }) => {
  const onClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  const orUrl = `${ONLINE_REVIEW_URL}/review/actions/ViewProjectDetails?pid=${challenge.legacyId}`
  const directUrl = `${DIRECT_PROJECT_URL}/challenges/${challenge.legacyId}`
  const submissionReviewUrl = `${SUBMISSION_REVIEW_URL}/${challenge.id}`
  return (
    <div className={styles.container}>
      {challenge.legacyId ? (
        <>
          <a href={directUrl} target={'_blank'} onClick={onClick}>
            <PrimaryButton text={'Direct'} type={'info'} />
          </a>
          <a href={orUrl} target={'_blank'} onClick={onClick}>
            <PrimaryButton text={'Online Review'} type={'info'} />
          </a>
          <a href={submissionReviewUrl} target={'_blank'} onClick={onClick}>
            <PrimaryButton text={'Submission Review'} type={'info'} />
          </a>
        </>
      ) : (
        <>
          <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
            {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
            <PrimaryButton text={'Direct'} type={'disabled'} />
          </Tooltip>
          <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
            {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
            <PrimaryButton text={'Online Review'} type={'disabled'} />
          </Tooltip>
          <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
            {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
            <PrimaryButton text={'Submission Review'} type={'disabled'} />
          </Tooltip>
        </>
      )}
      (  {challenge.legacyId ? <a href={orUrl} target={'_blank'} onClick={onClick}>Online Review</a>
        : <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
          {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
          <a disabled>Online Review</a>
        </Tooltip>}
      )
      <div>
        { challengeView && challenge.discussions && challenge.discussions.map(d => (
          <div key={d.id} className={cn(styles.row, styles.topRow)}>
            <div className={styles.col} >
              <span><span className={styles.fieldTitle}><a href={d.url} target='_blank' rel='noopener noreferrer'>Forum</a></span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

LegacyLinks.propTypes = {
  challenge: PropTypes.object,
  challengeView: PropTypes.bool
}

export default LegacyLinks
