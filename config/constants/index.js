module.exports = (() => {
  let env = process.env.NODE_ENV || 'development'
  if (process.env.FORCE_DEV) env = 'development'

  // Only allow specific files to be required for security reasons
  if (env === 'production') {
    return require('./production')
  }

  // Support explicit local environment (mirrors platform-ui local setup)
  const hostEnv = process.env.HOST_ENV
  if (env === 'local' || hostEnv === 'local') {
    return require('./local')
  }

  // Default to development
  return require('./development')
})()
