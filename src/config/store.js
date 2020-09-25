/**
 * Creates redux store
 */
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import promiseMiddleware from 'redux-promise-middleware'
import reducer from '../reducers'

const middlewares = [
  promiseMiddleware({
    promiseTypeSuffixes: ['PENDING', 'SUCCESS', 'FAILURE']
  }),
  thunkMiddleware
]

if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger())
}

export default createStore(reducer, applyMiddleware(...middlewares))
