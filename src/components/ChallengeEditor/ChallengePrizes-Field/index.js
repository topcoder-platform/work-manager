import React, { Component } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import PrizeInput from '../../PrizeInput'

import styles from './ChallengePrizes-Field.module.scss'
import cn from 'classnames'
import { PrimaryButton } from '../../Buttons'
import { CHALLENGE_PRIZE_TYPE, VALIDATION_VALUE_TYPE } from '../../../config/constants'
import { validateValue } from '../../../util/input-check'

class ChallengePrizesField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEdit: true,
      currentPrizeIndex: -1
    }
    this.renderPrizes = this.renderPrizes.bind(this)
    this.getOrder = this.getOrder.bind(this)
    this.toggleEditMode = this.toggleEditMode.bind(this)
    this.togglePrizeSelect = this.togglePrizeSelect.bind(this)
    this.addNewPrize = this.addNewPrize.bind(this)
    this.removePrize = this.removePrize.bind(this)
    this.getChallengePrize = this.getChallengePrize.bind(this)
    this.onUpdateChallengePrizeType = this.onUpdateChallengePrizeType.bind(this)
    this.onUpdateInput = this.onUpdateInput.bind(this)
  }

  addNewPrize () {
    const challengePrize = this.getChallengePrize()
    challengePrize.prizes = [...challengePrize.prizes, { type: CHALLENGE_PRIZE_TYPE.MONEY, value: 0 }]
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
    this.onUpdateValue(challengePrize)
  }
  onUpdateChallengePrizeType (type, index) {
    const challengePrize = this.getChallengePrize()
    challengePrize.prizes[index].type = type
    this.onUpdateValue(challengePrize)
  }

  onUpdateValue (challengePrize) {
    const type = 'Challenge prizes'
    const { onUpdateOthers, challenge } = this.props

    onUpdateOthers({ field: 'prizeSets', value: [...challenge.prizeSets.filter(p => p.type !== type), challengePrize] })
  }

  getOrder (number) {
    const { isEdit } = this.state
    switch (number) {
      case 1:
        return isEdit ? 'First' : '1st'
      case 2:
        return isEdit ? 'Second' : '2nd'
      case 3:
        return isEdit ? 'Third' : '3rd'
      case 4:
        return isEdit ? 'Fourth' : '4th'
      case 5:
        return isEdit ? 'Fifth' : '5th'
      case 6:
        return isEdit ? 'Sixth' : '6th'
      case 7:
        return isEdit ? 'Seventh' : '7th'
      case 8:
        return isEdit ? 'Eighth' : '8th'
      case 9:
        return isEdit ? 'Ninth' : '9th'
      case 10:
        return isEdit ? 'Tenth' : '10th'
      default:
        return ''
    }
  }

  toggleEditMode () {
    const { isEdit } = this.state
    this.setState({ isEdit: !isEdit })
  }

  togglePrizeSelect (index) {
    if (this.state.currentPrizeIndex !== index) {
      this.setState({ currentPrizeIndex: index })
    }
  }

  getChallengePrize () {
    const type = 'Challenge prizes'
    return this.props.challenge.prizeSets.find(p => p.type === type) || { type, prizes: [{ type: CHALLENGE_PRIZE_TYPE.MONEY, value: 0 }] }
  }

  renderPrizes () {
    const { isEdit, currentPrizeIndex } = this.state

    if (isEdit) {
      return _.map(this.getChallengePrize().prizes, (prize, index) => (
        <div className={styles.row} key={`${index}-${prize.amount}-edit`}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor={`${index}-prize`}>{this.getOrder(index + 1)} Prize :</label>
          </div>
          <div className={cn(styles.field, styles.col2)}>
            <PrizeInput
              prize={prize}
              isFocus={index === currentPrizeIndex}
              onUpdateInput={this.onUpdateInput}
              onUpdateChallengePrizeType={this.onUpdateChallengePrizeType}
              index={index} activeIndex={currentPrizeIndex}
              togglePrizeSelect={this.togglePrizeSelect} />
            {
              index > 0 && (
                <div className={styles.icon} onClick={() => this.removePrize(index)}>
                  <FontAwesomeIcon icon={faTrash} />
                </div>
              )
            }
          </div>
        </div>
      ))
    }

    return (
      <div className={styles.row}>
        {
          _.map(this.getChallengePrize().prizes, (p, index) => {
            if (!_.isEmpty(p.value)) {
              return (
                <div className={styles.item} key={`${index}-${p.value}-noedit`}>
                  <span className={styles.order}>{this.getOrder(index + 1)} Prize</span>
                  <span className={styles.value}>{p.value}</span>
                </div>
              )
            }
          })
        }
      </div>
    )
  }

  render () {
    const { isEdit } = this.state
    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor={`challengePrizes`}>Challenge Prizes :</label>
          </div>
          <div className={cn(styles.field, styles.col2)} onClick={this.toggleEditMode}>
            <div className={cn(styles.editButton, { [styles.active]: isEdit })}>
              <span>Edit</span>
              <FontAwesomeIcon className={cn(styles.icon, { [styles.active]: isEdit })} icon={faAngleDown} />
            </div>
          </div>
        </div>
        { this.renderPrizes() }
        {
          isEdit && (
            <div className={styles.button} onClick={this.addNewPrize}>
              <PrimaryButton text={'Add New Prize'} type={'info'} />
            </div>
          )
        }
      </div>
    )
  }
}

ChallengePrizesField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired
}

export default ChallengePrizesField
