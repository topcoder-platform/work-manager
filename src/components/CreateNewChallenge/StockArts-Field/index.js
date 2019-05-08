import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'

import styles from './StockArts-Field.module.scss'

class StockArtsField extends Component {
  render () {
    const { challenge, onUpdateCheckbox } = this.props
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
                checked={challenge.stockArts}
                onChange={(e) => onUpdateCheckbox('stockArts', e.target.checked)}
              />
              <label htmlFor='stockArts'>
                <div className={styles.checkboxLabel}>
                  Is stock photography allowed?
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

StockArtsField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateCheckbox: PropTypes.func.isRequired
}

export default StockArtsField
