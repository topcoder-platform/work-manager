/**
 * Reducer to process actions related to challenge list
 */
import _ from 'lodash'
import { toastr } from 'react-redux-toastr'
import {
  LOAD_CHALLENGE_DETAILS_FAILURE,
  LOAD_CHALLENGE_DETAILS_PENDING,
  LOAD_CHALLENGE_DETAILS_SUCCESS,
  LOAD_CHALLENGE_RESOURCES_FAILURE,
  LOAD_CHALLENGE_RESOURCES_PENDING,
  LOAD_CHALLENGE_RESOURCES_SUCCESS,
  LOAD_CHALLENGE_MEMBERS_SUCCESS,
  LOAD_CHALLENGE_METADATA_SUCCESS,
  LOAD_CHALLENGES_FAILURE,
  LOAD_CHALLENGES_PENDING,
  LOAD_CHALLENGES_SUCCESS,
  CREATE_ATTACHMENT_FAILURE,
  CREATE_ATTACHMENT_SUCCESS,
  CREATE_ATTACHMENT_PENDING,
  REMOVE_ATTACHMENT_FAILURE,
  REMOVE_ATTACHMENT_SUCCESS,
  REMOVE_ATTACHMENT_PENDING,
  SET_FILTER_CHALLENGE_VALUE,
  UPDATE_CHALLENGE_DETAILS_FAILURE,
  UPDATE_CHALLENGE_DETAILS_SUCCESS,
  CREATE_CHALLENGE_SUCCESS,
  CREATE_CHALLENGE_FAILURE,
  CREATE_CHALLENGE_RESOURCE_SUCCESS,
  DELETE_CHALLENGE_RESOURCE_SUCCESS,
  DELETE_CHALLENGE_RESOURCE_FAILURE,
  CREATE_CHALLENGE_RESOURCE_FAILURE,
  DELETE_CHALLENGE_SUCCESS,
  DELETE_CHALLENGE_FAILURE,
  DELETE_CHALLENGE_PENDING
} from '../config/constants'

const initialState = {
  isLoading: false,
  challenges: [],
  metadata: {},
  challengeDetails: {},
  challengeResources: [],
  isSuccess: false,
  isUploading: false,
  uploadingId: null,
  attachments: [],
  challenge: null,
  filterChallengeName: '',
  failedToDelete: false,
  status: '',
  perPage: 0,
  page: 1,
  totalChallenges: 0,
  projectId: -1
}

function toastrFailure (title, message) {
  setImmediate(() => {
    toastr.error(title, message)
  })
}

function toastrSuccess (title, message) {
  setImmediate(() => {
    toastr.success(title, message)
  })
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_CHALLENGES_SUCCESS:
      return {
        ...state,
        challenges: action.challenges,
        isLoading: false,
        totalChallenges: action.totalChallenges
      }
    case LOAD_CHALLENGES_PENDING:
      return {
        ...state,
        isLoading: true,
        challenges: action.challenges,
        projectId: action.projectId,
        status: action.status,
        filterChallengeName: action.filterChallengeName,
        perPage: action.perPage,
        page: action.page
      }
    case LOAD_CHALLENGE_DETAILS_PENDING:
      return { ...state, isLoading: true, attachments: [], challenge: null, challengeDetails: {}, failedToLoad: false }
    case LOAD_CHALLENGES_FAILURE:
      return { ...state, isLoading: false }
    case LOAD_CHALLENGE_DETAILS_FAILURE:
    case CREATE_CHALLENGE_FAILURE:
      return { ...state, isLoading: false, attachments: [], challenge: null, failedToLoad: true }
    case LOAD_CHALLENGE_DETAILS_SUCCESS: {
      return {
        ...state,
        challengeDetails: action.payload,
        isLoading: false,
        attachments: _.has(action.payload, 'attachments') ? action.payload.attachments : [],
        failedToLoad: false
      }
    }
    case UPDATE_CHALLENGE_DETAILS_SUCCESS: {
      // During editing the challenge we might change its status, so when we came back to the challenge list
      // updated challenge might have to be removed from the list, or added to the list, or just updated
      //
      // NOTE: all this logic with updating challenge list could be removed,
      //       if we always reload the challenge list when we Back from the challenge editing page
      let updatedChallenges = state.challenges
      const updatedChallengeIndex = _.findIndex(state.challenges, { id: action.challengeDetails.id })
      const isSameStatus = state.status.toLowerCase() === action.challengeDetails.status.toLowerCase()
      // 1. we updated the challenge status so it's no more on the current challenge list
      //    so we have to remove it from the list
      if (updatedChallengeIndex > -1 && !isSameStatus) {
        updatedChallenges = [
          ...state.challenges.slice(0, updatedChallengeIndex),
          ...state.challenges.slice(updatedChallengeIndex + 1)
        ]

      // 2. we updated the challenge status so now it's on the current challenge list, but before it wasn't there as it had another status
      //    so we have to add it to the list
      } else if (updatedChallengeIndex === -1 && isSameStatus) {
        updatedChallenges = [
          action.challengeDetails,
          ...state.challenges
        ]

      // 3. if the challenge is already on the list and didn't change its status,
      //    then we just update the details of the challenge in the list
      } else if (updatedChallengeIndex > -1 && isSameStatus) {
        updatedChallenges = [
          ...state.challenges.slice(0, updatedChallengeIndex),
          action.challengeDetails,
          ...state.challenges.slice(updatedChallengeIndex + 1)
        ]
      }

      return {
        ...state,
        challenges: updatedChallenges,
        challengeDetails: action.challengeDetails,
        isLoading: false,
        attachments: _.has(action.challengeDetails, 'attachments') ? action.challengeDetails.attachments : [],
        failedToLoad: false
      }
    }
    case UPDATE_CHALLENGE_DETAILS_FAILURE:
      return { ...state, isLoading: false, attachments: [], challenge: null, failedToLoad: false, failedToUpdate: true }

    case DELETE_CHALLENGE_PENDING:
      return { ...state, failedToLoad: false }

    case DELETE_CHALLENGE_SUCCESS: {
      const deletedChallengeDetails = action.challengeDetails.data
      const updatedChallenges = state.challenges.filter((challenge) => challenge.id !== deletedChallengeDetails.id)
      toastrSuccess('Success', `Challenge deleted successfully.`)
      return {
        ...state,
        challenges: updatedChallenges
      }
    }

    case DELETE_CHALLENGE_FAILURE: {
      return {
        ...state,
        failedToDelete: true
      }
    }

    case CREATE_CHALLENGE_SUCCESS: {
      // if we are showing the list of challenges with the same status as we just created,
      // then add the new challenge to the beginning of the current challenge list
      const updatedChallenges = state.status.toLowerCase() === action.challengeDetails.status.toLowerCase()
        ? [action.challengeDetails, ...state.challenges]
        : state.challenges
      return {
        ...state,
        challenges: updatedChallenges,
        challengeDetails: action.challengeDetails,
        isLoading: false,
        attachments: _.has(action.challengeDetails, 'attachments') ? action.challengeDetails.attachments : [],
        failedToLoad: false
      }
    }
    case LOAD_CHALLENGE_RESOURCES_PENDING:
      return { ...state, isLoading: true, failedToLoad: false }
    case LOAD_CHALLENGE_RESOURCES_FAILURE:
      return { ...state, isLoading: false, failedToLoad: true }
    case LOAD_CHALLENGE_RESOURCES_SUCCESS:
      return {
        ...state,
        challengeResources: action.payload,
        isLoading: false,
        failedToLoad: false
      }
    case CREATE_CHALLENGE_RESOURCE_SUCCESS: {
      const resource = action.payload
      const challengeResources = _.clone(state.challengeResources)
      challengeResources.push(resource)
      return {
        ...state,
        challengeResources,
        isLoading: false,
        failedToLoad: false
      }
    }
    case CREATE_CHALLENGE_RESOURCE_FAILURE: {
      const resource = action.payload
      console.log(resource)
      return { ...state, isLoading: false, failedToCreate: true }
    }
    case DELETE_CHALLENGE_RESOURCE_SUCCESS: {
      const resource = action.payload
      const challengeResources = _.clone(state.challengeResources)
      _.remove(challengeResources,
        r => r.challengeId === resource.challengeId && r.roleId === resource.roleId && r.memberHandle === resource.memberHandle)
      return {
        ...state,
        challengeResources,
        isLoading: false,
        failedToLoad: false
      }
    }
    case DELETE_CHALLENGE_RESOURCE_FAILURE: {
      const err = action.payload
      const errorMessage = _.get(err, 'response.data.message')
      // ignore error where the resource does not exist already
      if (errorMessage.indexOf('doesn\'t have resource with roleId') === -1) {
        return { ...state, isLoading: false, failedToDelete: true }
      }
      return { ...state, isLoading: false, failedToDelete: false }
    }
    case LOAD_CHALLENGE_METADATA_SUCCESS:
      return {
        ...state,
        metadata: {
          ...state.metadata,
          [action.metadataKey]: action.metadataValue
        }
      }
    case LOAD_CHALLENGE_MEMBERS_SUCCESS: {
      return { ...state, metadata: { ...state.metadata, members: action.members } }
    }
    case CREATE_ATTACHMENT_PENDING: {
      const attachments = [
        ...(state.attachments || []),
        // file that we are uploading at the moment
        // they are different from attachments, because they don't have `id`
        ...action.files
      ]
      return { ...state, attachments }
    }
    case CREATE_ATTACHMENT_SUCCESS: {
      const attachments = _.map(state.attachments, item => {
        // as `url` is unique we can use to replace files which were uploading with uploaded attachments
        const createdAttachment = _.find(action.attachments, {
          url: item.url
        })

        if (createdAttachment) {
          return createdAttachment
        }

        return item
      })
      return { ...state, attachments }
    }
    case CREATE_ATTACHMENT_FAILURE: {
      toastrFailure('Upload failure', `Failed to upload ${action.file.name}`)
      const attachments = _.reject(state.attachments, (attachment) =>
        _.find(action.files, { url: attachment.url })
      )
      return { ...state, attachments }
    }
    case REMOVE_ATTACHMENT_PENDING: {
      const attachments = _.map(state.attachments, item => {
        if (item.id !== action.attachmentId) {
          return item
        } else {
          return {
            ...item,
            isDeleting: true
          }
        }
      })
      return { ...state, attachments }
    }
    case REMOVE_ATTACHMENT_SUCCESS: {
      const attachments = _.reject(state.attachments, {
        id: action.attachmentId
      })
      return { ...state, attachments }
    }
    case REMOVE_ATTACHMENT_FAILURE: {
      toastrFailure('Removing failure', `Failed to remove attachment`)
      const attachments = _.map(state.attachments, item => {
        if (item.id !== action.attachmentId) {
          return item
        } else {
          return {
            ...item,
            isDeleting: false
          }
        }
      })
      return { ...state, attachments }
    }
    case SET_FILTER_CHALLENGE_VALUE:
      return { ...state, filterChallengeName: action.value.name, status: action.value.status }
    default:
      return state
  }
}
