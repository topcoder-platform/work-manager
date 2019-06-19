import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './TechAndPlatform-Field.module.scss'

const TechAndPlatformField = ({ keywords, challenge, onUpdateMultiSelect }) => {
  const mapOps = item => ({ label: item, value: item })
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='keywords'>Technology / Platform<span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <input type='hidden' />
          <Select
            id='track-select'
            multi
            options={keywords.map(mapOps)}
            simpleValue
            value={challenge.tags.join(',')}
            onChange={(value) => onUpdateMultiSelect(value, 'tags')}
          />
        </div>
      </div>

      { challenge.submitTriggered && !challenge.tags.length && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Technology/Platform is required field
        </div>
      </div> }
    </>
  )
}

TechAndPlatformField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
  onUpdateMultiSelect: PropTypes.func.isRequired
}

export default TechAndPlatformField
