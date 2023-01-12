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
app.use((req, res, next) => {
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.header('Cache-control', 'public, max-age=0');
  res.header('Pragma', 'no-cache');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors *.topcoder.com *.topcoder-dev.com 'none';");

  next();
});
// app.use(requireHTTPS) // removed because app servers don't handle https
// app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'build')))
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')))
const port = process.env.PORT || 3000
app.listen(port)

console.log(`App is listening on port ${port}`)
