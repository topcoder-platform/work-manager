import React from 'react'
import PropTypes from 'prop-types'
import styles from './NDAField.module.scss'
import { DEFAULT_NDA_UUID } from '../../../config/constants'

const NDAField = ({ challenge, toggleNdaRequire }) => {
  const isRequiredNda = challenge.terms && challenge.terms.indexOf(DEFAULT_NDA_UUID) >= 0
  return (
    <div className={styles.row}>
      <div className={styles.tcCheckbox}>
        <input
          name='isRequiredNda'
          type='checkbox'
          id='isRequiredNda'
          checked={isRequiredNda}
          onChange={toggleNdaRequire}
        />
        <label htmlFor='isRequiredNda'>
          <div>NDA Required</div>
          <input type='hidden' />
        </label>
      </div>
    </div>
  )
}

NDAField.defaultProps = {
  toggleNdaRequire: () => {}
}

NDAField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  toggleNdaRequire: PropTypes.func
}

export default NDAField
