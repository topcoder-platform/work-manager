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
import users from './users'

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
  users
})
