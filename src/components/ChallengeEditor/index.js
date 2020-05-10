import _ from 'lodash'
import * as queryString from 'query-string'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import cn from 'classnames'
import moment from 'moment'
import { pick } from 'lodash/fp'
import Modal from '../Modal'
import { withRouter } from 'react-router-dom'
import { toastr } from 'react-redux-toastr'

import { VALIDATION_VALUE_TYPE, PRIZE_SETS_TYPE } from '../../config/constants'
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
import Loader from '../Loader'
import ChallengeScheduleField from './ChallengeSchedule-Field'
import { convertDollarToInteger, validateValue } from '../../util/input-check'
import dropdowns from './mock-data/dropdowns'
import LastSavedDisplay from './LastSaved-Display'
import styles from './ChallengeEditor.module.scss'
import Track from '../Track'
import {
  createChallenge,
  updateChallenge,
  createResource,
  deleteResource,
  patchChallenge
} from '../../services/challenges'

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
      isOpenAdvanceSettings: false,
      isLoading: false,
      isSaving: false,
      hasValidationErrors: false,
      challenge: {
        ...dropdowns['newChallenge']
      },
      draftChallenge: { data: { id: null } },
      timeLastSaved: moment().format('MMMM Do YYYY, h:mm:ss a'),
      currentTemplate: null
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
    this.onUpdatePhase = this.onUpdatePhase.bind(this)
    this.resetChallengeData = this.resetChallengeData.bind(this)
    this.onUpdateDescription = this.onUpdateDescription.bind(this)
    this.onActiveChallenge = this.onActiveChallenge.bind(this)
    this.resetModal = this.resetModal.bind(this)
    this.createNewChallenge = this.createNewChallenge.bind(this)
    this.getCurrentChallengeId = this.getCurrentChallengeId.bind(this)
    this.isValidChallenge = this.isValidChallenge.bind(this)
    this.createChallengeHandler = this.createChallengeHandler.bind(this)
    this.createDraftHandler = this.createDraftHandler.bind(this)
    this.getCurrentTemplate = this.getCurrentTemplate.bind(this)
    this.getBackendChallengePhases = this.getBackendChallengePhases.bind(this)
    this.onUpdateMetadata = this.onUpdateMetadata.bind(this)
    this.autoUpdateChallengeThrottled = _.throttle(this.autoUpdateChallenge.bind(this), 3000) // 3s
    this.componentDidUpdate()
  }

  componentDidUpdate () {
    const { isNew, challengeId, challengeDetails, metadata, attachments } = this.props
    if (
      challengeDetails &&
      challengeDetails.id &&
      (!this.state.challenge || this.state.challenge.id !== challengeDetails.id)) {
      this.resetChallengeData(isNew, challengeId, challengeDetails, metadata, attachments)
    }
  }

  async resetChallengeData (isNew, challengeId, challengeDetails, metadata, attachments) {
    if (!isNew) {
      try {
        const copilotResource = this.getResourceFromProps('Copilot')
        const copilotFromResources = copilotResource ? copilotResource.memberHandle : ''
        const reviewerResource = this.getResourceFromProps('Reviewer')
        const reviewerFromResources = reviewerResource ? reviewerResource.memberHandle : ''
        this.setState({ isConfirm: false, isLaunch: false })
        const challengeData = this.updateAttachmentlist(challengeDetails, attachments)
        const currentTemplate = _.find(metadata.timelineTemplates, { id: challengeData.timelineTemplateId })
        let copilot, reviewer
        const challenge = this.state.challenge
        if (challenge) {
          copilot = challenge.copilot
          reviewer = challenge.reviewer
        }
        challengeData.copilot = copilot || copilotFromResources
        challengeData.reviewer = reviewer || reviewerFromResources
        this.setState({
          challenge: { ...dropdowns['newChallenge'], ...challengeData },
          isLoading: false,
          currentTemplate
        })
      } catch (e) {
        this.setState({ isLoading: true })
      }
    }
  }

  resetModal () {
    this.setState({ isLoading: false, isConfirm: false, isLaunch: false })
  }

  onUpdateDescription (description, fieldName) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge, [fieldName]: description }
    this.setState({ challenge: newChallenge }, () => {
      this.autoUpdateChallengeThrottled(fieldName)
    })
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
    let fieldChanged = null
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
      fieldChanged = e.target.name
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
      fieldChanged = field
    }

    // calculate total cost of challenge
    this.setState({ challenge: newChallenge }, () => {
      this.autoUpdateChallengeThrottled(fieldChanged)
    })
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
      const prevValue = oldChallenge[field]
      this.setState({ challenge: newChallenge }, () => {
        this.autoUpdateChallengeThrottled(field, prevValue)
      })
    }
  }

  /**
   * Update other fields of challenge
   * @param data
   */
  onUpdateOthers (data) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    let { value, field } = data
    if (field === 'copilot' && value === newChallenge[field]) {
      value = null
    }
    if (field === 'prizeSets') {
      value = value.filter(val => PRIZE_SETS_TYPE.includes(val.type))
    }
    newChallenge[field] = value
    const prevValue = oldChallenge[field]
    this.setState({ challenge: newChallenge }, () => {
      this.autoUpdateChallengeThrottled(field, prevValue)
    })
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
          _.set(newChallenge, `${field}.${id}`, checked)
        } else {
          if (field !== 'terms') {
            for (let key in newChallenge[field]) {
              if (typeof key === 'boolean') {
                _.set(newChallenge, `${field}.${key}`, false)
              } else {
                _.set(newChallenge, `${field}.${key}`, '')
              }
            }
          }
          _.set(newChallenge, `${field}.${id}`, checked)
        }
      }
      newChallenge[id] = checked
    } else {
      _.set(newChallenge, `${field}.${index}.check`, checked)
    }
    this.setState({ challenge: newChallenge }, () => {
      this.autoUpdateChallengeThrottled(field)
    })
  }

  /**
   * Update Metadata
   * @param name Name of data
   * @param value The value
   * @param path Path of value
   */
  onUpdateMetadata (name, value, path) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    if (!newChallenge.metadata) {
      newChallenge.metadata = []
    }
    let existingMetadata = _.find(newChallenge.metadata, { name })
    if (!existingMetadata) {
      existingMetadata = { name }
      newChallenge.metadata.push(existingMetadata)
      if (name === 'submissionLimit') {
        existingMetadata.value = '{}'
      }
    }
    if (existingMetadata.name === 'submissionLimit') {
      const submissionLimit = JSON.parse(existingMetadata.value)
      _.forOwn(submissionLimit, (value, key) => {
        if (value === 'true') {
          submissionLimit[key] = 'false'
        }
      })
      submissionLimit[path] = `${value}`
      if (path === 'count') {
        submissionLimit.limit = 'true'
        submissionLimit.unlimited = 'false'
      } else if (path === 'unlimited' && value) {
        submissionLimit.limit = 'false'
        submissionLimit.count = ''
      }
      existingMetadata.value = JSON.stringify(submissionLimit)
    } else {
      existingMetadata.value = `${value}`
    }
    this.setState({ challenge: newChallenge }, () => {
      this.autoUpdateChallengeThrottled('metadata')
    })
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
    this.setState({ challenge: newChallenge }, () => {
      this.autoUpdateChallengeThrottled('attachments')
    })
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
    this.setState({ challenge: newChallenge }, () => {
      this.autoUpdateChallengeThrottled('phases')
    })
  }
  /**
   * Reset  challenge Phases
   */
  resetPhase (timeline) {
    const timelinePhaseIds = timeline.phases.map(timelinePhase => timelinePhase.phaseId || timelinePhase)
    const validPhases = this.props.metadata.challengePhases.filter(challengePhase => {
      return timelinePhaseIds.includes(challengePhase.id)
    })
    validPhases.forEach(phase => {
      delete Object.assign(phase, { phaseId: phase.id }).id
    })

    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    newChallenge.timelineTemplateId = timeline.id
    this.setState({
      currentTemplate: timeline,
      challenge: newChallenge
    }, () => {
      this.onUpdateOthers({
        field: 'phases',
        value: validPhases
      })
    })
  }

  toggleLaunch (e) {
    e.preventDefault()
    if (this.validateChallenge()) {
      this.setState({ isLaunch: true })
    }
  }

  createDraftHandler () {
    if (this.validateChallenge()) {
      this.saveDraft()
    }
  }

  createChallengeHandler (e) {
    e.preventDefault()
    if (this.validateChallenge()) {
      this.createNewChallenge()
    }
  }

  isValidChallenge () {
    const { challenge } = this.state
    if (this.props.isNew) {
      const { name, track, typeId } = challenge
      return !!name && !!track && !!typeId
    }

    const reviewType = challenge.reviewType ? challenge.reviewType.toLowerCase() : 'community'
    const isInternal = reviewType === 'internal'
    if (isInternal && !challenge.reviewer) {
      return false
    }

    return !(Object.values(pick(['track', 'typeId', 'name', 'description', 'tags', 'prizeSets'],
      challenge)).filter(v => !v.length).length || _.isEmpty(this.state.currentTemplate))
  }

  validateChallenge () {
    if (this.isValidChallenge()) {
      this.setState({ hasValidationErrors: false })
      return true
    }
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

  /**
   * Update Multi Select
   * @param options The option of select
   * @param field The challenge field
   */
  onUpdateMultiSelect (options, field) {
    const { challenge } = this.state
    let newChallenge = { ...challenge }
    newChallenge[field] = options ? options.split(',') : []

    this.setState({ challenge: newChallenge }, () => {
      this.autoUpdateChallengeThrottled(field)
    })
  }

  onUpdatePhase (newValue, property, index) {
    if (property === 'duration' && newValue < 0) newValue = 0
    let newChallenge = _.cloneDeep(this.state.challenge)
    newChallenge.phases[index][property] = newValue
    this.setState({ challenge: newChallenge }, () => {
      this.autoUpdateChallengeThrottled('phases')
    })
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
    this.setState({ challenge: newChallenge }, () => {
      this.autoUpdateChallengeThrottled('attachments')
    })
  }

  collectChallengeData (status) {
    const { attachments } = this.props
    const challenge = pick([
      'phases',
      'typeId',
      'track',
      'name',
      'description',
      'privateDescription',
      'reviewType',
      'tags',
      'groups',
      'prizeSets',
      'startDate',
      'terms'], this.state.challenge)
    challenge.legacy = {
      reviewType: challenge.reviewType,
      track: challenge.track
    }
    challenge.timelineTemplateId = this.props.metadata.timelineTemplates[0].id
    challenge.projectId = this.props.projectId
    challenge.prizeSets = challenge.prizeSets.map(p => {
      const prizes = p.prizes.map(s => ({ ...s, value: convertDollarToInteger(s.value, '$') }))
      return { ...p, prizes }
    })
    challenge.status = status
    if (this.state.challenge.id) {
      challenge.attachmentIds = _.map(attachments, item => item.id)
    }
    challenge.phases = challenge.phases.map((p) => pick([
      'duration',
      'phaseId'
    ], p))
    if (challenge.terms && challenge.terms.length === 0) delete challenge.terms
    delete challenge.attachments
    delete challenge.track
    delete challenge.reviewType
    return challenge
  }

  goToEdit (challengeID) {
    const { history } = this.props
    const newPath = history.location.pathname.replace('/new', `/${challengeID}`) + '/edit'
    history.push(newPath)
  };

  async createNewChallenge () {
    if (!this.props.isNew) return

    const { name, track, typeId } = this.state.challenge
    const newChallenge = {
      status: 'New',
      projectId: this.props.projectId,
      name,
      typeId,
      startDate: moment().add(1, 'days').format(),
      legacy: {
        track,
        reviewType: 'community'
      }
    }
    try {
      const draftChallenge = await createChallenge(newChallenge)
      this.goToEdit(draftChallenge.data.id)
      this.setState({ isSaving: false, draftChallenge })
    } catch (e) {
      this.setState({ isSaving: false })
    }
  }

  async autoUpdateChallenge (changedField, prevValue) {
    if (this.state.isSaving || this.state.isLoading || !this.getCurrentChallengeId()) return
    const challengeId = this.state.draftChallenge.data.id || this.props.challengeId
    if (_.includes(['copilot', 'reviewer'], changedField)) {
      switch (changedField) {
        case 'copilot':
          await this.updateResource(challengeId, 'Copilot', this.state.challenge.copilot, prevValue)
          break
        case 'reviewer':
          await this.updateResource(challengeId, 'Reviewer', this.state.challenge.reviewer, prevValue)
          break
      }
    } else {
      let patchObject = (changedField === 'reviewType')
        ? { legacy: { reviewType: this.state.challenge[changedField] } }
        : { [changedField]: this.state.challenge[changedField] }
      if (changedField === 'phases') {
        // need timelineTemplateId for updating phase
        patchObject.timelineTemplateId = this.state.challenge.timelineTemplateId
      }
      try {
        const draftChallenge = await patchChallenge(challengeId, patchObject)
        this.setState({ draftChallenge })
        this.updateTimeLastSaved()
      } catch (error) {
        if (changedField === 'groups') {
          toastr.error('Error', `You don't have access to the ${patchObject.groups[0]} group`)
          const newGroups = this.state.challenge.groups.filter(group => group !== patchObject.groups[0])
          this.setState({ challenge: { ...this.state.challenge, groups: newGroups } })
        }
      }
    }
  }

  getCurrentChallengeId () {
    let { challengeId } = this.props
    if (!challengeId) {
      challengeId = this.state.draftChallenge.data.id
    }
    if (!challengeId) {
      const { history } = this.props
      const queryParams = queryString.parse(history.location.search)
      challengeId = queryParams.challengeId
    }
    return challengeId
  }

  async onActiveChallenge () {
    if (this.state.isSaving) return
    this.setState({ isSaving: true })
    const status = 'Active'
    let newChallenge = _.cloneDeep(this.state.challenge)
    newChallenge.status = status
    try {
      const draftChallenge = await patchChallenge(newChallenge.id, {
        status
      })
      this.setState({ isLaunch: true, isConfirm: newChallenge.id, draftChallenge, challenge: newChallenge, isSaving: false })
    } catch (e) {
      this.setState({ isSaving: false })
    }
  }

  async saveDraft () {
    this.setState({ isSaving: true })
    try {
      const status = 'Draft'
      let newChallenge = _.cloneDeep(this.state.challenge)
      newChallenge.status = status
      const draftChallenge = await patchChallenge(newChallenge.id, {
        status
      })
      this.setState({ isLaunch: true, isConfirm: newChallenge.id, draftChallenge, challenge: newChallenge, isSaving: false })
    } catch (e) {
      this.setState({ isSaving: false })
    }
  }

  updateTimeLastSaved () {
    this.setState({ timeLastSaved: moment().format('MMMM Do YYYY, h:mm:ss a') })
  }

  async updateAllChallengeInfo (challenge) {
    const challengeId = this.getCurrentChallengeId()
    const response = await updateChallenge(challenge, challengeId)
    this.updateTimeLastSaved()
    this.setState({ draftChallenge: response })
    return response
  }

  getResourceRoleByName (name) {
    const { resourceRoles } = this.props.metadata
    return resourceRoles ? resourceRoles.find(role => role.name === name) : null
  }

  async updateResource (challengeId, name, value, prevValue) {
    const resourceRole = this.getResourceRoleByName(name)
    const newResource = {
      challengeId,
      memberHandle: value,
      roleId: resourceRole ? resourceRole.id : null
    }
    if (prevValue) {
      const oldResource = _.pick(newResource, ['challengeId', 'roleId'])
      oldResource.memberHandle = prevValue
      await deleteResource(oldResource)
    }

    await createResource(newResource)
    this.updateTimeLastSaved()
  }

  updateAttachmentlist (challenge, attachments) {
    const newChallenge = _.cloneDeep(challenge)
    if (attachments.length > 0) {
      if (!_.has(challenge, 'attachments')) {
        newChallenge.attachments = []
      }

      newChallenge.attachments = _.cloneDeep(attachments)
    } else {
      newChallenge.attachments = []
    }

    return newChallenge
  }

  getResourceFromProps (name) {
    const { challengeResources } = this.props
    const role = this.getResourceRoleByName(name)
    return challengeResources && role && challengeResources.find(resource => resource.roleId === role.id)
  }

  getCurrentTemplate () {
    const { currentTemplate, challenge } = this.state
    if (currentTemplate) {
      return currentTemplate
    }
    const { metadata } = this.props
    if (!challenge) {
      return null
    }
    return _.find(metadata.timelineTemplates, { id: challenge.timelineTemplateId })
  }

  getBackendChallengePhases () {
    const { draftChallenge } = this.state
    if (!draftChallenge.data.id) {
      return []
    }
    return draftChallenge.data.phases
  }

  render () {
    const { isLaunch, isConfirm, challenge, isOpenAdvanceSettings, timeLastSaved } = this.state
    const {
      isNew,
      isLoading,
      metadata,
      uploadAttachment,
      token,
      removeAttachment,
      failedToLoad,
      projectDetail
    } = this.props
    if (_.isEmpty(challenge)) {
      return <div>Error loading challenge</div>
    }
    let isActive = false
    let isCompleted = false
    if (challenge.status) {
      isActive = challenge.status.toLowerCase() === 'active'
      isCompleted = challenge.status.toLowerCase() === 'completed'
    }
    if (isLoading || _.isEmpty(metadata.challengePhases)) return <Loader />
    if (failedToLoad) {
      return (
        <div className={styles.wrapper}>
          <div className={styles.title}>There was an error loading the challenge</div>
          <br />
          <div className={styles.container}>
            <div className={styles.formContainer}>
              <div className={styles.group}>
                <div className={styles.row}>
                  <div className={styles.error}>
                    Please try again later and if the issue persists contact us at&nbsp;
                    <a href='mailto:support@topcoder.com'>support@topcoder.com</a>
                    &nbsp;to resolve the issue as soon as possible.
                  </div>
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    let activateModal = null
    let draftModal = null

    let { type } = challenge
    if (!type) {
      const { typeId } = challenge
      if (typeId && metadata.challengeTypes) {
        const selectedType = _.find(metadata.challengeTypes, { id: typeId })
        if (selectedType) {
          type = selectedType.name
        }
      }
    }

    if (!isNew && isLaunch && !isConfirm) {
      activateModal = (
        <Modal theme={theme} onCancel={this.resetModal}>
          <div className={styles.contentContainer}>
            <div className={styles.title}>Launch Challenge Confirmation</div>
            <span>{`Do you want to launch ${type} challenge "${challenge.name}"?`}</span>
            <div className={styles.buttonGroup}>
              <div className={styles.button}>
                <OutlineButton
                  className={cn({ disabled: this.state.isSaving })}
                  text={'Cancel'}
                  type={'danger'}
                  onClick={this.resetModal}
                />
              </div>
              <div className={styles.button}>
                <PrimaryButton
                  text={this.state.isSaving ? 'Launching...' : 'Confirm'}
                  type={'info'}
                  onClick={this.onActiveChallenge}
                />
              </div>
            </div>
          </div>
        </Modal>
      )
    }

    if (!isNew && isLaunch && isConfirm) {
      draftModal = (
        <Modal theme={theme} onCancel={() => this.resetModal()}>
          <div className={cn(styles.contentContainer, styles.confirm)}>
            <div className={styles.title}>Success</div>
            <span>{
              challenge.status === 'Draft'
                ? 'Your challenge is saved as draft'
                : 'We have scheduled your challenge and processed the payment'
            }</span>
            <div className={styles.buttonGroup}>
              <div className={styles.buttonSizeA}>
                <PrimaryButton
                  text={'Close'}
                  type={'info'}
                  link={'/'}
                />
              </div>
              <div className={styles.buttonSizeA}>
                <OutlineButton
                  text={'View Challenge'}
                  type={'success'}
                  onClick={this.resetModal}
                />
              </div>
            </div>
          </div>
        </Modal>
      )
    }

    const actionButtons = <React.Fragment>
      {!isLoading && this.state.hasValidationErrors && <div className={styles.error}>Please fix the errors before saving</div>}
      {
        isNew && (
          <div className={styles.buttonContainer}>
            <div className={styles.button}>
              <OutlineButton text={'Create Challenge'} type={'success'} submit />
            </div>
          </div>
        )
      }
      {
        !isNew && (
          <div className={styles.bottomContainer}>
            {!isLoading && <LastSavedDisplay timeLastSaved={timeLastSaved} />}
            {!isLoading && (!isActive) && (!isCompleted) && <div className={styles.buttonContainer}>
              <div className={styles.button}>
                <OutlineButton text={'Launch as Draft'} type={'success'} onClick={this.createDraftHandler} />
              </div>
              {!isLoading && (<div className={styles.button}>
                <PrimaryButton text={'Launch as Active'} type={'info'} submit />
              </div>)}
            </div>}
          </div>
        )
      }
    </React.Fragment>
    const selectedType = _.find(metadata.challengeTypes, { id: challenge.typeId })
    const currentChallengeId = this.getCurrentChallengeId()
    const challengeForm = isNew
      ? (
        <form name='challenge-new-form' noValidate autoComplete='off' onSubmit={this.createChallengeHandler}>
          <div className={styles.newFormContainer}>
            <TrackField challenge={challenge} onUpdateOthers={this.onUpdateOthers} />
            <TypeField types={metadata.challengeTypes} onUpdateSelect={this.onUpdateSelect} challenge={challenge} />
            <ChallengeNameField challenge={challenge} onUpdateInput={this.onUpdateInput} />
          </div>
          { actionButtons }
        </form>
      ) : (
        <form name='challenge-info-form' noValidate autoComplete='off' onSubmit={this.toggleLaunch}>
          <div className={styles.group}>

            <div className={styles.row}>
              <div className={styles.col}>
                <span><span className={styles.fieldTitle}>Project:</span> {projectDetail ? projectDetail.name : ''}</span>
              </div>
              <div className={styles.col}>
                <span className={styles.fieldTitle}>Track:</span>
                <Track disabled type={challenge.track} isActive key={challenge.track} onUpdateOthers={() => {}} />
              </div>
              <div className={styles.col}>
                <span><span className={styles.fieldTitle}>Type:</span> {selectedType ? selectedType.name : ''}</span>
              </div>
            </div>
            <ChallengeNameField challenge={challenge} onUpdateInput={this.onUpdateInput} />
            <CopilotField challenge={challenge} copilots={metadata.members} onUpdateOthers={this.onUpdateOthers} />
            <ReviewTypeField
              reviewers={metadata.members}
              challenge={challenge}
              onUpdateOthers={this.onUpdateOthers}
              onUpdateSelect={this.onUpdateSelect}
            />
            <div className={styles.row}>
              <div className={styles.tcCheckbox}>
                <input
                  name='isOpenAdvanceSettings'
                  type='checkbox'
                  id='isOpenAdvanceSettings'
                  checked={isOpenAdvanceSettings}
                  onChange={this.toggleAdvanceSettings}
                />
                <label htmlFor='isOpenAdvanceSettings'>
                  <div>View Advanced Settings</div>
                  <input type='hidden' />
                </label>
              </div>
            </div>
            { isOpenAdvanceSettings && (
              <React.Fragment>
                <TermsField terms={metadata.challengeTerms} challenge={challenge} onUpdateMultiSelect={this.onUpdateMultiSelect} />
                <GroupsField groups={metadata.groups} onUpdateMultiSelect={this.onUpdateMultiSelect} challenge={challenge} />
              </React.Fragment>
            )}
            <ChallengeScheduleField
              templates={metadata.timelineTemplates}
              challengePhases={metadata.challengePhases}
              removePhase={this.removePhase}
              resetPhase={this.resetPhase}
              challenge={challenge}
              challengePhasesWithCorrectTimeline={this.getBackendChallengePhases()}
              onUpdateSelect={this.onUpdateSelect}
              onUpdatePhase={this.onUpdatePhase}
              onUpdateOthers={this.onUpdateOthers}
              currentTemplate={this.getCurrentTemplate()}
            />
          </div>
          <div className={styles.group}>
            <div className={styles.title}>Public specification</div>
            <TextEditorField
              challengeTags={metadata.challengeTags}
              challenge={challenge}
              onUpdateCheckbox={this.onUpdateCheckbox}
              onUpdateInput={this.onUpdateInput}
              onUpdateDescription={this.onUpdateDescription}
              onUpdateMultiSelect={this.onUpdateMultiSelect}
              onUpdateMetadata={this.onUpdateMetadata}
            />
            { false && (
              <AttachmentField
                challenge={{ ...challenge, id: currentChallengeId }}
                onUploadFile={uploadAttachment}
                token={token}
                removeAttachment={removeAttachment}
              />
            )}
            <ChallengePrizesField challenge={challenge} onUpdateOthers={this.onUpdateOthers} />
            <CopilotFeeField challenge={challenge} onUpdateOthers={this.onUpdateOthers} />
            <ChallengeTotalField challenge={challenge} />
            { this.state.hasValidationErrors && !challenge.prizeSets.length &&
              <div className={styles.error}>Should have at-least 1 prize value</div> }
          </div>
          { actionButtons }
        </form>
      )

    return (
      <div className={styles.wrapper}>
        <Helmet title={getTitle(isNew)} />
        <div className={styles.title}>{getTitle(isNew)}</div>
        <div className={styles.textRequired}>* Required</div>
        <div className={styles.container}>
          { activateModal }
          { draftModal }
          <div className={styles.formContainer}>
            { challengeForm }
          </div>
        </div>
      </div>
    )
  }
}

ChallengeEditor.defaultProps = {
  challengeId: null,
  attachments: [],
  failedToLoad: false,
  challengeResources: {},
  projectDetail: {}
}

ChallengeEditor.propTypes = {
  challengeDetails: PropTypes.object,
  projectDetail: PropTypes.object,
  challengeResources: PropTypes.arrayOf(PropTypes.object),
  isNew: PropTypes.bool.isRequired,
  projectId: PropTypes.string.isRequired,
  challengeId: PropTypes.string,
  metadata: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  uploadAttachment: PropTypes.func.isRequired,
  removeAttachment: PropTypes.func.isRequired,
  attachments: PropTypes.arrayOf(PropTypes.shape()),
  token: PropTypes.string.isRequired,
  failedToLoad: PropTypes.bool,
  history: PropTypes.any.isRequired
}

export default withRouter(ChallengeEditor)
