import React, { Component } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import PrizeInput from '../../PrizeInput'

import styles from './ChallengePrizes-Field.module.scss'
import cn from 'classnames'
import { PrimaryButton } from '../../Buttons'
import { CHALLENGE_PRIZE_TYPE, VALIDATION_VALUE_TYPE, PRIZE_SETS_TYPE, CHALLENGE_TYPES_WITH_MULTIPLE_PRIZES } from '../../../config/constants'
import { validateValue } from '../../../util/input-check'

class ChallengePrizesField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentPrizeIndex: -1
    }
    this.renderPrizes = this.renderPrizes.bind(this)
    this.addNewPrize = this.addNewPrize.bind(this)
    this.removePrize = this.removePrize.bind(this)
    this.getChallengePrize = this.getChallengePrize.bind(this)
    this.onUpdateInput = this.onUpdateInput.bind(this)
  }

  addNewPrize () {
    const challengePrize = this.getChallengePrize()
    challengePrize.prizes = [...challengePrize.prizes, { type: CHALLENGE_PRIZE_TYPE.USD, value: 1 }]
    this.onUpdateValue(challengePrize)
  }

  removePrize (index) {
    const challengePrize = this.getChallengePrize()
    challengePrize.prizes.splice(index, 1)
    this.onUpdateValue(challengePrize)
  }

  onUpdateInput (value, index) {
    const challengePrize = this.getChallengePrize()
    challengePrize.prizes[index].value = validateValue(value, VALIDATION_VALUE_TYPE.INTEGER)
    if (parseInt(challengePrize.prizes[index].value) > 1000000) {
      challengePrize.prizes[index].value = '1000000'
    }
    this.onUpdateValue(challengePrize)
  }

  onUpdateValue (challengePrize) {
    const type = PRIZE_SETS_TYPE.CHALLENGE_PRIZES
    const { onUpdateOthers, challenge } = this.props
    const existingPrizes = challenge.prizeSets ? challenge.prizeSets.filter(p => p.type !== type) : []

    onUpdateOthers({ field: 'prizeSets', value: [...existingPrizes, challengePrize] })
  }

  getChallengePrize () {
    const type = PRIZE_SETS_TYPE.CHALLENGE_PRIZES
    return (this.props.challenge.prizeSets && this.props.challenge.prizeSets.length && this.props.challenge.prizeSets.find(p => p.type === type)) || { type, prizes: [{ type: CHALLENGE_PRIZE_TYPE.USD, value: 0 }] }
  }

  renderPrizes () {
    const { currentPrizeIndex } = this.state
    const { readOnly, challenge } = this.props
    const allowMultiplePrizes = _.includes(CHALLENGE_TYPES_WITH_MULTIPLE_PRIZES, challenge.type)
    return _.map(this.getChallengePrize().prizes, (prize, index, { length }) => (
      <div key={`${index}-${prize.amount}-edit`}>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor={`${index}-prize`}>Prize {allowMultiplePrizes ? index + 1 : ''} {!readOnly && (<span>*</span>)}:</label>
          </div>
          {readOnly ? (
            <span>${prize.value}</span>
          ) : (<div className={cn(styles.field, styles.col2)}>
            <PrizeInput
              prize={prize}
              isFocus={index === currentPrizeIndex}
              onUpdateInput={this.onUpdateInput}
              index={index} activeIndex={currentPrizeIndex} />
            {
              index > 0 && (
                <div className={styles.icon} onClick={() => this.removePrize(index)}>
                  <FontAwesomeIcon icon={faTrash} />
                </div>
              )
            }
          </div>)}
        </div>
        {!readOnly && challenge.submitTriggered && (prize.value === '' || (+prize.value <= 0 || +prize.value > 1000000)) && (
          <div className={styles.row}>
            <div className={cn(styles.field, styles.col1)} />
            <div className={cn(styles.field, styles.col2, styles.error)}>
              {prize.value === ''
                ? 'Prize amount is required field'
                : 'Prize amount must be more than 0 and no more than 1000000'}
            </div>
          </div>
        )}
      </div>
    ))
  }

  render () {
    const { readOnly, challenge } = this.props
    const allowMultiplePrizes = _.includes(CHALLENGE_TYPES_WITH_MULTIPLE_PRIZES, challenge.type)
    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor={`challengePrizes`}>Challenge Prizes :</label>
          </div>
        </div>
        { this.renderPrizes() }
        {!readOnly && allowMultiplePrizes && (<div className={styles.button} onClick={this.addNewPrize}>
          <PrimaryButton text={'Add New Prize'} type={'info'} />
        </div>)}
      </div>
    )
  }
}

ChallengePrizesField.defaultProps = {
  onUpdateOthers: () => {},
  readOnly: false
}

ChallengePrizesField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func,
  readOnly: PropTypes.bool
}

export default ChallengePrizesField
