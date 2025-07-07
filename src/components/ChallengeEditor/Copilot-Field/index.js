import cn from 'classnames'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

import { PrimaryButton } from '../../Buttons'
import CopilotCard from '../../CopilotCard'

import styles from './Copilot-Field.module.scss'
import { PRIZE_SETS_TYPE } from '../../../config/constants'

const CopilotField = ({ copilots, challenge, onUpdateOthers, readOnly, assignYourselfCopilot, loggedInUser }) => {
  let errMessage = 'Please set a copilot'
  const handleProperty = copilots.handle ? 'handle' : 'memberHandle'
  const selectedCopilot = _.find(copilots, { [handleProperty]: challenge.copilot })
  const selectedCopilotHandle = selectedCopilot ? selectedCopilot[handleProperty] : undefined
  const copilotFee = _.find(challenge.prizeSets, p => p.type === PRIZE_SETS_TYPE.COPILOT_PAYMENT, [])
  const selfService = challenge.selfService
  const copilotIsSelf = loggedInUser && selectedCopilotHandle === loggedInUser.handle
  const assignButtonText = `${selectedCopilot && copilotIsSelf ? 'Una' : 'A'}ssign Yourself`
  const showAssignButton = loggedInUser && (!selectedCopilotHandle || copilotIsSelf)

  if (readOnly) {
    return (
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='copilot'>Copilot:</label>
        </div>
        {(selectedCopilot || selfService) && (<div className={cn(styles.field, styles.col2)}>
          {(selectedCopilot && <CopilotCard copilot={selectedCopilot} selectedCopilot={challenge.copilot} key={selectedCopilotHandle} />)}
          {((selfService && showAssignButton) && <div>
            <PrimaryButton
              text={assignButtonText}
              type='info'
              onClick={assignYourselfCopilot}
            />
          </div>)}
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
  assignYourselfCopilot: PropTypes.func.isRequired,
  loggedInUser: PropTypes.object
}

export default CopilotField
