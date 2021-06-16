import React from 'react'
import PropTypes from 'prop-types'
import styles from './Copilot-Field.module.scss'
import cn from 'classnames'
import _ from 'lodash'
import CopilotCard from '../../CopilotCard'

const CopilotField = ({ copilots, challenge, onUpdateOthers, readOnly }) => {
  let errMessage = 'Please set a copilot'
  const selectedCopilot = _.find(copilots, { handle: challenge.copilot })
  const copilotFee = _.find(challenge.prizeSets, p => p.type === 'copilot', [])
  console.log(copilotFee)
  if (readOnly) {
    return (
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='copilot'>Copilot :</label>
        </div>
        {selectedCopilot && (<div className={cn(styles.field, styles.col2)}>
          <CopilotCard copilot={selectedCopilot} selectedCopilot='' key={selectedCopilot.handle} />
        </div>)}
      </div>
    )
  }
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='copilot'>Copilot :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          {
            _.map(copilots, copilot => (
              <CopilotCard copilot={copilot} selectedCopilot={challenge.copilot} key={copilot.handle} onUpdateOthers={onUpdateOthers} />))
          }
        </div>
      </div>
      {!readOnly && challenge.submitTriggered && parseInt(copilotFee.prizes[0].value) > 0 && !selectedCopilot && (
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)} />
          <div className={cn(styles.field, styles.col2, styles.error)}>
            {errMessage}
          </div>
        </div>
      )}
    </>
  )
}

CopilotField.defaultProps = {
  copilots: [],
  onUpdateOthers: () => {},
  readOnly: false
}

CopilotField.propTypes = {
  copilots: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func,
  readOnly: PropTypes.bool
}

export default CopilotField
