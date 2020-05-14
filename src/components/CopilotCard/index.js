import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import ReactSVG from 'react-svg'
import styles from './CopilotCard.module.scss'

const assets = require.context('../../assets/images', false, /svg/)

const CopilotCard = ({ copilot, selectedCopilot, onUpdateOthers }) => {
  const icon = './user.svg'
  return (
    <div className={cn(styles.container, { [styles.active]: copilot.handle === selectedCopilot })} onClick={() => onUpdateOthers({ field: 'copilot', value: copilot.handle })}>
      {copilot.photoURL && <img src={copilot.photoURL} alt='copilot' />}
      {!copilot.photoURL && <ReactSVG path={assets(`${icon}`)} />}
      <span className={cn(styles.handle, styles[copilot.color])}>{copilot.handle}</span>
    </div>
  )
}

CopilotCard.defaultProps = {
  onUpdateOthers: () => {}
}

CopilotCard.propTypes = {
  copilot: PropTypes.shape().isRequired,
  selectedCopilot: PropTypes.string.isRequired,
  onUpdateOthers: PropTypes.func
}

export default CopilotCard
