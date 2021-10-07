/**
 * Component to render ForumLink of the app
 */
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './ForumLink.module.scss'

const ForumLink = ({ challenge }) => {
  return (
    <div className={styles.container}>
      <div>
        { challenge.discussions && challenge.discussions.map(d => (
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

ForumLink.propTypes = {
  challenge: PropTypes.object
}

export default ForumLink
