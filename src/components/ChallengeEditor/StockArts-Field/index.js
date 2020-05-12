import React, { Component } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import cn from 'classnames'

import styles from './StockArts-Field.module.scss'

class StockArtsField extends Component {
  render () {
    const { challenge, onUpdateCheckbox } = this.props
    const metadata = challenge.metadata || {}
    let existingData = _.find(metadata, { name: 'allowStockArt' }) || {}
    let isStockArts = existingData.value === 'true'
    return (
      <React.Fragment>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor='stockArts'>Stock Arts :</label>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.checkList}>
            <div className={styles.tcCheckbox}>
              <input
                name='stockArts'
                type='checkbox'
                id='stockArts'
                checked={isStockArts}
                onChange={(e) => onUpdateCheckbox('allowStockArt', e.target.checked)}
              />
              <label htmlFor='stockArts'>
                <div className={styles.checkboxLabel}>
                  Is stock photography allowed?
                </div>
              </label>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

StockArtsField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateCheckbox: PropTypes.func.isRequired
}

export default StockArtsField
