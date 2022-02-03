import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import ReactSVG from 'react-svg'
import styles from './CopilotCard.module.scss'

const assets = require.context('../../assets/images', false, /svg/)

const CopilotCard = ({ copilot, selectedCopilot, onUpdateOthers }) => {
  const icon = './user.svg'
  const copilotHandle = copilot.handle || copilot.memberHandle
  return (
    <div className={cn(styles.container, { [styles.active]: copilotHandle === selectedCopilot })} onClick={() => onUpdateOthers({ field: 'copilot', value: copilotHandle })}>
      {copilot.photoURL && <img src={copilot.photoURL} alt='copilot' />}
      {!copilot.photoURL && <ReactSVG path={assets(`${icon}`)} />}
      <span className={cn(styles.handle, styles[copilot.color])}>{copilotHandle}</span>
    </div>
  )
}

CopilotCard.defaultProps = {
  onUpdateOthers: () => {}
}

CopilotCard.propTypes = {
  copilot: PropTypes.shape().isRequired,
  selectedCopilot: PropTypes.string,
  onUpdateOthers: PropTypes.func
}

export default CopilotCard
