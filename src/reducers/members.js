/**
 * Reducer to process member actions
 */
import { LOAD_MEMBER_SUCCESS } from '../config/constants'
import _ from 'lodash'

const initialState = {
  members: []
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_MEMBER_SUCCESS:
      const loadedMember = action.payload
      const existentMemberIndex = _.findIndex(state.members, { userId: loadedMember.userId })

      // if we already have details about loaded member, update them
      if (existentMemberIndex > -1) {
        return {
          ...state,
          members: [
            ...state.members.slice(0, existentMemberIndex),
            loadedMember,
            ...state.members.slice(existentMemberIndex)
          ]
        }

      // otherwise add loaded members details to the list
      } else {
        return {
          ...state,
          members: [ ...state.members, loadedMember ]
        }
      }
    default:
      return state
  }
}
