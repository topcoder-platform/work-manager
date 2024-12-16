/**
 * Inital component that renders react app to HTML
 */
import React from 'react'
import ReactDOM from 'react-dom'
import './styles/main.scss'
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css'
import App from './App'
import { UNIVERSAL_NAV_URL } from './config/constants'

ReactDOM.render(<App />, document.getElementById('root'))

// <!-- Start of topcoder Topcoder Universal Navigation script -->
// SAST/open-redirect handling: make sure script hostname matches what we expect
if ((new URL(UNIVERSAL_NAV_URL)).hostname.match(/uni-nav\.topcoder(-dev)?\.com$/i)) {
  // eslint-disable-next-line no-unused-expressions
  !(function (n, t, e, a, c, i, o) {
  // eslint-disable-next-line no-unused-expressions, no-sequences
    ;(n['TcUnivNavConfig'] = c),
    (n[c] =
      n[c] ||
      function () {
        ;(n[c].q = n[c].q || []).push(arguments)
      }),
    (n[c].l = 1 * new Date())
    // eslint-disable-next-line no-unused-expressions, no-sequences
    ;(i = t.createElement(e)), (o = t.getElementsByTagName(e)[0])
    i.async = 1
    i.type = 'module'
    i.src = a
    o.parentNode.insertBefore(i, o)
  })(
    window,
    document,
    'script',
    UNIVERSAL_NAV_URL,
    'tcUniNav'
  )
}
// <!-- End of topcoder Topcoder Universal Navigation script -->
