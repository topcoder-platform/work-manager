import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './TechAndPlatform-Field.module.scss'

const TechAndPlatformField = ({ keywords, challenge, onUpdateMultiSelect }) => {
  const mapOps = item => ({ label: item, value: item })
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='keywords'>Technology / Platform :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input type='hidden' />
        <Select
          id='track-select'
          multi
          options={keywords.map(mapOps)}
          simpleValue
          value={challenge.keywords.join(',')}
          onChange={(value) => onUpdateMultiSelect(value, 'keywords')}
        />
      </div>
    </div>
  )
}

TechAndPlatformField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
  onUpdateMultiSelect: PropTypes.func.isRequired
}

export default TechAndPlatformField
