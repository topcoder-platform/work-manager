'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

// Ensure environment variables are read.
require('../config/env')
const constants = require('../config/constants')

const fs = require('fs')
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const clearConsole = require('react-dev-utils/clearConsole')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls
} = require('react-dev-utils/WebpackDevServerUtils')
const openBrowser = require('react-dev-utils/openBrowser')
const paths = require('../config/paths')
const configFactory = require('../config/webpack.config')
const createDevServerConfig = require('../config/webpackDevServer.config')

const useYarn = false
const isInteractive = process.stdout.isTTY

// Optional debug logging (enable with WM_DEBUG=1)
const WM_DEBUG = /^(1|true|on|yes)$/i.test(String(process.env.WM_DEBUG || ''))
const dlog = (...args) => {
  if (WM_DEBUG) console.log(chalk.gray('[wm-debug]'), ...args)
}

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1)
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000
const HOST = process.env.HOST || '0.0.0.0'

if (WM_DEBUG) {
  // Print environment and versions up front for easier diagnosis
  const webpackVersion = (() => {
    try { return require('webpack/package.json').version } catch (e) { return 'unknown' }
  })()
  const wdsVersion = (() => {
    try { return require('webpack-dev-server/package.json').version } catch (e) { return 'unknown' }
  })()
  dlog('Node', process.version, 'webpack', webpackVersion, 'wds', wdsVersion)
  dlog('ENV', {
    BABEL_ENV: process.env.BABEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    HTTPS: process.env.HTTPS,
    FORCE_DEV: process.env.FORCE_DEV,
    CI: process.env.CI,
    CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING
  })
}

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  )
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  )
  console.log(
    `Learn more here: ${chalk.yellow('http://bit.ly/CRA-advanced-config')}`
  )
  console.log()
}

// We require that you explictly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require('react-dev-utils/browsersHelper')
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // We attempt to use the default port but if it is busy, we offer the user to
    // run on a different port. `choosePort()` Promise resolves to the next free port.
    return choosePort(HOST, DEFAULT_PORT)
  })
  .then(port => {
    if (port == null) {
      // We have not found a port.
      return
    }
    const config = configFactory('development')
    if (WM_DEBUG) {
      dlog('Webpack config summary', {
        mode: config.mode,
        devtool: config.devtool,
        entryCount: Array.isArray(config.entry) ? config.entry.length : Object.keys(config.entry || {}).length,
        outputPublicPath: config.output && config.output.publicPath
      })
      if (config.infrastructureLogging && config.infrastructureLogging.level) {
        dlog('infrastructureLogging.level =', config.infrastructureLogging.level)
      }
    }
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
    const appName = require(paths.appPackageJson).name
    const urls = prepareUrls(protocol, HOST, port)
    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler(webpack, config, appName, urls, useYarn)

    // Extra compiler lifecycle logging (useful if it hangs during compilation)
    if (compiler && compiler.hooks) {
      let compileStart = 0
      compiler.hooks.compile.tap('WMDebug', () => {
        compileStart = Date.now()
        dlog('Compiler: compile started')
      })
      compiler.hooks.invalid.tap('WMDebug', filename => {
        dlog('Compiler: invalidated by change', filename || '')
      })
      compiler.hooks.done.tap('WMDebug', stats => {
        const ms = compileStart ? (Date.now() - compileStart) : 'n/a'
        dlog('Compiler: done', typeof ms === 'number' ? `${ms}ms` : ms)
        if (WM_DEBUG) {
          const hasErrors = stats.hasErrors()
          const hasWarnings = stats.hasWarnings()
          dlog('Compiler: errors?', hasErrors, 'warnings?', hasWarnings)
        }
      })
      compiler.hooks.failed && compiler.hooks.failed.tap('WMDebug', err => {
        console.error(chalk.red('[wm-debug] Compiler: failed'))
        console.error(err)
      })
    }
    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy
    const proxyConfig = prepareProxy(proxySetting, paths.appPublic)
    if (WM_DEBUG) {
      dlog('Proxy setting', proxySetting || null)
      dlog('Proxy prepared?', Array.isArray(proxyConfig) ? `${proxyConfig.length} entries` : typeof proxyConfig)
    }
    // Serve webpack assets generated by the compiler over a web server.
    const serverConfig = createDevServerConfig(
      proxyConfig,
      urls.lanUrlForConfig
    )
    if (WM_DEBUG) {
      // Avoid logging large objects; pick a few key flags
      const serverSummary = {
        host: HOST,
        https: protocol === 'https',
        hot: serverConfig && serverConfig.hot,
        quiet: serverConfig && serverConfig.quiet,
        clientLogLevel: serverConfig && serverConfig.clientLogLevel,
        publicPath: serverConfig && serverConfig.publicPath,
        watchContentBase: serverConfig && serverConfig.watchContentBase
      }
      dlog('DevServer config summary', serverSummary)
    }
    const devServer = new WebpackDevServer(compiler, serverConfig)
    if (WM_DEBUG) {
      dlog('WebpackDevServer instance created')
      // Hook low-level server events when available
      try {
        const srv = devServer && (devServer.listeningApp || devServer.server)
        if (srv && srv.on) {
          srv.on('listening', () => dlog('Node server: listening event'))
          srv.on('error', (e) => console.error(chalk.red('[wm-debug] Node server error:'), e))
        }
      } catch (e) {
        dlog('Unable to attach low-level server event hooks')
      }
    }
    // Launch WebpackDevServer.
    devServer.listen(port, HOST, err => {
      if (err) {
        return console.error(err)
      }
      if (isInteractive) {
        clearConsole()
      }
      console.log(chalk.cyan('Starting the development server...\n'))
      dlog('Dev server listening on', `${protocol}://${HOST}:${port}`)
      openBrowser(urls.localUrlForBrowser)
    })

    const SIGNALS = ['SIGINT', 'SIGTERM']
    SIGNALS.forEach((sig) => {
      process.on(sig, () => {
        devServer.close()
        process.exit()
      })
    })
  })
  .catch(err => {
    if (err && process.env.NODE_ENV === 'development') {
      console.log(err)
    } else {
      console.error('An error occurred while starting the development server')
    }
    process.exit(1)
  })
