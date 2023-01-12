/**
 * Inital component that renders react app to HTML
 */
import React from 'react'
import ReactDOM from 'react-dom'
import './styles/main.scss'
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css'
import App from './App'
import { SEGMENT_API_KEY, UNIVERSAL_NAV_URL } from './config/constants'

ReactDOM.render(<App />, document.getElementById('root'))

/* eslint-disable */
if (!_.isEmpty(SEGMENT_API_KEY)) {
    !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var t=analytics.methods[e];analytics[t]=analytics.factory(t)}analytics.load=function(e,t){var n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src="https://cdn.segment.com/analytics.js/v1/"+e+"/analytics.min.js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a);analytics._loadOptions=t};analytics.SNIPPET_VERSION="4.1.0";
    analytics.load(SEGMENT_API_KEY);
    analytics.page();
    }}();
}
/* eslint-enable */

// <!-- Start of topcoder Topcoder Universal Navigation script -->
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
// <!-- End of topcoder Topcoder Universal Navigation script -->
