import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import cn from 'classnames'
import moment from 'moment'
import Modal from '../Modal'
import { VALIDATION_VALUE_TYPE } from '../../config/constants'
import { PrimaryButton, OutlineButton } from '../Buttons'
import TrackField from './Track-Field'
import TypeField from './Type-Field'
import ChallengeNameField from './ChallengeName-Field'
import CopilotField from './Copilot-Field'
import ReviewTypeField from './ReviewType-Field'
import TermsField from './Terms-Field'
import GroupsField from './Groups-Field'
import ReviewCostField from './ReviewCost-Field'
import CopilotFeeField from './CopilotFee-Field'
import ChallengeTotalField from './ChallengeTotal-Field'
import ChallengePrizesField from './ChallengePrizes-Field'
import CheckpointPrizesField from './CheckpointPrizes-Field'
import AttachmentField from './Attachment-Field'
import TextEditorField from './TextEditor-Field'
import ChallengeScheduleField from './ChallengeSchedule-Field'
import { validateValue, convertDollarToInteger } from '../../util/input-check'
import dropdowns from './mock-data/dropdowns'
import styles from './CreateNewChallenge.module.scss'

const theme = {
  container: styles.modalContainer
}

const getTitle = (isNew) => {
  if (isNew) {
    return 'Create New Challenge'
  }

  return 'Edit Challenge'
}

class CreateNewChallenge extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isLunch: false,
      isConfirm: false,
      isClose: false,
      currentCopilot: 'thomaskranitsas',
      challenge: null,
      isOpenAdvanceSettings: false,
      showCheckpointPrizes: true
    }
    this.onUpdateInput = this.onUpdateInput.bind(this)
    this.onUpdateSelect = this.onUpdateSelect.bind(this)
    this.onUpdateOthers = this.onUpdateOthers.bind(this)
    this.onUpdateCheckbox = this.onUpdateCheckbox.bind(this)
    this.toggleAdvanceSettings = this.toggleAdvanceSettings.bind(this)
    this.removeAttachment = this.removeAttachment.bind(this)
    this.addNewPrize = this.addNewPrize.bind(this)
    this.removePrize = this.removePrize.bind(this)
    this.removePhase = this.removePhase.bind(this)
    this.resetPhase = this.resetPhase.bind(this)
    this.removeCheckpointPrizesPanel = this.removeCheckpointPrizesPanel.bind(this)
    this.toggleLunch = this.toggleLunch.bind(this)
    this.onUpdateMultiSelect = this.onUpdateMultiSelect.bind(this)
    this.onUpdateChallengePrizeType = this.onUpdateChallengePrizeType.bind(this)
    this.onUpdatePhaseDate = this.onUpdatePhaseDate.bind(this)
    this.onUpdatePhaseTime = this.onUpdatePhaseTime.bind(this)
    this.onUploadFile = this.onUploadFile.bind(this)
    this.calculateTotalChallengeCost = this.calculateTotalChallengeCost.bind(this)
  }

  componentDidMount () {
    const { isNew } = this.props
    if (!isNew) {
      this.setState({ challenge: dropdowns['challenge'] })
    } else {
      this.setState({ challenge: {
        ...dropdowns['newChallenge'],
        reviewType: {
          community: true
        }
      } })
    }
  }

  /**
   * Calculate total cost of the challenge
   * @param newChallenge - ref to updated newChallenge
   */
  calculateTotalChallengeCost (newChallenge) {
    const checkpointNoOfPrizes = newChallenge.checkpointPrizes.checkNumber || 0
    const checkpointPrize = convertDollarToInteger(newChallenge.checkpointPrizes.checkAmount, '$')
    const reviewCost = convertDollarToInteger(newChallenge.reviewCost, '$')
    const copilotFee = convertDollarToInteger(newChallenge.copilotFee, '$')
    const challengeFee = convertDollarToInteger(newChallenge.challengeFee, '$')
    let totalPrizes = 0
    newChallenge.prizes.map(function (prize) {
      if (prize.type === 'money') {
        totalPrizes += convertDollarToInteger(prize.amount, '$')
      }
    })
    newChallenge['challengeTotalAmount'] = '$ ' + (totalPrizes + reviewCost + copilotFee + challengeFee + (checkpointPrize * checkpointNoOfPrizes))
  }

  /**
   * Update Input value of challenge
   * @param e The input event
   * @param isSub The value from sub field of challenge field
   * @param field The challenge field
   * @param index The index of array
   * @param valueType The value type. eg. number, integer, string
   */
  onUpdateInput (e, isSub = false, field = null, index = -1, valueType = null) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    if (!isSub) {
      switch (e.target.name) {
        case 'reviewCost':
        case 'copilotFee':
          newChallenge[e.target.name] = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER, '$')
          break
        default:
          newChallenge[e.target.name] = e.target.value
          break
      }
    } else {
      switch (field) {
        case 'checkpointPrizes':
          switch (e.target.name) {
            case 'checkNumber':
              newChallenge[field][e.target.name] = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER)
              break
            case 'checkAmount':
              newChallenge[field][e.target.name] = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER, '$')
          }
          break
        case 'prizes':
          switch (valueType) {
            case VALIDATION_VALUE_TYPE.STRING:
              newChallenge[field][index]['amount'] = e.target.value.trim()
              newChallenge['focusIndex'] = index
              break
            case VALIDATION_VALUE_TYPE.INTEGER:
              newChallenge['focusIndex'] = index
              newChallenge[field][index]['amount'] = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER)
          }
          break
        default:
          newChallenge[field][e.target.name] = e.target.value
          break
      }
    }

    // calculate total cost of challenge
    this.calculateTotalChallengeCost(newChallenge)
    this.setState({ challenge: newChallenge })
  }

  /**
   * Update Single Select
   * @param option The select option
   * @param isSub The option from sub field
   * @param field The challenge field
   * @param index The index of array
   */
  onUpdateSelect (option, isSub = false, field = '', index = -1) {
    if (option) {
      const { challenge: oldChallenge } = this.state
      const newChallenge = { ...oldChallenge }
      if (!isSub) {
        newChallenge[option.key] = option.name
      } else {
        if (index < 0) {
          newChallenge[field][option.key] = option.name
        } else {
          newChallenge[field][index][option.key] = option.name
        }
      }

      this.setState({ challenge: newChallenge })
    }
  }

  /**
   * Update other fields of challenge
   * @param data
   */
  onUpdateOthers (data) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    newChallenge[data.field] = data.value
    this.setState({ challenge: newChallenge })
  }

  /**
   * Update Checkbox
   * @param id The checkbox id
   * @param checked The check status
   * @param field The challenge field
   * @param index The index of array
   * @param isSingleCheck Allow check only one
   */
  onUpdateCheckbox (id, checked, field = '', index = -1, isSingleCheck = false) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    if (field === 'reviewType' && !checked) {
      return
    }
    if (index < 0) {
      if (!_.isEmpty(field)) {
        if (isSingleCheck) {
          newChallenge[field][id] = checked
        } else {
          if (field !== 'terms') {
            for (let key in newChallenge[field]) {
              if (typeof key === 'boolean') {
                newChallenge[field][key] = false
              } else {
                newChallenge[field][key] = ''
              }
            }
          }
          newChallenge[field][id] = checked
        }
      }
      newChallenge[id] = checked
    } else {
      newChallenge[field][index].check = checked
    }
    this.setState({ challenge: newChallenge })
  }

  toggleAdvanceSettings () {
    const { isOpenAdvanceSettings } = this.state
    this.setState({ isOpenAdvanceSettings: !isOpenAdvanceSettings })
  }

  removeCheckpointPrizesPanel () {
    const { showCheckpointPrizes } = this.state
    this.setState({ showCheckpointPrizes: !showCheckpointPrizes })
  }

  removeAttachment (file) {
    const { challenge } = this.state
    const newChallenge = { ...challenge }
    const { attachments: oldAttachments } = challenge
    const newAttachments = _.remove(oldAttachments, att => att.fileName !== file)
    newChallenge.attachments = _.clone(newAttachments)
    this.setState({ challenge: newChallenge })
  }

  addNewPrize () {
    const prize = {
      amount: 0,
      type: 'money'
    }
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    const newPrizeList = _.cloneDeep(oldChallenge.prizes)
    newPrizeList.push(prize)
    newChallenge.prizes = _.clone(newPrizeList)
    this.setState({ challenge: newChallenge })
  }

  /**
   * Remove prize from challenge prizes list
   * @param index
   */
  removePrize (index) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    const newPrizeList = _.cloneDeep(oldChallenge.prizes)
    newPrizeList.splice(index, 1)
    newChallenge.prizes = _.clone(newPrizeList)
    this.setState({ challenge: newChallenge })
  }
  /**
   * Remove Phase from challenge Phases list
   * @param index
   */
  removePhase (index) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    const newPhaseList = _.cloneDeep(oldChallenge.phases)
    newPhaseList.splice(index, 1)
    newChallenge.phases = _.clone(newPhaseList)
    this.setState({ challenge: newChallenge })
  }
  /**
   * Reset  challenge Phases
   * @param index
   */
  resetPhase () {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    const newPhaseList = _.cloneDeep(dropdowns['newChallenge'].phases)
    newChallenge.phases = _.clone(newPhaseList)
    this.setState({ challenge: newChallenge })
  }

  toggleLunch () {
    this.setState({ isLunch: true })
  }

  /**
   * Update Multi Select
   * @param options The option of select
   * @param field The challenge field
   */
  onUpdateMultiSelect (options, field) {
    if (field === 'terms' && options.indexOf('Standard Topcoder Terms') === -1) return
    const { challenge } = this.state
    const newChallenge = { ...challenge }
    newChallenge[field] = options ? options.split(',') : []
    this.setState({ challenge: newChallenge })
  }

  /**
   * Update type of challenge prize
   * @param type The type name e.g money or gift
   * @param index The index of array
   */
  onUpdateChallengePrizeType (type, index) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    if (oldChallenge.prizes[index].type !== type) {
      newChallenge.prizes[index].type = type
      this.setState({ challenge: newChallenge })
    }
  }

  onUpdatePhaseDate (selectedDay, index) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    if (oldChallenge.phases[index].date !== moment(selectedDay).format('YYYY-MM-DD')) {
      newChallenge.phases[index].date = moment(selectedDay).format('YYYY-MM-DD')
      this.setState({ challenge: newChallenge })
    }
  }

  onUpdatePhaseTime (time, index) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    if (oldChallenge.phases[index].time !== time) {
      newChallenge.phases[index].time = time
      this.setState({ challenge: newChallenge })
    }
  }

  onUploadFile (files) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    _.forEach(files, (file) => {
      newChallenge.attachments.push({
        fileName: file.name,
        size: file.size
      })
    })
    this.setState({ challenge: newChallenge })
  }

  render () {
    const { isLunch, isConfirm, challenge, isOpenAdvanceSettings, showCheckpointPrizes } = this.state
    const { isNew } = this.props
    if (_.isEmpty(challenge)) {
      return <div>&nbsp;</div>
    }
    return (
      <div className={styles.wrapper}>
        <Helmet title={getTitle(isNew)} />
        <div className={styles.title}>{getTitle(isNew)}</div>
        <div className={styles.textRequired}>* Required</div>
        <div className={styles.container}>
          { isLunch && !isConfirm && (
            <Modal theme={theme}>
              <div className={styles.contentContainer}>
                <div className={styles.title}>Launch Challenge Confirmation</div>
                <span>Do you want to launch this challenge?</span>
                <div className={styles.buttonGroup}>
                  <div className={styles.button}>
                    <OutlineButton text={'Cancel'} type={'danger'} onClick={() => this.setState({ isLunch: false })} />
                  </div>
                  <div className={styles.button}>
                    <PrimaryButton text={'Confirm'} type={'info'} onClick={() => { this.setState({ isConfirm: true }) }} />
                  </div>
                </div>
              </div>
            </Modal>
          ) } { isLunch && isConfirm && (
            <Modal theme={theme}>
              <div className={cn(styles.contentContainer, styles.confirm)}>
                <div className={styles.title}>Success</div>
                <span>We have scheduled your challenge and processed the payment</span>
                <div className={styles.buttonGroup}>
                  <div className={styles.buttonSizeA}>
                    <PrimaryButton text={'Back to Dashboard'} type={'info'} link={'/'} />
                  </div>
                  <div className={styles.buttonSizeA}>
                    <OutlineButton text={'View Challenge'} type={'success'} link={'/challenges/30043616'} />
                  </div>
                </div>
              </div>
            </Modal>
          ) }
          <div className={styles.formContainer}>
            <form name='challenge-info-form' noValidate autoComplete='off'>
              <div className={styles.group}>
                <TrackField challenge={challenge} onUpdateOthers={this.onUpdateOthers} />
                <TypeField types={dropdowns['trackType']} onUpdateSelect={this.onUpdateSelect} challenge={challenge} />
                <ChallengeNameField challenge={challenge} onUpdateInput={this.onUpdateInput} />
                <CopilotField challenge={challenge} copilots={dropdowns['copilots']} onUpdateOthers={this.onUpdateOthers} />
                <ReviewTypeField reviewers={dropdowns['reviewers']} challenge={challenge} onUpdateCheckbox={this.onUpdateCheckbox} onUpdateSelect={this.onUpdateSelect} />
                <div className={styles.row}>
                  <div className={styles.tcCheckbox}>
                    <input name='isOpenAdvanceSettings' type='checkbox' id='isOpenAdvanceSettings' checked={isOpenAdvanceSettings} onChange={this.toggleAdvanceSettings} />
                    <label htmlFor='isOpenAdvanceSettings'>
                      <div>
                        View Advance Settings
                      </div>
                      <input type='hidden' />
                    </label>
                  </div>
                </div>
                { isOpenAdvanceSettings && (
                  <React.Fragment>
                    <TermsField terms={dropdowns['terms']} challenge={challenge} onUpdateMultiSelect={this.onUpdateMultiSelect} />
                    <GroupsField groups={dropdowns['groups']} onUpdateSelect={this.onUpdateSelect} challenge={challenge} />
                    <hr className={styles.breakLine} />
                  </React.Fragment>
                ) }
                <ChallengeScheduleField templates={dropdowns['timelineTemplates']} removePhase={this.removePhase} resetPhase={this.resetPhase} challenge={challenge} onUpdateSelect={this.onUpdateSelect} isOpenAdvanceSettings={isOpenAdvanceSettings} onUpdatePhaseDate={this.onUpdatePhaseDate} onUpdatePhaseTime={this.onUpdatePhaseTime} />
              </div>
              <div className={styles.group}>
                <div className={styles.title}>Details requirements</div>
                <TextEditorField keywords={dropdowns['keywords']} challenge={challenge} onUpdateCheckbox={this.onUpdateCheckbox} onUpdateInput={this.onUpdateInput} onUpdateMultiSelect={this.onUpdateMultiSelect} />
                <AttachmentField challenge={challenge} removeAttachment={this.removeAttachment} onUploadFile={this.onUploadFile} />
                <ChallengePrizesField challenge={challenge} addNewPrize={this.addNewPrize} removePrize={this.removePrize} onUpdateInput={this.onUpdateInput} onUpdateChallengePrizeType={this.onUpdateChallengePrizeType} /> {showCheckpointPrizes && (
                  <CheckpointPrizesField challenge={challenge} onUpdateInput={this.onUpdateInput} removeCheckpointPrizesPanel={this.removeCheckpointPrizesPanel} />)}
                <ReviewCostField challenge={challenge} onUpdateInput={this.onUpdateInput} />
                <CopilotFeeField challenge={challenge} onUpdateInput={this.onUpdateInput} />
                <ChallengeTotalField challenge={challenge} />
              </div>
            </form>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <div className={styles.button}>
            <OutlineButton text={'Cancel'} type={'danger'} link={'/'} />
          </div>
          <div className={styles.button}>
            <OutlineButton text={'Save as Draft'} type={'success'} />
          </div>
          <div className={styles.button}>
            <OutlineButton text={'Save as Templates'} type={'success'} />
          </div>
          <div className={styles.button}>
            <PrimaryButton text={'Launch'} type={'info'} onClick={() => (this.setState({ isLunch: true }))} />
          </div>
        </div>
      </div>
    )
  }
}

CreateNewChallenge.defaultProps = {
  challengeId: null
}

CreateNewChallenge.propTypes = {
  isNew: PropTypes.bool.isRequired
}

export default CreateNewChallenge
