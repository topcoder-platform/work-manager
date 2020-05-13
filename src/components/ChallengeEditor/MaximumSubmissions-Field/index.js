import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import _ from 'lodash'

import styles from './MaximumSubmissions-Field.module.scss'

class MaximumSubmissionsField extends Component {
  render () {
    const { challenge, onUpdateMetadata, readOnly } = this.props
    const metadata = challenge.metadata || {}
    let existingData = _.find(metadata, { name: 'submissionLimit' })
    let isUnlimited = false
    let isLimited = false
    let count = ''
    if (existingData) {
      const value = JSON.parse(existingData.value)
      if (value.unlimited === 'true') {
        isUnlimited = true
      }
      if (value.limit === 'true') {
        isLimited = true
      }
      if (value.count) {
        count = value.count
      }
    }
    return (
      <React.Fragment>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor='maximum'>Maximum Number of Submissions :</label>
            {readOnly && (<span> {isUnlimited ? 'Unlimited' : count}</span>)}
          </div>
        </div>
        {!readOnly && (<div className={styles.row}>
          <div className={styles.subGroup}>
            <div className={styles.subRow}>
              <div className={styles.tcCheckbox}>
                <input
                  name='unlimited'
                  id='unlimited'
                  type='checkbox'
                  checked={isUnlimited}
                  onChange={(e) => onUpdateMetadata('submissionLimit', e.target.checked, 'unlimited')}
                />
                <label htmlFor='unlimited'>
                  <div className={styles.checkboxLabel}>
                    Unlimited
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className={styles.subGroup}>
            <div className={styles.subRow}>
              <div className={styles.tcCheckbox}>
                <input
                  name='limit'
                  id='limit'
                  type='checkbox'
                  checked={isLimited}
                  onChange={(e) => onUpdateMetadata('submissionLimit', e.target.checked, 'limit')}
                />
                <label htmlFor='limit'>
                  <div className={styles.checkboxLabel}>
                    Limit :
                  </div>
                </label>
              </div>
              <input
                id='count'
                name='count'
                type='text'
                placeholder=''
                value={count}
                maxLength='200'
                onChange={(e) => onUpdateMetadata('submissionLimit', e.target.value, 'count')}
              />
            </div>
          </div>
        </div>)}
      </React.Fragment>
    )
  }
}

MaximumSubmissionsField.defaultProps = {
  onUpdateMetadata: () => {},
  readOnly: false
}

MaximumSubmissionsField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateMetadata: PropTypes.func,
  readOnly: PropTypes.bool
}

export default MaximumSubmissionsField
