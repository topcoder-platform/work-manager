import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'

import styles from './CopilotCard.module.scss'

const CopilotCard = ({ copilot, selectedCopilot, onUpdateOthers }) => {
  return (
    <div className={cn(styles.container, { [styles.active]: copilot.handle === selectedCopilot })} onClick={() => onUpdateOthers({ field: 'copilot', value: copilot.handle })}>
      <img src={copilot.avatar} alt='copilot' />
      <span className={cn(styles.handle, styles[copilot.color])}>{copilot.handle}</span>
    </div>
  )
}

CopilotCard.propTypes = {
  copilot: PropTypes.shape().isRequired,
  selectedCopilot: PropTypes.string.isRequired,
  onUpdateOthers: PropTypes.func.isRequired
}

export default CopilotCard
