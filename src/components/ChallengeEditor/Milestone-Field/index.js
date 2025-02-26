import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Milestone-Field.module.scss'

const MilestoneField = ({ milestones, onUpdateSelect, disabled, projectId, selectedMilestoneId }) => {
  const options = milestones.map(type => ({ label: type.name, value: type.id }))
  const selectedIndex = selectedMilestoneId && _.findIndex(milestones, milestone => milestone.id === selectedMilestoneId)
  const selectedOption = selectedIndex !== -1 && options[selectedIndex]
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='type'>Choose Milestone :</label>
        </div>
        <div className={cn(styles.field, styles.col2, { [styles.disabled]: disabled })}>
          <Select
            value={selectedOption}
            name='milestone'
            options={options}
            placeholder='Milestone Name'
            isClearable
            onChange={(e) => onUpdateSelect(_.get(e, 'value', -1), false, 'milestoneId')}
            isDisabled={disabled}
          />
        </div>
      </div>
    </>
  )
}

MilestoneField.defaultProps = {
  milestones: [],
  disabled: false
}

MilestoneField.propTypes = {
  // currentType: PropTypes.string.isRequired,
  track: PropTypes.string,
  milestones: PropTypes.arrayOf(PropTypes.shape()),
  onUpdateSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  projectId: PropTypes.number,
  selectedMilestoneId: PropTypes.number
}

export default MilestoneField
