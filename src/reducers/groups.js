import {
  BULK_SEARCH_MEMBERS_PENDING,
  BULK_SEARCH_MEMBERS_PROGRESS,
  BULK_SEARCH_MEMBERS_SUCCESS,
  BULK_SEARCH_MEMBERS_FAILURE,
  BULK_CREATE_GROUP_PENDING,
  BULK_CREATE_GROUP_SUCCESS,
  BULK_CREATE_GROUP_FAILURE,
  RESET_GROUPS_STATE
} from '../config/constants'

const initialState = {
  validationResults: [],
  isSearching: false,
  searchError: null,
  isCreating: false,
  createError: null,
  createdGroup: null
}

export default function (state = initialState, action) {
  switch (action.type) {
    case BULK_SEARCH_MEMBERS_PENDING:
      return {
        ...state,
        validationResults: [],
        isSearching: true,
        searchError: null
      }
    case BULK_SEARCH_MEMBERS_PROGRESS:
      return {
        ...state,
        validationResults: action.validationResults,
        isSearching: true,
        searchError: null
      }
    case BULK_SEARCH_MEMBERS_SUCCESS:
      return {
        ...state,
        validationResults: action.validationResults,
        isSearching: false
      }
    case BULK_SEARCH_MEMBERS_FAILURE:
      return {
        ...state,
        validationResults: action.validationResults || [],
        searchError: action.error,
        isSearching: false
      }
    case BULK_CREATE_GROUP_PENDING:
      return {
        ...state,
        isCreating: true,
        createError: null
      }
    case BULK_CREATE_GROUP_SUCCESS:
      return {
        ...state,
        createdGroup: action.createdGroup,
        isCreating: false
      }
    case BULK_CREATE_GROUP_FAILURE:
      return {
        ...state,
        createError: action.error,
        isCreating: false
      }
    case RESET_GROUPS_STATE:
      return {
        ...initialState
      }
    default:
      return state
  }
}
