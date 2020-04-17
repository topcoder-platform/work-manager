import React from 'react'
import PropTypes from 'prop-types'
import styles from './Copilot-Field.module.scss'
import cn from 'classnames'
import _ from 'lodash'
import CopilotCard from '../../CopilotCard'

const CopilotField = ({ copilots, challenge, selectedCopilot, onUpdateOthers }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='copilot'>Copilot :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        {
          _.map(copilots, copilot => (
            <CopilotCard copilot={copilot} selectedCopilot={challenge.copilot ? challenge.copilot : selectedCopilot} key={copilot.handle} onUpdateOthers={onUpdateOthers} />))
        }
      </div>
    </div>
  )
}

CopilotField.defaultProps = {
  copilots: []
}

CopilotField.propTypes = {
  copilots: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired,
  selectedCopilot: PropTypes.string.isRequired
}

export default CopilotField
