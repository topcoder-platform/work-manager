import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cn from 'classnames'

import styles from './SubmissionVisibility-Field.module.scss'

class SubmissionVisibilityField extends Component {
  render () {
    const { challenge, onUpdateCheckbox } = this.props
    const metadata = challenge.metadata || {}
    let existingData = _.find(metadata, { name: 'submissionsViewable' }) || {}
    let isTrue = existingData.value === 'true'
    return (
      <React.Fragment>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor='submission-visibility'>Submission Visibility :</label>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.checkList}>
            <div className={styles.tcCheckbox}>
              <input
                name='submissionsViewable'
                type='checkbox'
                id='submissionsViewable'
                checked={isTrue}
                onChange={(e) => onUpdateCheckbox('submissionsViewable', e.target.checked)}
              />
              <label htmlFor='submissionsViewable'>
                <div className={styles.checkboxLabel}>
                  Submissions are viewable after challenge ends.
                </div>
                <input type='hidden' />
              </label>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

SubmissionVisibilityField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateCheckbox: PropTypes.func.isRequired
}

export default SubmissionVisibilityField
