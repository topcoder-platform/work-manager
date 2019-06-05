/**
 * Combines all reducers into one
 */
import { combineReducers } from 'redux'
import auth from './auth'
import challenges from './challenges'
import challengeSubmissions from './challengeSubmissions'
import sidebar from './sidebar'

export default combineReducers({
  auth,
  challenges,
  challengeSubmissions,
  sidebar
})
