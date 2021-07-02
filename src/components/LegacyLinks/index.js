/**
 * Component to render LegacyLinks of the app
 */
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './LegacyLinks.module.scss'
import Tooltip from '../Tooltip'
import { MESSAGE, ONLINE_REVIEW_URL } from '../../config/constants'

const LegacyLinks = ({ challenge, challengeView }) => {
  const onClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  const orUrl = `${ONLINE_REVIEW_URL}/review/actions/ViewProjectDetails?pid=${challenge.legacyId}`
  return (
    <div className={styles.container}>
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
