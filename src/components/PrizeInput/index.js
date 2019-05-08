import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faDollarSign, faGift } from '@fortawesome/free-solid-svg-icons'
import { CHALLENGE_PRIZE_TYPE, VALIDATION_VALUE_TYPE } from '../../config/constants'

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
    this.setState({ isOpen: !isOpen })
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
    const { prize, onUpdateInput, index } = this.props
    const showIcon = (type) => {
      if (type === 'money') return faDollarSign
      return faGift
    }

    return (
      <div className={styles.container}>
        <div className={styles.selectContainer} onClick={() => this.toggleSelect()}>
          <div className={cn(styles.iconList, { [styles.active]: isOpen })}>
            {
              isOpen && (
                <React.Fragment>
                  <div className={styles.item} id={CHALLENGE_PRIZE_TYPE.MONEY} onClick={(e) => this.onUpdatePrizeType(e)}>
                    <FontAwesomeIcon className={styles.icon} icon={showIcon(CHALLENGE_PRIZE_TYPE.MONEY)} />
                  </div>
                  <div className={styles.item} id={CHALLENGE_PRIZE_TYPE.GIFT} onClick={(e) => this.onUpdatePrizeType(e)}>
                    <FontAwesomeIcon className={styles.icon} icon={showIcon(CHALLENGE_PRIZE_TYPE.GIFT)} />
                  </div>
                </React.Fragment>
              )
            }
          </div>
          <FontAwesomeIcon className={styles.icon} icon={showIcon(prize.type)} />
          <FontAwesomeIcon className={styles.icon} icon={faAngleDown} />
        </div>

        <input id='amount' name='amount' type='text' placeholder='Prize' value={prize.amount} maxLength='200' onChange={(e) => onUpdateInput(e, true, 'prizes', index, prize.type === CHALLENGE_PRIZE_TYPE.MONEY ? VALIDATION_VALUE_TYPE.INTEGER : VALIDATION_VALUE_TYPE.STRING)} />
      </div>
    )
  }
}

PrizeInput.propTypes = {
  prize: PropTypes.shape().isRequired,
  onUpdateInput: PropTypes.func.isRequired,
  onUpdateChallengePrizeType: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired
}

export default PrizeInput
