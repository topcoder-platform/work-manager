module.exports = (() => {
  const env = process.env.NODE_ENV || 'development'

  // for security reason don't let to require any arbitrary file defined in process.env
  if (env === 'production') {
    return require('./production')
  }

  return require('./development')
})()
