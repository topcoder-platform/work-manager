import { LOAD_MEMBER_PENDING, LOAD_MEMBER_FAILURE, LOAD_MEMBER_SUCCESS } from '../config/constants'
import { searchProfilesByUserIds } from '../services/user'
import _ from 'lodash'

/**
 * Load user details into the store
 * @param userId user id
 * @param forceReload if `true` then member details would be reloaded even if already loaded
 * @returns {Function}
 */
export function loadMemberDetails (userId, forceReload = false) {
  return (dispatch, getState) => {
    const members = getState().members.members
    const existentMember = _.find(members, { userId })

    // don't reload member details if already loaded, unless we force to
    if (existentMember && !forceReload) {
      return
    }

    dispatch({
      type: LOAD_MEMBER_PENDING,
      meta: {
        userId
      }
    })
    searchProfilesByUserIds([userId]).then(([foundUser]) => {
      if (foundUser) {
        dispatch({
          type: LOAD_MEMBER_SUCCESS,
          payload: foundUser
        })
      } else {
        dispatch({
          type: LOAD_MEMBER_FAILURE
        })
      }
    }).catch(() => {
      dispatch({
        type: LOAD_MEMBER_FAILURE
      })
    })
  }
}
