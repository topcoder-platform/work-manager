import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import PrizeInput from '../../PrizeInput'

import styles from './ChallengePrizes-Field.module.scss'
import cn from 'classnames'
import { PrimaryButton } from '../../Buttons'

class ChallengePrizesField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEdit: false,
      currentPrizeIndex: -1
    }
    this.renderPrizes = this.renderPrizes.bind(this)
    this.getOrder = this.getOrder.bind(this)
    this.toggleEditMode = this.toggleEditMode.bind(this)
    this.togglePrizeSelect = this.togglePrizeSelect.bind(this)
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

  renderPrizes () {
    const { isEdit, currentPrizeIndex } = this.state
    const { challenge, removePrize, onUpdateInput, onUpdateChallengePrizeType } = this.props
    if (isEdit) {
      return _.map(challenge.prizes, (prize, index) => (
        <div className={styles.row} key={`${index}-${prize.amount}-edit`}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor={`${index}-prize`}>{this.getOrder(index + 1)} Prize :</label>
          </div>
          <div className={cn(styles.field, styles.col2)}>
            <PrizeInput prize={prize} onUpdateInput={onUpdateInput} onUpdateChallengePrizeType={onUpdateChallengePrizeType} index={index} activeIndex={currentPrizeIndex} togglePrizeSelect={this.togglePrizeSelect} />
            {
              index > 0 && (
                <div className={styles.icon} onClick={() => removePrize(index)}>
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
          _.map(challenge.prizes, (p, index) => {
            if (!_.isEmpty(p.amount)) {
              return (
                <div className={styles.item} key={`${index}-${p.amount}-noedit`}>
                  <span className={styles.order}>{this.getOrder(index + 1)} Prize</span>
                  <span className={styles.amount}>{p.amount}</span>
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
    const { addNewPrize } = this.props
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
            <div className={styles.button} onClick={addNewPrize}>
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
  addNewPrize: PropTypes.func.isRequired,
  removePrize: PropTypes.func.isRequired,
  onUpdateInput: PropTypes.func.isRequired,
  onUpdateChallengePrizeType: PropTypes.func.isRequired
}

export default ChallengePrizesField
