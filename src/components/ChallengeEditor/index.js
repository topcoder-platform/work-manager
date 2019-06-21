import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import cn from 'classnames'
import moment from 'moment'
import { pick } from 'lodash/fp'
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
import CopilotFeeField from './CopilotFee-Field'
import ChallengeTotalField from './ChallengeTotal-Field'
import ChallengePrizesField from './ChallengePrizes-Field'
import AttachmentField from './Attachment-Field'
import TextEditorField from './TextEditor-Field'
import ChallengeScheduleField from './ChallengeSchedule-Field'
import { convertDollarToInteger, validateValue } from '../../util/input-check'
import dropdowns from './mock-data/dropdowns'
import styles from './ChallengeEditor.module.scss'
import Loader from '../Loader'
import { createChallenge, fetchChallenge, updateChallenge } from '../../services/challenges'

const theme = {
  container: styles.modalContainer
}

const getTitle = (isNew) => {
  if (isNew) {
    return 'Create New Challenge'
  }

  return 'Edit Challenge'
}

class ChallengeEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isLaunch: false,
      isConfirm: false,
      isClose: false,
      challenge: null,
      isOpenAdvanceSettings: false,
      isLoading: false,
      isSaving: false,
      hasValidationErrors: false
    }
    this.onUpdateInput = this.onUpdateInput.bind(this)
    this.onUpdateSelect = this.onUpdateSelect.bind(this)
    this.onUpdateOthers = this.onUpdateOthers.bind(this)
    this.onUpdateCheckbox = this.onUpdateCheckbox.bind(this)
    this.toggleAdvanceSettings = this.toggleAdvanceSettings.bind(this)
    this.removeAttachment = this.removeAttachment.bind(this)
    this.removePhase = this.removePhase.bind(this)
    this.resetPhase = this.resetPhase.bind(this)
    this.toggleLaunch = this.toggleLaunch.bind(this)
    this.onUpdateMultiSelect = this.onUpdateMultiSelect.bind(this)
    this.onUpdateChallengePrizeType = this.onUpdateChallengePrizeType.bind(this)
    this.onUpdatePhase = this.onUpdatePhase.bind(this)
    this.onUploadFile = this.onUploadFile.bind(this)
    this.resetChallengeData = this.resetChallengeData.bind(this)
    this.onUpdateDescription = this.onUpdateDescription.bind(this)
    this.onSubmitChallenge = this.onSubmitChallenge.bind(this)
    this.saveDraft = this.saveDraft.bind(this)
    this.resetModal = this.resetModal.bind(this)
  }

  componentDidMount () {
    this.resetChallengeData(this.props.isNew, this.props.challengeId)
  }

  componentWillReceiveProps (nextProps) {
    const { isNew } = this.props
    const { isNew: newValue, challengeId } = nextProps
    if (isNew !== newValue) this.resetChallengeData(newValue, challengeId)
  }

  async resetChallengeData (isNew, challengeId) {
    if (!isNew) {
      try {
        this.setState({ isLoading: true, isConfirm: false, isLaunch: false })
        const challenge = await fetchChallenge(challengeId)
        this.setState({ challenge: { ...dropdowns['newChallenge'], ...challenge }, isLoading: false })
      } catch (e) {
        window.location = window.location.origin
        this.setState({ isLoading: true })
      }
    } else {
      this.setState({ challenge: {
        ...dropdowns['newChallenge'],
        startDate: moment().add(1, 'hour'),
        phases: []
      } })
    }
  }

  resetModal () {
    this.setState({ isLoading: true, isConfirm: false, isLaunch: false })
  }
  onUpdateDescription (description) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge, description }
    this.setState({ challenge: newChallenge })
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
        newChallenge[field] = option
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

  removeAttachment (file) {
    const { challenge } = this.state
    const newChallenge = { ...challenge }
    const { attachments: oldAttachments } = challenge
    const newAttachments = _.remove(oldAttachments, att => att.fileName !== file)
    newChallenge.attachments = _.clone(newAttachments)
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
   */
  resetPhase (timeline) {
    const validPhase = this.props.metadata.challengePhases.filter(p => {
      return timeline.phases.map(p => p.name || p).indexOf(p.name) !== -1
    })

    const sorted = []

    for (let i = 0; i < timeline.phases.length; i += 1) {
      sorted.push(_.find(validPhase, p => p.name === timeline.phases[i]))
    }

    this.onUpdateOthers({
      field: 'phases',
      value: sorted
    })
  }

  toggleLaunch () {
    if (this.validateChallenge()) {
      this.setState({ isLaunch: true })
    }
  }

  validateChallenge () {
    if (Object.values(pick(['track', 'typeId', 'name', 'description', 'tags', 'prizeSets'], this.state.challenge)).filter(v => !v.length).length) {
      this.setState(prevState => ({
        ...prevState,
        challenge: {
          ...prevState.challenge,
          submitTriggered: true
        }
      }))
      this.setState({ hasValidationErrors: true })
      return false
    }
    this.setState({ hasValidationErrors: false })
    return true
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

  onUpdatePhase (newValue, property, index) {
    if (property === 'duration' && newValue < 0) newValue = 0
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    newChallenge.phases[index][property] = newValue
    this.setState({ challenge: newChallenge })
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

  saveDraft () {
    if (this.validateChallenge()) {
      this.onSubmitChallenge('Draft')
    }
  }
  async onSubmitChallenge (status = 'Active') {
    if (this.state.isSaving) return
    const { challengeId } = this.props
    const challenge = pick(['phases', 'typeId', 'track', 'name', 'description', 'reviewType', 'tags', 'groups', 'prizeSets', 'startDate'], this.state.challenge)
    challenge.phases = challenge.phases.map(pick(['description', 'duration', 'id', 'isActive', 'name', 'predecessor']))
    challenge.timelineTemplateId = this.props.metadata.timelineTemplates[0].id
    challenge.projectId = this.props.projectId
    challenge.prizeSets = challenge.prizeSets.map(p => {
      const prizes = p.prizes.map(s => ({ ...s, value: convertDollarToInteger(s.value, '$') }))
      return { ...p, prizes }
    })
    challenge.status = status
    try {
      this.setState({ isSaving: true })
      const response = challengeId ? await updateChallenge(challenge, challengeId) : await createChallenge(challenge)
      this.setState({ isLaunch: true, isConfirm: response.data.id, challenge: { ...this.state.challenge, ...challenge }, isSaving: false })
    } catch (e) {
      this.setState({ isSaving: false })
    }
  }
  render () {
    const { isLaunch, isConfirm, challenge, isOpenAdvanceSettings } = this.state
    const { isNew, isLoading, metadata } = this.props
    if (_.isEmpty(challenge)) {
      return <div>&nbsp;</div>
    }
    return (
      <div className={styles.wrapper}>
        <Helmet title={getTitle(isNew)} />
        <div className={styles.title}>{getTitle(isNew)}</div>
        {!isLoading && <div className={styles.textRequired}>* Required</div>}
        {!isLoading ? <div className={styles.container}>
          { isLaunch && !isConfirm && (
            <Modal theme={theme}>
              <div className={styles.contentContainer}>
                <div className={styles.title}>Launch Challenge Confirmation</div>
                <span>Do you want to launch this challenge?</span>
                <div className={styles.buttonGroup}>
                  <div className={styles.button}>
                    <OutlineButton text={'Cancel'} type={'danger'} onClick={() => this.resetModal()} />
                  </div>
                  <div className={styles.button}>
                    <PrimaryButton text={this.state.isSaving ? 'Saving...' : 'Confirm'} type={'info'} onClick={() => this.onSubmitChallenge('Active')} />
                  </div>
                </div>
              </div>
            </Modal>
          ) } { isLaunch && isConfirm && (
            <Modal theme={theme}>
              <div className={cn(styles.contentContainer, styles.confirm)}>
                <div className={styles.title}>Success</div>
                <span>{ challenge.status === 'Draft' ? 'Your challenge is saved as draft' : 'We have scheduled your challenge and processed the payment'}</span>
                <div className={styles.buttonGroup}>
                  <div className={styles.buttonSizeA}>
                    <PrimaryButton text={'Back to Dashboard'} type={'info'} link={'/'} />
                  </div>
                  <div className={styles.buttonSizeA} onClick={() => this.resetModal()}>
                    <OutlineButton text={'View Challenge'} type={'success'} link={`/projects/${this.props.projectId}/challenges/${isConfirm}/edit`} />
                  </div>
                </div>
              </div>
            </Modal>
          ) }
          <div className={styles.formContainer}>
            <form name='challenge-info-form' noValidate autoComplete='off'>
              <div className={styles.group}>
                <TrackField challenge={challenge} onUpdateOthers={this.onUpdateOthers} />
                <TypeField types={metadata.challengeTypes} onUpdateSelect={this.onUpdateSelect} challenge={challenge} />
                <ChallengeNameField challenge={challenge} onUpdateInput={this.onUpdateInput} />
                <CopilotField challenge={challenge} copilots={metadata.members} onUpdateOthers={this.onUpdateOthers} />
                <ReviewTypeField reviewers={metadata.members} challenge={challenge} onUpdateOthers={this.onUpdateOthers} onUpdateSelect={this.onUpdateSelect} />
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
                    <GroupsField groups={metadata.groups} onUpdateMultiSelect={this.onUpdateMultiSelect} challenge={challenge} />
                    <hr className={styles.breakLine} />
                  </React.Fragment>
                ) }
                <ChallengeScheduleField templates={metadata.timelineTemplates} removePhase={this.removePhase} resetPhase={this.resetPhase} challenge={challenge} onUpdateSelect={this.onUpdateSelect} isOpenAdvanceSettings={isOpenAdvanceSettings} onUpdatePhase={this.onUpdatePhase} onUpdateOthers={this.onUpdateOthers} />
              </div>
              <div className={styles.group}>
                <div className={styles.title}>Detailed Requirements</div>
                <TextEditorField keywords={dropdowns['keywords']} challenge={challenge} onUpdateCheckbox={this.onUpdateCheckbox} onUpdateInput={this.onUpdateInput} onUpdateDescription={this.onUpdateDescription} onUpdateMultiSelect={this.onUpdateMultiSelect} />
                { false && (
                  <AttachmentField challenge={challenge} removeAttachment={this.removeAttachment} onUploadFile={this.onUploadFile} />
                )}
                <ChallengePrizesField challenge={challenge} onUpdateOthers={this.onUpdateOthers} />
                <CopilotFeeField challenge={challenge} onUpdateOthers={this.onUpdateOthers} />
                <ChallengeTotalField challenge={challenge} />
                { this.state.hasValidationErrors && !challenge.prizeSets.length && <div className={styles.error}>Should have at-least 1 prize value</div> }
              </div>
            </form>
          </div>
        </div> : <Loader />}
        {!isLoading && this.state.hasValidationErrors && <div className={styles.error}>Please fix the errors before saving</div>}
        {!isLoading && <div className={styles.buttonContainer}>
          <div className={styles.button}>
            <OutlineButton text={'Cancel'} type={'danger'} link={'/'} />
          </div>
          { isNew && (
            <div className={styles.button}>
              <OutlineButton text={this.state.isSaving ? 'Saving...' : 'Save as Draft'} type={'success'} onClick={this.saveDraft} />
            </div>
          ) }
          <div className={styles.button}>
            <PrimaryButton text={isNew ? 'Launch' : 'Update'} type={'info'} onClick={this.toggleLaunch} />
          </div>
        </div>}
      </div>
    )
  }
}

ChallengeEditor.defaultProps = {
  challengeId: null
}

ChallengeEditor.propTypes = {
  isNew: PropTypes.bool.isRequired,
  projectId: PropTypes.string.isRequired,
  challengeId: PropTypes.string,
  metadata: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired
}

export default ChallengeEditor
