import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './ChallengeType-Field.module.scss'

const ChallengeTypeField = ({ types, onUpdateSelect, challenge, disabled }) => {
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='type'>Challenge Type <span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2, { [styles.disabled]: disabled })}>
          <Select
            name='challenge_type'
            options={_.map(types, type => ({ label: type, value: type }))}
            placeholder='Challenge Type'
            isClearable={false}
            onChange={(e) => onUpdateSelect(e.value, false, 'challengeType')}
            isDisabled={disabled}
          />
        </div>
      </div>
      { challenge.submitTriggered && !challenge.challengeType && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Challenge Type is required field
        </div>
      </div> }
    </>
  )
}

ChallengeTypeField.defaultProps = {
  types: [],
  disabled: false
}

ChallengeTypeField.propTypes = {
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  onUpdateSelect: PropTypes.func.isRequired,
  challenge: PropTypes.shape().isRequired,
  disabled: PropTypes.bool
}

export default ChallengeTypeField
