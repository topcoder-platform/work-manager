import React from 'react'
import PropTypes from 'prop-types'
import { PrimaryButton } from '../../Buttons'
import styles from './Copilot-Field.module.scss'
import cn from 'classnames'
import _ from 'lodash'
import CopilotCard from '../../CopilotCard'

const CopilotField = ({ copilots, challenge, onUpdateOthers, readOnly, assignYourselfCopilot }) => {
  let errMessage = 'Please set a copilot'
  const selectedCopilot = _.find(copilots, { handle: challenge.copilot })
  const copilotFee = _.find(challenge.prizeSets, p => p.type === 'copilot', [])
  const selfService = challenge.selfService

  if (readOnly) {
    return (
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='copilot'>Copilot:</label>
        </div>
        {(selectedCopilot || selfService) && (<div className={cn(styles.field, styles.col2)}>
          {(selectedCopilot && <CopilotCard copilot={selectedCopilot} selectedCopilot='' key={selectedCopilot.handle} />)}
          {(selfService && <PrimaryButton
            text={'Assign Yourself'}
            type={'info'}
            onClick={assignYourselfCopilot}
          />)}
        </div>)}
      </div>
    )
  }
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='copilot'>Copilot:</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          {
            _.map(copilots, copilot => (
              <CopilotCard copilot={copilot} selectedCopilot={challenge.copilot} key={copilot.handle} onUpdateOthers={onUpdateOthers} />))
          }
        </div>
      </div>
      {!readOnly && challenge.submitTriggered && copilotFee && parseInt(copilotFee.prizes[0].value) > 0 && !selectedCopilot && (
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
  onUpdateOthers: () => { },
  readOnly: false
}

CopilotField.propTypes = {
  copilots: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func,
  readOnly: PropTypes.bool,
  assignYourselfCopilot: PropTypes.func.isRequired
}

export default CopilotField
