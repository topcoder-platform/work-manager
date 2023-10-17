import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './styles.module.scss'
import { SPECIAL_CHALLENGE_TAGS } from '../../../config/constants'
import _ from 'lodash'

const options = [
  {
    label: 'No',
    value: ''
  },
  ...SPECIAL_CHALLENGE_TAGS.map(tag => ({
    label: tag,
    value: tag
  }))
]

const SpecialChallengeField = ({ challenge, onUpdateMultiSelect, readOnly }) => {
  const selectedValue = useMemo(() => {
    const selectedTag = _.filter(challenge.tags, (tag) => SPECIAL_CHALLENGE_TAGS.indexOf(tag) >= 0)[0]
    return _.find(options, {
      value: selectedTag || ''
    })
  }, [challenge.tags])
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='keywords'>Special Challenge :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <input type='hidden' />
          {readOnly ? (
            <span>{selectedValue.label}</span>
          ) : (
            <Select
              options={options}
              id='track-select'
              simpleValue
              value={selectedValue}
              onChange={(value) => {
                const newTags = _.filter(challenge.tags, (tag) => SPECIAL_CHALLENGE_TAGS.indexOf(tag) < 0)
                if (value && value.value) {
                  newTags.push(value.value)
                }
                onUpdateMultiSelect(newTags.map((tag) => ({
                  label: tag,
                  value: tag
                })), 'tags')
              }}
            />
          )}
        </div>
      </div>
    </>
  )
}

SpecialChallengeField.defaultProps = {
  readOnly: false
}

SpecialChallengeField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateMultiSelect: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

export default SpecialChallengeField
