import axios from 'axios'
import _ from 'lodash'
import constants from './config/constants'
const express = require('express')
const path = require('path')
const healthCheck = require('topcoder-healthcheck-dropin')
const { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env

const tcCoreLibAuth = require('tc-core-library-js').auth;

const m2m = tcCoreLibAuth.m2m(process.env);

process.env = _.mapValues(constants, (value) => value)

const challengeService = require('./src/services/challenges').service

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 20000
})

// request interceptor to pass auth token
axiosInstance.interceptors.request.use(async config => {
  const token = await m2m.getMachineToken(AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET)
  config.headers['Authorization'] = `Bearer ${token}`
  return config
})
challengeService.init(axiosInstance)
const { fetchTimelineTemplates, fetchChallengePhases, fetchChallengeTypes, fetchChallengeTracks, fetchChallengeTimelines, fetchChallengeTags, fetchGroups, fetchResourceRoles } = challengeService

import {
  configureConnector
} from 'tc-accounts';

global.document = {
  createElement: () =>  ({}),
  body: { appendChild: () => {} }
} 
configureConnector({
  connectorUrl: 'dummy url',
  frameId: 'tc-accounts-iframe',
  frameTitle: 'Accounts authentication window',
});


const app = express()

function check () {
  return true
}
app.use(healthCheck.middleware([check]))


// api facade
app.get('/api/metadata', async (req, res, next) => {
  const allMetadataPromises = []
  allMetadataPromises.push(fetchTimelineTemplates())
  allMetadataPromises.push(fetchChallengePhases())
  allMetadataPromises.push(fetchChallengeTypes())
  allMetadataPromises.push(fetchChallengeTracks())
  allMetadataPromises.push(fetchChallengeTimelines())
  allMetadataPromises.push(fetchChallengeTags())
  // allMetadataPromises.push(fetchGroups())
  allMetadataPromises.push(fetchResourceRoles())
  try {
    const responses = await Promise.all(allMetadataPromises)
    res.json({
      "timelineTemplates": responses[0],
      "challengePhases": responses[1],
      "challengeTypes": responses[2],
      "challengeTracks": responses[3],
      "challengeTimelines": responses[4],
      "challengeTags": responses[5],
      "resourceRoles": responses[6],
    })
  } catch (err) {
    next(err)
  }
  next(res)
})

// app.use(requireHTTPS) // removed because app servers don't handle https
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'build')))

// static content
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')))
const port = process.env.PORT || 3000
app.listen(port)

console.log(`App is listening on port ${port}`)
