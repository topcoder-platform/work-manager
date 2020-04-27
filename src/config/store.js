/**
 * Creates redux store
 */
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger' // totest
import reducer from '../reducers'

const middlewares = [thunkMiddleware]

if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger()) // totest
}

export default createStore(reducer, applyMiddleware(...middlewares))
