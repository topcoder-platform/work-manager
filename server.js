const express = require('express')
const path = require('path')
const healthCheck = require('topcoder-healthcheck-dropin')
const { fetchTimelineTemplates, fetchChallengePhases, fetchChallengeTypes, fetchChallengeTracks, fetchChallengeTimelines, fetchChallengeTags, fetchGroups, fetchResourceRoles } = require('./src/services/challenges')

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
  allMetadataPromises.push(fetchGroups())
  allMetadataPromises.push(fetchResourceRoles())
  const responses = await Promise.all(allMetadataPromises)
  res.json(responses)
  next()
})

// app.use(requireHTTPS) // removed because app servers don't handle https
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'build')))

// static content
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')))
const port = process.env.PORT || 3000
app.listen(port)

console.log(`App is listening on port ${port}`)
