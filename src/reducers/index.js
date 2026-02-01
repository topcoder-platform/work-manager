/**
 * Combines all reducers into one
 */
import { combineReducers } from 'redux'
import { reducer as toastrReducer } from 'react-redux-toastr'
import auth from './auth'
import challenges from './challenges'
import engagements from './engagements'
import applications from './applications'
import projects from './projects'
import challengeSubmissions from './challengeSubmissions'
import sidebar from './sidebar'
import members from './members'
import groups from './groups'
import users from './users'
import payments from './payments'

export default combineReducers({
  auth,
  challenges,
  engagements,
  applications,
  challengeSubmissions,
  sidebar,
  toastr: toastrReducer,
  projects,
  members,
  groups,
  users,
  payments
})
