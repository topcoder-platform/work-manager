import _ from 'lodash'
import * as queryString from 'query-string'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import cn from 'classnames'
import moment from 'moment'
import { pick } from 'lodash/fp'
import { withRouter } from 'react-router-dom'
import { toastr } from 'react-redux-toastr'
import xss from 'xss'

import {
  VALIDATION_VALUE_TYPE,
  PRIZE_SETS_TYPE,
  DEFAULT_TERM_UUID,
  DEFAULT_NDA_UUID,
  SUBMITTER_ROLE_UUID,
  CREATE_FORUM_TYPE_IDS,
  MESSAGE,
  COMMUNITY_APP_URL,
  DES_TRACK_ID,
  CHALLENGE_TYPE_ID,
  REVIEW_TYPES,
  MILESTONE_STATUS,
  PHASE_PRODUCT_CHALLENGE_ID_FIELD
} from '../../config/constants'
import { PrimaryButton, OutlineButton } from '../Buttons'
import TrackField from './Track-Field'
import TypeField from './Type-Field'
import ChallengeNameField from './ChallengeName-Field'
import CopilotField from './Copilot-Field'
import ReviewTypeField from './ReviewType-Field'
import TermsField from './Terms-Field'
import NDAField from './NDAField'
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
import ConfirmationModal from '../Modal/ConfirmationModal'
import AlertModal from '../Modal/AlertModal'
import PhaseInput from '../PhaseInput'
import LegacyLinks from '../LegacyLinks'
import AssignedMemberField from './AssignedMember-Field'
import Tooltip from '../Tooltip'
import CancelDropDown from './Cancel-Dropdown'
import UseSchedulingAPIField from './UseSchedulingAPIField'
import { getResourceRoleByName } from '../../util/tc'
import { isBetaMode } from '../../util/cookie'
import MilestoneField from './Milestone-Field'
import DiscussionField from './Discussion-Field'

const theme = {
  container: styles.modalContainer
}

const getTitle = (isNew, challenge) => {
  if (isNew) {
    return 'Create New Work'
  }

  return challenge.name || 'Set-Up Work'
}

class ChallengeEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isLaunch: false,
      isDeleteLaunch: false,
      isConfirm: false,
      isClose: false,
      hasForum: false,
      isOpenAdvanceSettings: false,
      isLoading: false,
      isSaving: false,
      showDesignChallengeWarningModel: false,
      hasValidationErrors: false,
      challenge: {
        ...dropdowns['newChallenge']
      },
      draftChallenge: { data: { id: null } },
      currentTemplate: null,
      // set `assignedMemberDetails` immediately, in case it's already loaded
      // NOTE that we have to keep `assignedMemberDetails` in the local state, rather than just get it from the props
      // because we can update it locally when we choose another assigned user, so we don't have to wait for user details
      // to be loaded from Member Service as we already know it in such case
      assignedMemberDetails: this.props.assignedMemberDetails
    }
    this.onUpdateInput = this.onUpdateInput.bind(this)
    this.onUpdateSelect = this.onUpdateSelect.bind(this)
    this.onUpdateOthers = this.onUpdateOthers.bind(this)
    this.onUpdateCheckbox = this.onUpdateCheckbox.bind(this)
    this.onUpdateAssignedMember = this.onUpdateAssignedMember.bind(this)
    this.onAssignSelf = this.onAssignSelf.bind(this)
    this.addFileType = this.addFileType.bind(this)
    this.removeFileType = this.removeFileType.bind(this)
    this.updateFileTypesMetadata = this.updateFileTypesMetadata.bind(this)
    this.toggleAdvanceSettings = this.toggleAdvanceSettings.bind(this)
    this.toggleNdaRequire = this.toggleNdaRequire.bind(this)
    this.toggleUseSchedulingAPI = this.toggleUseSchedulingAPI.bind(this)
    this.removePhase = this.removePhase.bind(this)
    this.resetPhase = this.resetPhase.bind(this)
    this.savePhases = this.savePhases.bind(this)
    this.toggleLaunch = this.toggleLaunch.bind(this)
    this.onUpdateMultiSelect = this.onUpdateMultiSelect.bind(this)
    this.onUpdatePhase = this.onUpdatePhase.bind(this)
    this.resetChallengeData = this.resetChallengeData.bind(this)
    this.onUpdateDescription = this.onUpdateDescription.bind(this)
    this.onActiveChallenge = this.onActiveChallenge.bind(this)
    this.resetModal = this.resetModal.bind(this)
    this.resetDesignChallengeWarningModal = this.resetDesignChallengeWarningModal.bind(this)
    this.openCloseTaskConfirmation = this.openCloseTaskConfirmation.bind(this)
    this.onCloseTask = this.onCloseTask.bind(this)
    this.createNewChallenge = this.createNewChallenge.bind(this)
    this.createNewDesignChallenge = this.createNewDesignChallenge.bind(this)
    this.getCurrentChallengeId = this.getCurrentChallengeId.bind(this)
    this.isValidChallengePrizes = this.isValidChallengePrizes.bind(this)
    this.isValidChallenge = this.isValidChallenge.bind(this)
    this.createChallengeHandler = this.createChallengeHandler.bind(this)
    this.createDraftHandler = this.createDraftHandler.bind(this)
    this.onSaveChallenge = this.onSaveChallenge.bind(this)
    this.getCurrentTemplate = this.getCurrentTemplate.bind(this)
    this.onUpdateMetadata = this.onUpdateMetadata.bind(this)
    this.getTemplatePhases = this.getTemplatePhases.bind(this)
    this.getAvailableTimelineTemplates = this.getAvailableTimelineTemplates.bind(this)
    this.autoUpdateChallengeThrottled = _.throttle(this.validateAndAutoUpdateChallenge.bind(this), 3000) // 3s
    this.updateResource = this.updateResource.bind(this)
    this.onDeleteChallenge = this.onDeleteChallenge.bind(this)
    this.deleteModalLaunch = this.deleteModalLaunch.bind(this)
    this.toggleForumOnCreate = this.toggleForumOnCreate.bind(this)
  }

  componentDidMount () {
    this.resetChallengeData(this.setState.bind(this))
  }

  componentDidUpdate () {
    this.resetChallengeData(this.setState.bind(this))
  }

  deleteModalLaunch () {
    if (!this.state.isDeleteLaunch) {
      this.setState({ isDeleteLaunch: true })
    }
  }

  async onDeleteChallenge () {
    const { deleteChallenge, challengeDetails, history, projectDetail } = this.props
    try {
      this.setState({ isSaving: true })
      // Call action to delete the challenge
      await deleteChallenge(challengeDetails.id, projectDetail.id)
      this.setState({ isSaving: false })
      this.resetModal()
      history.push(`/projects/${challengeDetails.projectId}/challenges`)
    } catch (e) {
      const error = _.get(e, 'response.data.message', 'Unable to Delete the challenge')
      this.setState({ isSaving: false, error })
    }
  }

  /**
   * Validates challenge and if its valid calling an autosave method
   *
   * @param {string} changedField changed field
   * @param {any} prevValue previous value
   */
  async validateAndAutoUpdateChallenge (changedField, prevValue) {
    if (this.validateChallenge()) {
      this.autoUpdateChallenge(changedField, prevValue)
    }
  }

  async resetChallengeData (setState = () => {}) {
    const { isNew, challengeDetails, metadata, attachments, challengeId, assignedMemberDetails } = this.props
    if (
      challengeDetails &&
      challengeDetails.id &&
      challengeId === challengeDetails.id &&
      (!this.state.challenge || this.state.challenge.id !== challengeDetails.id) &&
      !isNew
    ) {
      try {
        const copilotResource = this.getResourceFromProps('Copilot')
        const copilotFromResources = copilotResource ? copilotResource.memberHandle : ''
        const reviewerResource =
          (challengeDetails.type === 'First2Finish' || challengeDetails.type === 'Task')
            ? this.getResourceFromProps('Iterative Reviewer') : this.getResourceFromProps('Reviewer')
        const reviewerFromResources = reviewerResource ? reviewerResource.memberHandle : ''
        setState({ isConfirm: false, isLaunch: false })
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
        const challengeDetail = { ...challengeData }
        const isRequiredNda = challengeDetail.terms && _.some(challengeDetail.terms, { id: DEFAULT_NDA_UUID })
        const isOpenAdvanceSettings = challengeDetail.groups.length > 0 || isRequiredNda
        setState({
          challenge: challengeDetail,
          assignedMemberDetails,
          draftChallenge: { data: {
            ..._.cloneDeep(challengeDetails),
            copilot: challengeData.copilot,
            reviewer: challengeData.reviewer
          } },
          isLoading: false,
          isOpenAdvanceSettings,
          currentTemplate
        }, () => {
          // set default phases
          if (!challengeDetail.phases || !challengeDetail.phases.length) {
            let defaultTemplate = currentTemplate
            if (!defaultTemplate) {
              defaultTemplate = _.find(metadata.timelineTemplates, { name: 'Standard Code' })
            }
            this.resetPhase(defaultTemplate)
          }

          // set default prize sets
          // if (!challengeDetail.prizeSets || !challengeDetail.prizeSets.length) {
          //   this.onUpdateOthers({
          //     field: 'prizeSets',
          //     value: this.getDefaultPrizeSets()
          //   })
          // }
        })
      } catch (e) {
        setState({ isLoading: true })
      }
    }
  }

  resetDesignChallengeWarningModal () {
    this.setState({ showDesignChallengeWarningModel: false })
  }

  resetModal () {
    this.setState({ isLoading: false, isConfirm: false, isLaunch: false, error: null, isCloseTask: false, isDeleteLaunch: false })
  }

  /**
   * Close task when user confirm it
   */
  onCloseTask () {
    // before marking challenge as complete, save all the changes user might have made
    this.updateAllChallengeInfo(this.state.challenge.status, () => {
      const { challenge: oldChallenge, assignedMemberDetails } = this.state

      // set assigned user as the only one winner
      const newChallenge = {
        ...oldChallenge,
        winners: [{
          userId: assignedMemberDetails.userId,
          handle: assignedMemberDetails.handle,
          placement: 1
        }]
      }

      this.setState({
        challenge: newChallenge
      }, () => {
        this.updateAllChallengeInfo('Completed')
      })
    })
  }

  /**
   * Open Close Task Confirmation
   * @param {Event} e event
   */
  openCloseTaskConfirmation (e) {
    e.preventDefault()
    if (this.validateChallenge()) {
      this.setState({ isCloseTask: true })
    }
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
    if (!isSub) {
      switch (e.target.name) {
        case 'reviewCost':
        case 'copilotFee':
          newChallenge[e.target.name] = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER, '$')
          break
        default:
          newChallenge[e.target.name] = validateValue(e.target.value, VALIDATION_VALUE_TYPE.STRING)
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
    this.setState({ challenge: newChallenge }, () => {
      this.validateChallenge()
    })
  }

  /**
   * Update assigned member
   * (only applied for the `Task` type challenge)
   *
   * @param {{label: string, value: string }} option option with user
   */
  onUpdateAssignedMember (option) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    let assignedMemberDetails

    if (option && option.value) {
      assignedMemberDetails = {
        handle: option.label,
        userId: parseInt(option.value, 10)
      }
    } else {
      assignedMemberDetails = null
    }

    this.setState({
      challenge: newChallenge,
      assignedMemberDetails
    })
  }

  /**
   * Update Assigned Member to Current User
   */
  onAssignSelf () {
    const { loggedInUser } = this.props

    const assignedMemberDetails = {
      handle: loggedInUser.handle,
      userId: loggedInUser.userId
    }

    this.setState({
      assignedMemberDetails
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
      this.setState({ challenge: newChallenge }, () => {
        this.validateChallenge()
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
      value = value.filter(val => _.values(PRIZE_SETS_TYPE).includes(val.type))
    }
    newChallenge[field] = value
    this.setState({ challenge: newChallenge }, () => {
      this.validateChallenge()
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
      this.validateChallenge()
    })
  }

  /**
   * Helper method which updates the value of `fileTypes` metadata without mutation of the challenge object.
   *
   * @param {Function} processValue callback function to update the value
   */
  updateFileTypesMetadata (processValue) {
    const { challenge: oldChallenge } = this.state
    // avoid mutation of `challenge` object
    const newChallenge = {
      ...oldChallenge,
      // avoid mutation of `metadata` array
      metadata: [
        ...(oldChallenge.metadata || [])
      ]
    }

    // find existent fileType metadata
    let fileTypesMetadataIndex = _.findIndex(newChallenge.metadata, { name: 'fileTypes' })
    let fileTypesMetadata

    // if found existent fileType metadata we have to recreate the record to avoid mutation
    if (fileTypesMetadataIndex > -1) {
      fileTypesMetadata = { ...newChallenge.metadata[fileTypesMetadataIndex] }
      newChallenge.metadata[fileTypesMetadataIndex] = fileTypesMetadata
    // if not yet, create an empty record in metadata
    } else {
      fileTypesMetadata = { name: 'fileTypes', value: '[]' }
      newChallenge.metadata.push(fileTypesMetadata)
    }

    // as values in metadata are always stored as string, we have to parse it, update and stringify again
    const oldFileTypes = JSON.parse(fileTypesMetadata.value)
    const newFileTypes = processValue(oldFileTypes)
    fileTypesMetadata.value = JSON.stringify(newFileTypes)

    this.setState({ challenge: newChallenge })
  }

  /**
   * Add new file type
   * @param {String} newFileType The new file type
   */
  addFileType (newFileType) {
    this.updateFileTypesMetadata((oldFileTypes) => {
      const newFileTypes = [...oldFileTypes, newFileType]

      return newFileTypes
    })
  }

  /**
   * Remove file type
   * @param {String} fileType file type
   */
  removeFileType (fileType) {
    this.updateFileTypesMetadata((oldFileTypes) => {
      const newFileTypes = _.reject(oldFileTypes, (type) => type === fileType)

      return newFileTypes
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
    this.setState({ challenge: newChallenge })
  }

  toggleForumOnCreate () {
    const { hasForum } = this.state
    this.setState({ hasForum: !hasForum })
  }

  toggleAdvanceSettings () {
    const { isOpenAdvanceSettings } = this.state
    this.setState({ isOpenAdvanceSettings: !isOpenAdvanceSettings })
  }

  toggleNdaRequire () {
    const { challenge } = this.state
    const newChallenge = { ...challenge }
    let { terms: oldTerms } = challenge
    if (!oldTerms) {
      oldTerms = []
    }
    let newTerms = []
    if (_.some(oldTerms, { id: DEFAULT_NDA_UUID })) {
      newTerms = _.remove(oldTerms, t => t.id !== DEFAULT_NDA_UUID)
    } else {
      oldTerms.push({ id: DEFAULT_NDA_UUID, roleId: SUBMITTER_ROLE_UUID })
      newTerms = oldTerms
    }
    if (!_.some(newTerms, { id: DEFAULT_TERM_UUID })) {
      newTerms.push({ id: DEFAULT_TERM_UUID, roleId: SUBMITTER_ROLE_UUID })
    }
    newChallenge.terms = newTerms
    this.setState({ challenge: newChallenge })
  }

  toggleUseSchedulingAPI () {
    const { challenge } = this.state
    const newChallenge = { ...challenge }
    const useSchedulingApi = !_.get(newChallenge, 'legacy.useSchedulingAPI', false)
    _.set(newChallenge, 'legacy.useSchedulingAPI', useSchedulingApi)
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
   * Save updated  challenge Phases
   */
  async savePhases () {
    await this.autoUpdateChallengeThrottled('phases')
    this.setState({
      isConfirm: true,
      isLaunch: true
    })
  }

  /**
   * Reset  challenge Phases
   */
  async resetPhase (timeline) {
    const { challenge: oldChallenge } = this.state
    const newChallenge = { ...oldChallenge }
    newChallenge.phases = []
    this.setState({
      currentTemplate: timeline,
      challenge: newChallenge
    }, () => {
      this.autoUpdateChallengeThrottled('reset-phases')
    })
  }

  toggleLaunch (e) {
    e.preventDefault()
    if (this.validateChallenge()) {
      if (!this.props.isBillingAccountExpired) {
        this.setState({ isLaunch: true })
      } else {
        this.setState({ isLaunch: true, error: 'Unable to activate challenge as Billing Account is not active.' })
      }
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

  onSaveChallenge (e) {
    e.preventDefault()
    if (this.validateChallenge()) {
      this.onlySave()
    }
  }

  isValidChallengePrizes () {
    const challengePrizes = _.find(this.state.challenge.prizeSets, p => p.type === PRIZE_SETS_TYPE.CHALLENGE_PRIZES, [])
    if (!challengePrizes || !challengePrizes.prizes || challengePrizes.prizes.length === 0) {
      return false
    }

    return _.every(challengePrizes.prizes, (prize, index) => {
      if (prize.value === '') {
        return false
      }
      const prizeNumber = parseInt(prize.value)
      if (prizeNumber <= 0 || prizeNumber > 1000000) {
        return false
      }
      if (index > 0) {
        if (+prize.value > +challengePrizes.prizes[index - 1].value) {
          return false
        }
      }
      return true
    })
  }

  checkValidCopilot () {
    const copilotFee = _.find(this.state.challenge.prizeSets, p => p.type === PRIZE_SETS_TYPE.COPILOT_PAYMENT, [])
    if (copilotFee && parseInt(copilotFee.prizes[0].value) > 0 && !this.state.challenge.copilot) {
      return false
    }
    return true
  }

  isValidChallenge () {
    const { challenge } = this.state
    if (this.props.isNew) {
      const { name, trackId, typeId } = challenge
      return !!name && !!trackId && !!typeId
    }

    const reviewType = challenge.reviewType ? challenge.reviewType.toUpperCase() : REVIEW_TYPES.COMMUNITY
    const isInternal = reviewType === REVIEW_TYPES.INTERNAL
    if (isInternal && !challenge.reviewer) {
      return false
    }

    if (!this.isValidChallengePrizes()) {
      return false
    }

    if (!this.checkValidCopilot()) {
      return false
    }

    const requiredFields = [
      'trackId',
      'typeId',
      'name',
      'description',
      'tags',
      'prizeSets'
    ]
    let isRequiredMissing = false

    requiredFields.forEach((key) => {
      const value = challenge[key]

      // this check works for string and array values
      isRequiredMissing = isRequiredMissing ||
        !value ||
        (_.isString(value) && value.trim().length === 0) ||
        (_.isArray(value) && value.length === 0)
    })

    return !(isRequiredMissing || _.isEmpty(this.state.currentTemplate))
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
    newChallenge[field] = options ? options.map(option => option.value) : []

    this.setState({ challenge: newChallenge }, () => {
      this.validateChallenge()
    })
  }

  onUpdatePhase (newValue, property, index) {
    if (property === 'duration' && (newValue | 0) <= 0) return
    let newChallenge = _.cloneDeep(this.state.challenge)
    newChallenge.phases[index][property] = newValue
    this.setState({ challenge: newChallenge })
  }

  collectChallengeData (status) {
    const { attachments, metadata } = this.props
    const challenge = pick([
      'phases',
      'typeId',
      'trackId',
      'name',
      'description',
      'privateDescription',
      'reviewType',
      'tags',
      'groups',
      'metadata',
      'startDate',
      'terms',
      'prizeSets',
      'winners',
      'milestoneId',
      'discussions',
      'task'
    ], this.state.challenge)
    const isTask = _.find(metadata.challengeTypes, { id: challenge.typeId, isTask: true })
    challenge.legacy = _.assign(this.state.challenge.legacy, {
      reviewType: challenge.reviewType
    })
    challenge.timelineTemplateId = _.get(this.getCurrentTemplate(), 'id')
    challenge.projectId = this.props.projectId
    challenge.prizeSets = challenge.prizeSets.map(p => {
      const prizes = p.prizes.map(s => ({ ...s, value: convertDollarToInteger(s.value, '$') }))
      return { ...p, prizes }
    })
    challenge.status = status
    if (status === 'Active' && isTask) {
      challenge.startDate = moment().format()
    }

    if (this.state.challenge.id) {
      challenge.attachmentIds = _.map(attachments, item => item.id)
    }
    challenge.phases = challenge.phases.map((p) => pick([
      'duration',
      'phaseId'
    ], p))
    if (challenge.terms && challenge.terms.length === 0) delete challenge.terms
    delete challenge.attachments
    delete challenge.reviewType
    return _.cloneDeep(challenge)
  }

  goToEdit (challengeID) {
    const { history } = this.props
    const newPath = history.location.pathname.replace('/new', `/${challengeID}`) + '/edit'
    history.push(newPath)
  };

  createNewDesignChallenge () {
    this.resetDesignChallengeWarningModal()
    this.createNewChallenge()
  }

  async createNewChallenge () {
    if (!this.props.isNew) return
    const { metadata, createChallenge, projectDetail } = this.props
    const { showDesignChallengeWarningModel, challenge: { name, trackId, typeId, milestoneId } } = this.state
    const { timelineTemplates } = metadata
    const isDesignChallenge = trackId === DES_TRACK_ID
    const isChallengeType = typeId === CHALLENGE_TYPE_ID

    if (!showDesignChallengeWarningModel && isDesignChallenge && isChallengeType) {
      this.setState({
        showDesignChallengeWarningModel: true
      })
      return
    }

    // indicate that creating process has started
    this.setState({ isSaving: true })

    // fallback template
    const STD_DEV_TIMELINE_TEMPLATE = _.find(timelineTemplates, { name: 'Standard Development' })
    const avlTemplates = this.getAvailableTimelineTemplates()
    // chooses first available timeline template or fallback template for the new challenge
    const defaultTemplate = avlTemplates && avlTemplates.length > 0 ? avlTemplates[0] : STD_DEV_TIMELINE_TEMPLATE
    const isTask = _.find(metadata.challengeTypes, { id: typeId, isTask: true })
    const newChallenge = {
      status: 'New',
      projectId: this.props.projectId,
      name,
      typeId,
      trackId,
      startDate: moment().add(1, 'days').format(),
      legacy: {
        reviewType: isTask || isDesignChallenge ? REVIEW_TYPES.INTERNAL : REVIEW_TYPES.COMMUNITY
      },
      descriptionFormat: 'markdown',
      timelineTemplateId: defaultTemplate.id,
      terms: [{ id: DEFAULT_TERM_UUID, roleId: SUBMITTER_ROLE_UUID }],
      groups: [],
      milestoneId
      // prizeSets: this.getDefaultPrizeSets()
    }
    if (isTask) {
      newChallenge.legacy.pureV5Task = true
    }
    if (projectDetail.terms) {
      const currTerms = new Set(newChallenge.terms.map(term => term.id))
      newChallenge.terms.push(
        ...projectDetail.terms
          .filter(term => !currTerms.has(term))
          .map(term => ({ id: term, roleId: SUBMITTER_ROLE_UUID }))
      )
    }
    if (projectDetail.groups) {
      newChallenge.groups.push(...projectDetail.groups)
    }
    if (!isTask || this.state.hasForum) {
      const discussions = this.getDiscussionsConfig(newChallenge)
      if (discussions) {
        newChallenge.discussions = discussions
      }
    }
    try {
      const action = await createChallenge(newChallenge, projectDetail.id)
      if (isTask) {
        await this.updateResource(action.challengeDetails.id, 'Iterative Reviewer', action.challengeDetails.createdBy, action.challengeDetails.reviewer)
        action.challengeDetails.reviewer = action.challengeDetails.createdBy
      }
      const draftChallenge = {
        data: action.challengeDetails
      }
      this.goToEdit(draftChallenge.data.id)
      this.setState({ isSaving: false, draftChallenge })
    } catch (e) {
      this.setState({ isSaving: false })
    }
  }

  getDiscussionsConfig (challenge) {
    if (_.includes(CREATE_FORUM_TYPE_IDS, challenge.typeId)) {
      return ([
        {
          name: `${challenge.name} Discussion`,
          type: 'challenge',
          provider: 'vanilla'
        }
      ])
    }
  }

  /*
    TODO

    IMPORTANT!!!

    This method might be wrong. We might need to fix it when enabling editing phases UI.
    See issue which caused by using of this method https://github.com/topcoder-platform/work-manager/issues/1012
  */
  getTemplatePhases (template) {
    const timelinePhaseIds = template.phases.map(timelinePhase => timelinePhase.phaseId || timelinePhase)
    const validPhases = _.cloneDeep(this.props.metadata.challengePhases).filter(challengePhase => {
      return timelinePhaseIds.includes(challengePhase.id)
    })
    validPhases.forEach(phase => {
      delete Object.assign(phase, { phaseId: phase.id }).id
    })
    return validPhases.map(p => ({
      duration: p.duration,
      phaseId: p.phaseId
    }))
  }

  // getDefaultPrizeSets () {
  //   return [
  //     {
  //       type: PRIZE_SETS_TYPE.CHALLENGE_PRIZES,
  //       prizes: [{ type: 'money', value: '0' }]
  //     }
  //   ]
  // }

  async autoUpdateChallenge (changedField, prevValue) {
    const { partiallyUpdateChallengeDetails, projectDetail } = this.props
    if (this.state.isSaving || this.state.isLoading || !this.getCurrentChallengeId()) return
    const challengeId = this.state.draftChallenge.data.id || this.props.challengeId
    if (_.includes(['copilot', 'reviewer'], changedField)) {
      switch (changedField) {
        case 'copilot':
          await this.updateResource(challengeId, 'Copilot', this.state.challenge.copilot, prevValue)
          break
        case 'reviewer': {
          const { type } = this.state.challenge
          const useIterativeReview = type === 'First2Finish' || type === 'Task'
          await this.updateResource(challengeId, useIterativeReview ? 'Iterative Review' : 'Reviewer', this.state.challenge.reviewer, prevValue)
          break
        }
      }
    } else {
      let patchObject = (changedField === 'reviewType')
        ? { legacy: { reviewType: this.state.challenge[changedField] } } // NOTE it assumes challenge API PATCH respects the changes in legacy JSON
        : { [changedField]: this.state.challenge[changedField] }
      if (changedField === 'phases' || changedField === 'reset-phases') {
        const { currentTemplate } = this.state
        // need timelineTemplateId for updating phase
        patchObject.timelineTemplateId = currentTemplate ? currentTemplate.id : this.state.challenge.timelineTemplateId
      }

      if (changedField === 'reset-phases') {
        delete patchObject['reset-phases']
        const { currentTemplate } = this.state
        patchObject.phases = this.getTemplatePhases(currentTemplate)
      }
      if (changedField === 'prizeSets' && !this.isValidChallengePrizes()) {
        return
      }
      try {
        const copilot = this.state.draftChallenge.data.copilot
        const reviewer = this.state.draftChallenge.data.reviewer
        const action = await partiallyUpdateChallengeDetails(challengeId, patchObject, projectDetail.id)
        const draftChallenge = { data: action.challengeDetails }
        draftChallenge.data.copilot = copilot
        draftChallenge.data.reviewer = reviewer
        const { challenge: oldChallenge } = this.state
        const newChallenge = { ...oldChallenge }

        if (changedField === 'reset-phases') {
          const { currentTemplate } = this.state
          newChallenge.timelineTemplateId = currentTemplate.id
          newChallenge.phases = _.cloneDeep(draftChallenge.data.phases)
          this.setState({
            draftChallenge,
            challenge: newChallenge })
        } else {
          this.setState({ draftChallenge })
        }
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

  async updateAllChallengeInfo (status, cb = () => {}) {
    const { updateChallengeDetails, assignedMemberDetails: oldAssignedMember, projectDetail } = this.props
    if (this.state.isSaving) return
    this.setState({ isSaving: true }, async () => {
      const challenge = this.collectChallengeData(status)
      let newChallenge = _.cloneDeep(this.state.challenge)
      newChallenge.status = status
      try {
        const challengeId = this.getCurrentChallengeId()
        const action = await updateChallengeDetails(challengeId, challenge, projectDetail.id)
        // state can have updated assigned member (in cases where user changes assignments without refreshing the page)
        const { challenge: { copilot, reviewer, type }, assignedMemberDetails: assignedMember } = this.state
        const oldMemberHandle = _.get(oldAssignedMember, 'handle')
        const assignedMemberHandle = _.get(assignedMember, 'handle')
        // assigned member has been updated
        if (assignedMemberHandle !== oldMemberHandle) {
          await this.updateResource(challengeId, 'Submitter', assignedMemberHandle, oldMemberHandle)
        }
        if (assignedMember !== null && type === 'Task') {
          newChallenge.task.isAssigned = true
          newChallenge.task.memberId = _.get(assignedMember, 'userId')
        }
        const { copilot: previousCopilot, reviewer: previousReviewer } = this.state.draftChallenge.data
        if (copilot !== previousCopilot) await this.updateResource(challengeId, 'Copilot', copilot, previousCopilot)
        if (type === 'First2Finish' || type === 'Task') {
          const iterativeReviewer = this.getResourceFromProps('Iterative Reviewer')
          const previousIterativeReviewer = iterativeReviewer && iterativeReviewer.memberHandle
          if (reviewer !== previousIterativeReviewer) await this.updateResource(challengeId, 'Iterative Reviewer', reviewer, previousIterativeReviewer)
        } else {
          if (reviewer !== previousReviewer) await this.updateResource(challengeId, 'Reviewer', reviewer, previousReviewer)
        }
        const draftChallenge = { data: action.challengeDetails }
        draftChallenge.data.copilot = copilot
        draftChallenge.data.reviewer = reviewer
        this.setState({ isLaunch: true,
          isConfirm: newChallenge.id,
          draftChallenge,
          challenge: newChallenge,
          isSaving: false }, cb)
      } catch (e) {
        const error = this.formatResponseError(e) || `Unable to update the challenge to status ${status}`
        this.setState({ isSaving: false, error }, cb)
      }
    })
  }

  /**
   * Format the error we might get from some API endpoint.
   *
   * @param {Error} error error
   *
   * @returns {import('react').ReactNode}
   */
  formatResponseError (error) {
    const errorMessage = _.get(error, 'response.data.message')
    const errorMetadata = _.get(error, 'response.data.metadata')

    if (errorMetadata && errorMetadata.missingTerms && errorMetadata.missingTerms.length > 0) {
      return <>
        {errorMessage}
        <ul className={styles.linkList}>{' '}
          {errorMetadata.missingTerms.map((terms, index) => {
            const termsNumber = errorMetadata.missingTerms.length > 1 ? ` ${index + 1}` : ''
            return (
              <li key={index}><a href={`${COMMUNITY_APP_URL}/challenges/terms/detail/${terms.termId}`} target='_blank'>link to terms{termsNumber}</a></li>
            )
          })}
        </ul>
      </>
    }

    // if no special error data, just use message
    return errorMessage
  }

  async onActiveChallenge () {
    this.updateAllChallengeInfo('Active')
  }

  async saveDraft () {
    this.updateAllChallengeInfo('Draft')
  }

  async onlySave () {
    this.updateAllChallengeInfo(this.state.challenge.status)
  }

  async updateResource (challengeId, name, value, prevValue) {
    const { resourceRoles } = this.props.metadata
    const resourceRole = getResourceRoleByName(resourceRoles, name)
    const roleId = resourceRole.id
    await this.props.replaceResourceInRole(challengeId, roleId, value, prevValue)
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
    const { challengeResources, metadata: { resourceRoles } } = this.props
    const role = getResourceRoleByName(resourceRoles, name)
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

  /**
   * Filters the available timeline templates based on the challenge type
   */
  getAvailableTimelineTemplates () {
    const { challenge } = this.state
    const { metadata } = this.props
    const { challengeTimelines, timelineTemplates } = metadata

    // all timeline template ids available for the challenge type
    const availableTemplateIds = _.filter(challengeTimelines, ct => ct.typeId === challenge.typeId && ct.trackId === challenge.trackId).map(tt => tt.timelineTemplateId)
    // filter and return timeline templates that are available for this challenge type
    return _.filter(timelineTemplates, tt => availableTemplateIds.indexOf(tt.id) !== -1)
  }

  render () {
    const {
      isLaunch,
      isConfirm,
      showDesignChallengeWarningModel,
      challenge,
      draftChallenge,
      hasForum,
      isOpenAdvanceSettings,
      isSaving,
      isCloseTask
    } = this.state
    const {
      isNew,
      isBillingAccountExpired,
      isLoading,
      metadata,
      uploadAttachments,
      token,
      removeAttachment,
      cancelChallenge,
      failedToLoad,
      errorMessage,
      projectDetail,
      attachments,
      projectPhases,
      challengeId
    } = this.props
    if (_.isEmpty(challenge)) {
      return <div>Error loading challenge</div>
    }
    const isTask = _.get(challenge, 'task.isTask', false)
    const { assignedMemberDetails, error } = this.state
    let isActive = false
    let isDraft = false
    let isCompleted = false
    if (challenge.status) {
      isDraft = challenge.status.toLowerCase() === 'draft'
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
                    {errorMessage && <div className={styles.errorMessage}>{`Error : ${errorMessage}`}</div>}
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
    let closeTaskModal = null
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

    let designChallengeModal
    if (showDesignChallengeWarningModel) {
      const messageBody = (
        <div>
          <div>
            At this time, Work Manager only supports single-round (no checkpoint) challenges for design. If you want to run a multi-round (has checkpoints) design challenge, please use Direct.
          </div>
          <div>
            Do you want to proceed with set-up?
          </div>
        </div>
      )
      designChallengeModal = (
        <ConfirmationModal
          title='Reminder'
          message={messageBody}
          theme={theme}
          cancelText='Cancel Set-Up'
          confirmText='Continue Set-Up'
          onCancel={this.resetDesignChallengeWarningModal}
          onConfirm={this.createNewDesignChallenge}
        />
      )
    }
    if (!isNew && isLaunch && !isConfirm) {
      activateModal = (
        <ConfirmationModal
          title='Confirm Launch'
          message={`Do you want to launch "${challenge.name}"?`}
          theme={theme}
          isProcessing={this.state.isSaving}
          errorMessage={this.state.error}
          onCancel={this.resetModal}
          onConfirm={this.onActiveChallenge}
          disableConfirmButton={isBillingAccountExpired}
        />
      )
    }

    /*
      Closing Task Confirmation Modal and Error Modal
    */
    if (isCloseTask && !isConfirm) {
      const taskPrize = _.get(_.find(challenge.prizeSets, { type: 'placement' }), 'prizes[0].value')
      const assignedMemberId = _.get(assignedMemberDetails, 'userId')
      const assignedMember = _.get(assignedMemberDetails, 'handle', `User Id: ${assignedMemberId}`)

      const validationErrors = []
      if (!assignedMemberId) {
        validationErrors.push('assign task member')
      }

      // if all data for closing task is there, show confirmation modal
      if (validationErrors.length === 0) {
        closeTaskModal = (
          <ConfirmationModal
            title='Complete Task Confirmation'
            message={
              <p className={styles.textCenter}>
                Are you sure want to complete task <strong>"{challenge.name}"</strong> with the prize <strong>${taskPrize}</strong> for <strong>{assignedMember}</strong>?
              </p>
            }
            theme={theme}
            isProcessing={this.state.isSaving}
            errorMessage={this.state.error}
            onCancel={this.resetModal}
            onConfirm={this.onCloseTask}
          />
        )

      // if some information for closing task is missing, ask to complete it
      } else {
        const formattedErrors = validationErrors.length === 1 ? validationErrors[0] : (
          validationErrors.slice(0, -1).join(', ') + ' and ' + validationErrors[validationErrors.length - 1]
        )
        closeTaskModal = (
          <AlertModal
            title='Cannot Close Task'
            message={`Please, ${formattedErrors} before closing task.`}
            theme={theme}
            closeText='OK'
            onClose={this.resetModal}
          />
        )
      }
    }
    if (!isNew && challenge.status !== 'New' && isLaunch && isConfirm) {
      draftModal = (
        <AlertModal
          title='Success'
          message={
            challenge.status === 'Draft'
              ? 'Your challenge is saved as draft'
              : 'We have scheduled your challenge and processed the payment'
          }
          theme={theme}
          closeText='Close'
          closeLink='/'
          okText='View Challenge'
          okLink='./view'
          onClose={this.resetModal}
        />
      )
    }

    const errorContainer = <div className={styles.errorContainer}><div className={styles.errorMessage}>{error}</div></div>

    const actionButtons = <React.Fragment>
      {!isLoading && this.state.hasValidationErrors && <div className={styles.error}>Please fix the errors before saving</div>}
      {
        isNew && (
          <div className={styles.buttonContainer}>
            <div className={styles.button}>
              <OutlineButton text={'Continue Set-Up'} type={'success'} submit disabled={isSaving} />
            </div>
          </div>
        )
      }
      {
        !isNew && (
          <div className={styles.bottomContainer}>
            {!isLoading && <LastSavedDisplay timeLastSaved={draftChallenge.data.updated} />}
            {!isLoading && (!isActive) && (!isCompleted) && <div className={styles.buttonContainer}>
              {/* <div className={styles.button}>
                <OutlineButton text={isSaving ? 'Saving...' : 'Save'} type={'success'} onClick={this.onSaveChallenge} />
              </div> */}
              <div className={styles.button}>
                { !this.state.hasValidationErrors ? (
                  <PrimaryButton text={isSaving ? 'Saving...' : 'Save Draft'} type={'info'} onClick={this.createDraftHandler} />
                ) : (
                  <PrimaryButton text={'Save Draft'} type={'disabled'} />
                )}
              </div>
              {isDraft && (
                <div className={styles.button}>
                  {(challenge.legacyId || isTask) && !this.state.hasValidationErrors ? (
                    <PrimaryButton text={'Launch as Active'} type={'info'} onClick={this.toggleLaunch} />
                  ) : (
                    <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
                      {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
                      <PrimaryButton text={'Launch as Active'} type={'disabled'} />
                    </Tooltip>
                  )}
                </div>
              )}
              <div className={styles.button}>
                <CancelDropDown challenge={challenge} onSelectMenu={cancelChallenge} />
              </div>
            </div>}
            {!isLoading && isActive && <div className={styles.buttonContainer}>
              <div className={styles.button}>
                <OutlineButton text={isSaving ? 'Saving...' : 'Save'} type={'success'} onClick={this.onSaveChallenge} />
              </div>
              {isTask && (
                <div className={styles.button}>
                  <Tooltip content={MESSAGE.MARK_COMPLETE}>
                    <PrimaryButton text={'Mark Complete'} type={'success'} onClick={this.openCloseTaskConfirmation} />
                  </Tooltip>
                </div>
              )}
            </div>}
          </div>
        )
      }
    </React.Fragment>
    const useTask = _.find(metadata.challengeTypes, { id: challenge.typeId, isTask: true })
    const selectedType = _.find(metadata.challengeTypes, { id: challenge.typeId })
    const challengeTrack = _.find(metadata.challengeTracks, { id: challenge.trackId })
    const selectedMilestone = _.find(projectPhases,
      phase => _.find(_.get(phase, 'products', []),
        product => _.get(product, PHASE_PRODUCT_CHALLENGE_ID_FIELD) === challengeId
      )
    )
    const selectedMilestoneId = challenge.milestoneId || _.get(selectedMilestone, 'id')
    const activeProjectMilestones = projectPhases.filter(phase => phase.status === MILESTONE_STATUS.ACTIVE)
    const currentChallengeId = this.getCurrentChallengeId()
    const showTimeline = false // disables the timeline for time being https://github.com/topcoder-platform/challenge-engine-ui/issues/706
    const challengeForm = isNew
      ? (
        <form name='challenge-new-form' noValidate autoComplete='off' onSubmit={this.createChallengeHandler}>
          <div className={styles.newFormContainer}>
            <TrackField tracks={metadata.challengeTracks} challenge={challenge} onUpdateOthers={this.onUpdateOthers} />
            <TypeField types={metadata.challengeTypes} onUpdateSelect={this.onUpdateSelect} challenge={challenge} />
            <ChallengeNameField challenge={challenge} onUpdateInput={this.onUpdateInput} />
            {projectDetail.version === 'v4' && <MilestoneField milestones={activeProjectMilestones} onUpdateSelect={this.onUpdateSelect} projectId={projectDetail.id} selectedMilestoneId={selectedMilestoneId} />}
            { useTask && (<DiscussionField hasForum={hasForum} toggleForum={this.toggleForumOnCreate} />) }
          </div>
          {showDesignChallengeWarningModel && designChallengeModal}
          { errorContainer }
          { actionButtons }
        </form>
      ) : (
        <form name='challenge-info-form' noValidate autoComplete='off' onSubmit={(e) => e.preventDefault()}>
          <div className={styles.group}>

            <div className={cn(styles.row, styles.topRow)}>
              <div className={styles.col}>
                <span>
                  <span className={styles.fieldTitle}>Project:</span>
                  <span dangerouslySetInnerHTML={{
                    __html: xss(projectDetail ? projectDetail.name : '')
                  }} />
                </span>
              </div>
              <div className={styles.col}>
                <span className={styles.fieldTitle}>Track:</span>
                <Track disabled type={challengeTrack} isActive key={challenge.trackId} onUpdateOthers={() => {}} />
              </div>
              <div className={styles.col}>
                <span><span className={styles.fieldTitle}>Type:</span> {selectedType ? selectedType.name : ''}</span>
              </div>
              <div className={styles.col}>
                <span><span className={styles.fieldTitle}>Status:</span> {challenge.status}</span>
              </div>
            </div>

            <ChallengeNameField challenge={challenge} onUpdateInput={this.onUpdateInput} />
            {isTask && (
              <AssignedMemberField
                challenge={challenge}
                onChange={this.onUpdateAssignedMember}
                assignedMemberDetails={assignedMemberDetails}
                onAssignSelf={this.onAssignSelf}
              />
            )}
            {projectDetail.version === 'v4' && <MilestoneField milestones={activeProjectMilestones} onUpdateSelect={this.onUpdateSelect} projectId={projectDetail.id} selectedMilestoneId={selectedMilestoneId} />}
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
                <NDAField challenge={challenge} toggleNdaRequire={this.toggleNdaRequire} />
                {/* remove terms field and use default term */}
                {false && (<TermsField terms={metadata.challengeTerms} challenge={challenge} onUpdateMultiSelect={this.onUpdateMultiSelect} />)}
                <GroupsField onUpdateMultiSelect={this.onUpdateMultiSelect} challenge={challenge} />
                <div className={styles.row}>
                  <div className={styles.col}>
                    <span>
                      <span className={styles.fieldTitle}>Billing Account Id:</span>
                      {projectDetail.billingAccountId}
                    </span>
                    {isBillingAccountExpired && <span className={styles.expiredMessage}>Expired</span>}
                  </div>
                </div>
                {isBetaMode() && (
                  <UseSchedulingAPIField challenge={challenge} toggleUseSchedulingAPI={this.toggleUseSchedulingAPI} />
                )}
              </React.Fragment>
            )}
            {!isTask && (
              <div className={styles.PhaseRow}>
                <PhaseInput
                  withDates
                  phase={{
                    name: 'Start Date',
                    date: challenge.startDate
                  }}
                  onUpdatePhase={newValue => this.onUpdateOthers({
                    field: 'startDate',
                    value: newValue.format()
                  })}
                  readOnly={false}
                />
              </div>
            )}
            {
              this.state.isDeleteLaunch && !this.state.isConfirm && (
                <ConfirmationModal
                  title='Confirm Delete'
                  message={`Do you want to delete "${challenge.name}"?`}
                  theme={theme}
                  isProcessing={isSaving}
                  errorMessage={this.state.error}
                  onCancel={this.resetModal}
                  onConfirm={this.onDeleteChallenge}
                />
              )
            }
            { showTimeline && (
              <ChallengeScheduleField
                templates={this.getAvailableTimelineTemplates()}
                challengePhases={metadata.challengePhases}
                removePhase={this.removePhase}
                resetPhase={this.resetPhase}
                savePhases={this.savePhases}
                challenge={challenge}
                onUpdateSelect={this.onUpdateSelect}
                onUpdatePhase={this.onUpdatePhase}
                onUpdateOthers={this.onUpdateOthers}
                currentTemplate={this.getCurrentTemplate()}
              />
            )}
          </div>
          <div className={styles.group}>
            <div className={styles.title}>Public specification <span>*</span></div>
            <div className={styles.templateLink}>
              <i>Access specification templates <a href='https://github.com/topcoder-platform-templates/specification-templates' target='_blank'>here</a></i>
            </div>
            <TextEditorField
              challengeTags={metadata.challengeTags}
              challenge={challenge}
              onUpdateCheckbox={this.onUpdateCheckbox}
              addFileType={this.addFileType}
              removeFileType={this.removeFileType}
              onUpdateInput={this.onUpdateInput}
              onUpdateDescription={this.onUpdateDescription}
              onUpdateMultiSelect={this.onUpdateMultiSelect}
              onUpdateMetadata={this.onUpdateMetadata}
            />
            {/* hide until challenge API change is pushed to PROD https://github.com/topcoder-platform/challenge-api/issues/348 */}
            { false && <AttachmentField
              challenge={{ ...challenge, id: currentChallengeId }}
              challengeId={currentChallengeId}
              attachments={attachments}
              onUploadFiles={uploadAttachments}
              token={token}
              removeAttachment={removeAttachment}
            />}
            <ChallengePrizesField challenge={challenge} onUpdateOthers={this.onUpdateOthers} />
            <CopilotFeeField challenge={challenge} onUpdateOthers={this.onUpdateOthers} />
            <ChallengeTotalField challenge={challenge} />
          </div>
          { errorContainer }
          { actionButtons }
        </form>
      )

    return (
      <div className={styles.wrapper}>
        <Helmet title={getTitle(isNew, challenge)} />
        <div className={styles.topContainer}>
          <div className={styles.leftContainer}>
            <div className={styles.title}>{getTitle(isNew, challenge)}</div>
            {!isNew && <LegacyLinks challenge={challenge} />}
          </div>
          <div className={cn(styles.actionButtons, styles.actionButtonsRight)}>
            {!isNew && this.props.challengeDetails.status === 'New' && <PrimaryButton text={'Delete'} type={'danger'} onClick={this.deleteModalLaunch} />}
            <PrimaryButton text={'Back'} type={'info'} submit link={`/projects/${projectDetail.id}/challenges`} />
          </div>
        </div>
        <div className={styles.textRequired}>* Required</div>
        <div className={styles.container}>
          { activateModal }
          { draftModal }
          { closeTaskModal }
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
  isBillingAccountExpired: PropTypes.bool,
  projectId: PropTypes.string.isRequired,
  challengeId: PropTypes.string,
  metadata: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  uploadAttachments: PropTypes.func.isRequired,
  cancelChallenge: PropTypes.func.isRequired,
  removeAttachment: PropTypes.func.isRequired,
  attachments: PropTypes.arrayOf(PropTypes.shape()),
  token: PropTypes.string.isRequired,
  failedToLoad: PropTypes.bool,
  errorMessage: PropTypes.string,
  history: PropTypes.any.isRequired,
  assignedMemberDetails: PropTypes.shape(),
  updateChallengeDetails: PropTypes.func.isRequired,
  createChallenge: PropTypes.func,
  replaceResourceInRole: PropTypes.func,
  partiallyUpdateChallengeDetails: PropTypes.func.isRequired,
  deleteChallenge: PropTypes.func.isRequired,
  loggedInUser: PropTypes.shape().isRequired,
  projectPhases: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default withRouter(ChallengeEditor)
