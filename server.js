const express = require('express')
const path = require('path')
const healthCheck = require('topcoder-healthcheck-dropin')

const app = express()

// const requireHTTPS = (req, res, next) => {
//   // The 'x-forwarded-proto' check is for Heroku
//   if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== 'development') {
//     return res.redirect('https://' + req.get('host') + req.url)
//   }
//   next()
// }

function check () {
  return true
}
app.use(healthCheck.middleware([check]))
// app.use(requireHTTPS) // removed because app servers don't handle https
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'build')))
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')))
const port = process.env.PORT || 3000
app.listen(port)

console.log(`App is listening on port ${port}`)
