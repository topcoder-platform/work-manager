import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './NDAField.module.scss'
import { DEFAULT_NDA_UUID } from '../../../config/constants'

const NDAField = ({ challenge, toggleNdaRequire, readOnly }) => {
  const isRequiredNda = challenge.terms && _.some(challenge.terms, { id: DEFAULT_NDA_UUID })
  return (
    <div className={styles.row}>
      <div className={styles.tcCheckbox}>
        <input
          name='isRequiredNda'
          type='checkbox'
          id='isRequiredNda'
          checked={isRequiredNda}
          onChange={toggleNdaRequire}
          readOnly={readOnly}
        />
        <label htmlFor='isRequiredNda' className={readOnly ? styles.readOnly : ''}>
          <div>NDA Required</div>
          <input type='hidden' />
        </label>
      </div>
    </div>
  )
}

NDAField.defaultProps = {
  toggleNdaRequire: () => {},
  readOnly: false
}

NDAField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  toggleNdaRequire: PropTypes.func,
  readOnly: PropTypes.bool
}

export default NDAField
