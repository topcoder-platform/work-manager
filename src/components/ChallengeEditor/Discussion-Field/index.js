import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './Discussion-Field.module.scss'

const DiscussionField = ({ hasForum, toggleForum, readOnly }) => {
  console.log('hasForummm ' + hasForum)
  if (readOnly) {
    return (
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1, styles.fieldTitle)}>Forum Discussion :</div>
        <div className={cn(styles.field, styles.col2)}>
          { hasForum ? 'On' : 'Off' }
        </div>
      </div>
    )
  }

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1, styles.fieldTitle)}>Forum Discussion :</div>
      <div className={cn(styles.field, styles.col2)}>
        <div className={styles.tcRadioButton}>
          <input
            name='forum'
            type='radio'
            id='forum-on'
            checked={hasForum}
            onChange={toggleForum}
          />
          <label className={styles['tc-RadioButton-label']} htmlFor='forum-on'>
            <div>On</div>
          </label>
        </div>
        <div className={styles.tcRadioButton}>
          <input
            name='forum'
            type='radio'
            id='forum-off'
            checked={!hasForum}
            onChange={toggleForum}
          />
          <label className={styles['tc-RadioButton-label']} htmlFor='forum-off'>
            <div>Off</div>
          </label>
        </div>
      </div>
    </div>
  )
}

DiscussionField.defaultProps = {
  readOnly: false
}

DiscussionField.propTypes = {
  hasForum: PropTypes.bool,
  toggleForum: PropTypes.func,
  readOnly: PropTypes.bool
}

export default DiscussionField
