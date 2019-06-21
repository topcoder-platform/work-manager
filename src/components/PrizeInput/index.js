import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faDollarSign, faGift } from '@fortawesome/free-solid-svg-icons'
import { CHALLENGE_PRIZE_TYPE } from '../../config/constants'

import styles from './PrizeInput.module.scss'

class PrizeInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isOpen: false
    }
    this.toggleSelect = this.toggleSelect.bind(this)
    this.onUpdatePrizeType = this.onUpdatePrizeType.bind(this)
  }

  toggleSelect () {
    const { isOpen } = this.state
    this.setState({ isOpen: isOpen }) // Temp disabled
  }

  onUpdatePrizeType (e) {
    if (this.state.isOpen) {
      const { onUpdateChallengePrizeType, index } = this.props
      onUpdateChallengePrizeType(e.target.id, index)
      this.setState({ isOpen: false })
    }
  }

  render () {
    const { isOpen } = this.state
    const { prize, onUpdateInput, isFocus, index } = this.props
    const showIcon = (type) => {
      if (type === CHALLENGE_PRIZE_TYPE.GIFT) return faGift
      return faDollarSign
    }

    return (
      <div className={styles.container}>
        <div className={styles.selectContainer} onClick={() => this.toggleSelect()}>
          <div className={cn(styles.iconList, { [styles.active]: isOpen })}>
            {
              isOpen && (
                <React.Fragment>
                  <div className={styles.item} id={CHALLENGE_PRIZE_TYPE.MONEY} onClick={(e) => this.onUpdatePrizeType(e, index)}>
                    <FontAwesomeIcon className={styles.icon} icon={showIcon(CHALLENGE_PRIZE_TYPE.MONEY)} />
                  </div>
                  <div className={styles.item} id={CHALLENGE_PRIZE_TYPE.GIFT} onClick={(e) => this.onUpdatePrizeType(e, index)}>
                    <FontAwesomeIcon className={styles.icon} icon={showIcon(CHALLENGE_PRIZE_TYPE.GIFT)} />
                  </div>
                </React.Fragment>
              )
            }
          </div>
          <FontAwesomeIcon className={styles.icon} icon={showIcon(prize.type)} />
          <FontAwesomeIcon className={styles.icon} icon={faAngleDown} />
        </div>

        <input
          id='amount' name='amount' autoFocus={isFocus} type='text' placeholder='Prize'
          value={prize.value} maxLength='200' onChange={e => onUpdateInput(e.target.value, index)} />
      </div>
    )
  }
}

PrizeInput.propTypes = {
  prize: PropTypes.shape().isRequired,
  onUpdateInput: PropTypes.func.isRequired,
  onUpdateChallengePrizeType: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isFocus: PropTypes.bool
}

export default PrizeInput
