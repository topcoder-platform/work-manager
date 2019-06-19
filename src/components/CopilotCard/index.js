import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'

import styles from './CopilotCard.module.scss'

const CopilotCard = ({ copilot, selectedCopilot, onUpdateOthers }) => {
  return (
    <div className={cn(styles.container, { [styles.active]: copilot.handle === selectedCopilot })} onClick={() => onUpdateOthers({ field: 'copilot', value: copilot.handle })}>
      <img src={copilot.photoURL || 'https://www.flaticon.com/free-icon/user_149071#term=user&page=1&position=12'} alt='copilot' />
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
