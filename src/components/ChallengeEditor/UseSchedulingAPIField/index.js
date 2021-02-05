import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './UseSchedulingAPIField.module.scss'

const UseSchedulingAPIField = ({ challenge, toggleUseSchedulingAPI, readOnly }) => {
  const useSchedulingAPI = _.get(challenge, 'legacy.useSchedulingAPI', false)
  return (
    <div className={styles.row}>
      <div className={styles.tcCheckbox}>
        <input
          name='useSchedulingAPI'
          type='checkbox'
          id='useSchedulingAPI'
          checked={useSchedulingAPI}
          onChange={toggleUseSchedulingAPI}
          readOnly={readOnly}
        />
        <label htmlFor='useSchedulingAPI' className={readOnly ? styles.readOnly : ''}>
          <div>Use Scheduling API</div>
          <input type='hidden' />
        </label>
      </div>
    </div>
  )
}

UseSchedulingAPIField.defaultProps = {
  toggleUseSchedulingAPI: () => {},
  readOnly: false
}

UseSchedulingAPIField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  toggleUseSchedulingAPI: PropTypes.func,
  readOnly: PropTypes.bool
}

export default UseSchedulingAPIField
