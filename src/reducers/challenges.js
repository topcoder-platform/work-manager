/**
 * Reducer to process actions related to challenge list
 */
import _ from 'lodash'
import { toastr } from 'react-redux-toastr'
import {
  LOAD_CHALLENGE_DETAILS_FAILURE,
  LOAD_CHALLENGE_DETAILS_PENDING,
  LOAD_CHALLENGE_DETAILS_SUCCESS,
  LOAD_CHALLENGE_MEMBERS_SUCCESS,
  LOAD_CHALLENGE_METADATA_SUCCESS,
  LOAD_CHALLENGES_FAILURE,
  LOAD_CHALLENGES_PENDING,
  LOAD_CHALLENGES_SUCCESS,
  UPLOAD_ATTACHMENT_FAILURE,
  UPLOAD_ATTACHMENT_SUCCESS,
  UPLOAD_ATTACHMENT_PENDING,
  REMOVE_ATTACHMENT,
  SET_FILTER_CHALLENGE_NAME
} from '../config/constants'

const initialState = {
  isLoading: true,
  challenges: [],
  metadata: {},
  selectedProjectId: null,
  challengeDetails: {},
  isSuccess: false,
  isUploading: false,
  uploadingId: null,
  attachments: [],
  challenge: null,
  filterChallengeName: '',
  status: ''
}

function toastrSuccess (title, message) {
  setImmediate(() => {
    toastr.success(title, message)
  })
}

function toastrFailure (title, message) {
  setImmediate(() => {
    toastr.error(title, message)
  })
}

export default function (state = initialState, action) {
  let attachments
  switch (action.type) {
    case LOAD_CHALLENGES_SUCCESS:
      return { ...state, challenges: action.challenges, isLoading: false }
    case LOAD_CHALLENGES_PENDING:
      return {
        ...state,
        isLoading: true,
        ...(
          action.challenges ? {
            challenges: action.challenges
          } : {}
        ),
        ...(
          action.projectId ? {
            projectId: action.projectId
          } : {}
        ),
        ...(
          action.status ? {
            status: action.status
          } : {}
        ),
        ...(
          action.filterChallengeName ? {
            filterChallengeName: action.filterChallengeName
          } : {}
        )
      }
    case LOAD_CHALLENGE_DETAILS_PENDING:
      return { ...state, isLoading: true, attachments: [], challenge: null }
    case LOAD_CHALLENGES_FAILURE:
      return { ...state, isLoading: false }
    case LOAD_CHALLENGE_DETAILS_FAILURE:
      return { ...state, isLoading: false, attachments: [], challenge: null }
    case LOAD_CHALLENGE_DETAILS_SUCCESS:
      return {
        ...state,
        challengeDetails: action.challengeDetails,
        isLoading: false,
        attachments: _.has(action.challengeDetails, 'attachments') ? action.challengeDetails.attachments : []
      }
    case LOAD_CHALLENGE_METADATA_SUCCESS:
      return {
        ...state,
        metadata: {
          ...state.metadata,
          [action.metadataKey]: action.metadataValue
        }
      }
    case LOAD_CHALLENGE_MEMBERS_SUCCESS:
      return { ...state, metadata: { ...state.metadata, members: action.members } }
    case UPLOAD_ATTACHMENT_PENDING:
      return { ...state, isUploading: true, isSuccess: false, uploadingId: action.challengeId }
    case UPLOAD_ATTACHMENT_SUCCESS:
      toastrSuccess('Success', `${action.filename} uploaded successfully. Save the challenge to reflect the changes!`)
      attachments = _.cloneDeep(state.attachments)
      attachments.push(action.attachment)
      return { ...state, isUploading: false, isSuccess: true, uploadingId: null, attachments }
    case UPLOAD_ATTACHMENT_FAILURE:
      toastrFailure('Upload failure', `Failed to upload ${action.filename}`)
      return { ...state, isUploading: false, isSuccess: false, uploadingId: null }
    case REMOVE_ATTACHMENT:
      attachments = _.filter(state.attachments, item => {
        if (item.id !== action.attachmentId) {
          return item
        }
      })
      return { ...state, attachments }
    case SET_FILTER_CHALLENGE_NAME:
      return { ...state, filterChallengeName: action.value }
    default:
      return state
  }
}
