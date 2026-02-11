'use strict'

var patchedFormatWebpackMessages = require('./formatWebpackMessages')
var originalFormatWebpackMessages = require('react-dev-utils/formatWebpackMessages')

// webpackHotDevClient requires react-dev-utils/formatWebpackMessages internally.
// Replace that cached module export before loading the hot client so warnings
// and errors can be normalized for webpack 5 object payloads.
if (typeof __webpack_require__ === 'function' && __webpack_require__.c) {
  Object.keys(__webpack_require__.c).forEach(function(id) {
    var cachedModule = __webpack_require__.c[id]
    if (cachedModule && cachedModule.exports === originalFormatWebpackMessages) {
      cachedModule.exports = patchedFormatWebpackMessages
    }
  })
}

require('react-dev-utils/webpackHotDevClient')
