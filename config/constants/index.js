module.exports = (() => {
  let env = process.env.NODE_ENV || 'development'
  if (process.env.FORCE_DEV) env = 'development'
  // for security reason don't let to require any arbitrary file defined in process.env
  if (env === 'production') {
    return require('./production')
  }
  if (env === 'qa') {
    return require('./qa')
  }
  return require('./development')
})()
