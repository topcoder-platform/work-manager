/**
 * Component to render LegacyLinks of the app
 */
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './LegacyLinks.module.scss'
import { REVIEW_APP_URL } from '../../config/constants'

const LegacyLinks = ({ challenge, challengeView }) => {
  const onClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  const reviewUrl = `${REVIEW_APP_URL}/active-challenges/${challenge.id}/challenge-details`
  return (
    <div className={styles.container}>
      {challenge.legacyId && (
        <>
          (<a href={reviewUrl} target={'_blank'} onClick={onClick}>Review</a>)
        </>
      )}
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
