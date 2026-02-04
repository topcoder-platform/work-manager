import React, { Component } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import PrizeInput from '../../PrizeInput'
import ConfirmationModal from '../../Modal/ConfirmationModal'

import styles from './ChallengePrizes-Field.module.scss'
import cn from 'classnames'
import { PrimaryButton } from '../../Buttons'
import {
  CHALLENGE_PRIZE_TYPE,
  VALIDATION_VALUE_TYPE,
  PRIZE_SETS_TYPE,
  CHALLENGE_TYPES_WITH_MULTIPLE_PRIZES
} from '../../../config/constants'
import { validateValue } from '../../../util/input-check'
import { applyPrizeTypeToPrizeSets, getPrizeType } from '../../../util/prize'

class ChallengePrizesField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentPrizeIndex: -1,
      pendingPrizeType: null,
      showPointsConfirmation: false
    }
    this.renderPrizes = this.renderPrizes.bind(this)
    this.addNewPrize = this.addNewPrize.bind(this)
    this.removePrize = this.removePrize.bind(this)
    this.getChallengePrize = this.getChallengePrize.bind(this)
    this.onUpdateInput = this.onUpdateInput.bind(this)
    this.getCurrentPrizeType = this.getCurrentPrizeType.bind(this)
    this.onSelectPrizeType = this.onSelectPrizeType.bind(this)
    this.onConfirmPoints = this.onConfirmPoints.bind(this)
    this.onCancelPoints = this.onCancelPoints.bind(this)
    this.onRequestPrizeType = this.onRequestPrizeType.bind(this)
  }

  addNewPrize () {
    const prizeType = this.getCurrentPrizeType()
    const challengePrize = this.getChallengePrize(prizeType)
    challengePrize.prizes = [
      ...challengePrize.prizes,
      { type: prizeType, value: 1 }
    ]
    this.onUpdateValue(challengePrize, prizeType)
  }

  removePrize (index) {
    const prizeType = this.getCurrentPrizeType()
    const challengePrize = this.getChallengePrize(prizeType)
    challengePrize.prizes.splice(index, 1)
    this.onUpdateValue(challengePrize, prizeType)
  }

  onUpdateInput (value, index) {
    const prizeType = this.getCurrentPrizeType()
    const challengePrize = this.getChallengePrize(prizeType)
    challengePrize.prizes[index].value = validateValue(
      value,
      VALIDATION_VALUE_TYPE.INTEGER
    )
    if (parseInt(challengePrize.prizes[index].value) > 1000000) {
      challengePrize.prizes[index].value = '1000000'
    }
    this.onUpdateValue(challengePrize, prizeType)
  }

  onUpdateValue (challengePrize, prizeType = this.getCurrentPrizeType()) {
    const type = PRIZE_SETS_TYPE.CHALLENGE_PRIZES
    const { onUpdateOthers, challenge } = this.props
    const existingPrizes = challenge.prizeSets
      ? challenge.prizeSets.filter(p => p.type !== type)
      : []

    onUpdateOthers({
      field: 'prizeSets',
      value: applyPrizeTypeToPrizeSets(
        [...existingPrizes, challengePrize],
        prizeType
      )
    })
  }

  getChallengePrize (prizeType = this.getCurrentPrizeType()) {
    const type = PRIZE_SETS_TYPE.CHALLENGE_PRIZES
    const existingPrizeSet =
      (this.props.challenge.prizeSets &&
        this.props.challenge.prizeSets.length &&
        this.props.challenge.prizeSets.find(p => p.type === type)) || null

    if (existingPrizeSet) {
      return _.cloneDeep(existingPrizeSet)
    }

    return (
      {
        type,
        prizes: [{ type: prizeType, value: 0 }]
      }
    )
  }

  getCurrentPrizeType () {
    return getPrizeType(this.props.challenge.prizeSets)
  }

  onSelectPrizeType (prizeType) {
    const challengePrize = this.getChallengePrize(prizeType)
    challengePrize.prizes = challengePrize.prizes.map(prize => ({
      ...prize,
      type: prizeType
    }))
    this.onUpdateValue(challengePrize, prizeType)
  }

  onRequestPrizeType (prizeType) {
    const currentPrizeType = this.getCurrentPrizeType()
    if (prizeType === currentPrizeType) return

    if (prizeType === CHALLENGE_PRIZE_TYPE.POINT) {
      this.setState({ pendingPrizeType: prizeType, showPointsConfirmation: true })
      return
    }
    this.onSelectPrizeType(prizeType)
  }

  onConfirmPoints () {
    const prizeType = this.state.pendingPrizeType || CHALLENGE_PRIZE_TYPE.POINT
    this.setState(
      { showPointsConfirmation: false, pendingPrizeType: null },
      () => this.onSelectPrizeType(prizeType)
    )
  }

  onCancelPoints () {
    this.setState({ showPointsConfirmation: false, pendingPrizeType: null })
  }

  renderPrizes (prizeType) {
    const { currentPrizeIndex } = this.state
    const { readOnly, challenge } = this.props
    const typeName = typeof challenge.type === 'string' ? challenge.type : (challenge.type && challenge.type.name)
    const allowMultiplePrizes = _.includes(
      CHALLENGE_TYPES_WITH_MULTIPLE_PRIZES,
      typeName
    )
    const challengePrize = this.getChallengePrize(prizeType)
    return _.map(
      challengePrize.prizes,
      (prize, index, { length }) => {
        let errMessage = ''
        if (prize.value === '') {
          errMessage = 'Prize amount is required field'
        } else if (+prize.value <= 0 || +prize.value > 1000000) {
          errMessage =
            'Prize amount must be more than 0 and no more than 1000000'
        } else if (index > 0) {
          const prePrize = challengePrize.prizes[index - 1]
          if (+prePrize.value < +prize.value) {
            errMessage =
              'Prize for the higher place cannot be bigger than for lower place'
          }
        }
        const displayPrizeType = prize.type || prizeType
        const symbol = displayPrizeType === CHALLENGE_PRIZE_TYPE.POINT ? 'Pts' : '$'
        return (
          <div key={`${index}-${prize.amount}-edit`}>
            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor={`${index}-prize`}>
                  Prize {allowMultiplePrizes ? index + 1 : ''}{' '}
                  {!readOnly && <span>*</span>}:
                </label>
              </div>
              {readOnly ? (
                <span>{symbol}{symbol === '$' ? '' : ' '}{prize.value}</span>
              ) : (
                <div className={cn(styles.field, styles.col2)}>
                  <PrizeInput
                    prize={prize}
                    isFocus={index === currentPrizeIndex}
                    onUpdateInput={this.onUpdateInput}
                    index={index}
                    activeIndex={currentPrizeIndex}
                    prizeType={prizeType}
                  />
                  {index > 0 && (
                    <div
                      className={styles.icon}
                      onClick={() => this.removePrize(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </div>
                  )}
                </div>
              )}
            </div>
            {!readOnly && challenge.submitTriggered && errMessage && (
              <div className={styles.row}>
                <div className={cn(styles.field, styles.col1)} />
                <div className={cn(styles.field, styles.col2, styles.error)}>
                  {errMessage}
                </div>
              </div>
            )}
          </div>
        )
      }
    )
  }

  render () {
    const { readOnly, challenge } = this.props
    const typeName = typeof challenge.type === 'string' ? challenge.type : (challenge.type && challenge.type.name)
    const allowMultiplePrizes = _.includes(
      CHALLENGE_TYPES_WITH_MULTIPLE_PRIZES,
      typeName
    )
    const prizeType = this.getCurrentPrizeType()
    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor={`challengePrizes`}>Challenge Prizes :</label>
          </div>
          {!readOnly && (
            <div className={cn(styles.field, styles.col2)}>
              <div className={styles.prizeTypeToggle}>
                <button
                  type='button'
                  className={cn(styles.prizeTypeButton, prizeType === CHALLENGE_PRIZE_TYPE.USD && styles.active)}
                  onClick={() => this.onRequestPrizeType(CHALLENGE_PRIZE_TYPE.USD)}
                >
                  $ USD
                </button>
                <button
                  type='button'
                  className={cn(styles.prizeTypeButton, prizeType === CHALLENGE_PRIZE_TYPE.POINT && styles.active)}
                  onClick={() => this.onRequestPrizeType(CHALLENGE_PRIZE_TYPE.POINT)}
                >
                  Points
                </button>
              </div>
            </div>
          )}
        </div>
        {this.renderPrizes(prizeType)}
        {!readOnly && allowMultiplePrizes && (
          <div className={styles.button} onClick={this.addNewPrize}>
            <PrimaryButton text={'Add New Prize'} type={'info'} />
          </div>
        )}
        {this.state.showPointsConfirmation && (
          <ConfirmationModal
            title='Confirm Points Prize'
            message='You have selected POINTS as a payment for this challenge.  Please be aware that POINTS are only approved for Wipro internal challenges and fun challenges.  POINTS are not acceptable for customer work.'
            onCancel={this.onCancelPoints}
            onConfirm={this.onConfirmPoints}
            confirmText='Confirm'
            cancelText='Cancel'
          />
        )}
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
