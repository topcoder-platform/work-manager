import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import _ from 'lodash'

import styles from './MaximumSubmissions-Field.module.scss'

class MaximumSubmissionsField extends Component {
  render () {
    const { challenge, onUpdateCheckbox, onUpdateInput } = this.props
    return (
      <React.Fragment>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor='maximum'>Maximum Number of Submissions :</label>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.subGroup}>
            <div className={styles.subRow}>
              <div className={styles.tcCheckbox}>
                <input
                  name='unlimited'
                  id='unlimited'
                  type='checkbox'
                  checked={_.get(challenge, 'maximumSubmissions.unlimited')}
                  onChange={(e) => onUpdateCheckbox('unlimited', e.target.checked, 'maximumSubmissions')}
                />
                <label htmlFor='unlimited'>
                  <div className={styles.checkboxLabel}>
                    Unlimited
                  </div>
                  <input type='hidden' />
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
                  checked={_.get(challenge, 'maximumSubmissions.limit')}
                  onChange={(e) => onUpdateCheckbox('limit', e.target.checked, 'maximumSubmissions')}
                />
                <label htmlFor='limit'>
                  <div className={styles.checkboxLabel}>
                    Limit :
                  </div>
                  <input type='hidden' />
                </label>
              </div>
              <input id='count' name='count' type='text' placeholder='' value={_.get(challenge, 'maximumSubmissions.count')} maxLength='200' onChange={(e) => onUpdateInput(e, true, 'maximumSubmissions')} />
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

MaximumSubmissionsField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateCheckbox: PropTypes.func.isRequired,
  onUpdateInput: PropTypes.func.isRequired
}

export default MaximumSubmissionsField
