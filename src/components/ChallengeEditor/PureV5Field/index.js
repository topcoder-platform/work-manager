import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './PureV5Field.module.scss'

const PureV5Field = ({ challenge, togglePureV5, readOnly }) => {
  const pureV5 = _.get(challenge, 'legacy.pureV5', false)
  return (
    <div className={styles.row}>
      <div className={styles.tcCheckbox}>
        <input
          name='pureV5'
          type='checkbox'
          id='pureV5'
          checked={pureV5}
          onChange={togglePureV5}
          readOnly={readOnly}
        />
        <label htmlFor='pureV5' className={readOnly ? styles.readOnly : ''}>
          <div>Pure V5</div>
          <input type='hidden' />
        </label>
      </div>
    </div>
  )
}

PureV5Field.defaultProps = {
  togglePureV5: () => {},
  readOnly: false
}

PureV5Field.propTypes = {
  challenge: PropTypes.shape().isRequired,
  togglePureV5: PropTypes.func,
  readOnly: PropTypes.bool
}

export default PureV5Field
