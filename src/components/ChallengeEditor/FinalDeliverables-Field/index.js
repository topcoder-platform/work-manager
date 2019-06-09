import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import PrimaryButton from '../../Buttons/PrimaryButton'

import styles from './FinalDeliverables-Field.module.scss'

class FinalDeliverablesField extends Component {
  render () {
    const { challenge, onUpdateCheckbox } = this.props
    return (
      <React.Fragment>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor='finalDeliverables'>Final Deliverables :</label>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.checkList}>
            {
              _.map(challenge.fileTypes, (type, index) => (
                <div className={styles.tcCheckbox} key={type.name}>
                  <input
                    name={type.name}
                    type='checkbox'
                    id={type.name}
                    checked={type.check}
                    onChange={(e) => onUpdateCheckbox(type.name, e.target.checked, 'fileTypes', index)}
                  />
                  <label htmlFor={type.name}>
                    <div className={styles.checkboxLabel}>
                      {type.name}
                    </div>
                    <input type='hidden' />
                  </label>
                </div>
              ))
            }
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.button}>
            <PrimaryButton text={'Add File Type'} type={'info'} disabled />
          </div>
        </div>

      </React.Fragment>
    )
  }
}

FinalDeliverablesField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateCheckbox: PropTypes.func.isRequired
}

export default FinalDeliverablesField
