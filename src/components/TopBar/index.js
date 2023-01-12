/* global tcUniNav */
import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { getInitials } from '../../util/url'
import { COMMUNITY_APP_URL, HEADER_AUTH_URLS_HREF, HEADER_AUTH_URLS_LOCATION } from '../../config/constants'
import _ from 'lodash'

let uniqueId = 0

const HEADER_AUTH_URLS = {
  href: HEADER_AUTH_URLS_HREF,
  location: HEADER_AUTH_URLS_LOCATION
}
const BASE = COMMUNITY_APP_URL

const TopBar = ({ auth }) => {
  const uniNavInitialized = useRef(false)
  const toolNameRef = useRef('Work Manager')
  const user = _.get(auth, 'user') || {}
  const authToken = _.get(auth, 'token')
  const isAuthenticated = !!authToken
  const authURLs = HEADER_AUTH_URLS
  const headerRef = useRef()
  const [headerId, setHeaderId] = useState(0)

  const navigationUserInfo = {
    ...user,
    initials: getInitials(user.firstName, user.lastName)
  }

  useEffect(() => {
    uniqueId += 1
    setHeaderId(uniqueId)
  }, [])

  useEffect(() => {
    if (uniNavInitialized.current || !headerId) {
      return
    }

    uniNavInitialized.current = true

    const regSource = window.location.pathname.split('/')[1]
    const retUrl = encodeURIComponent(window.location.href)
    tcUniNav('init', `headerNav-${headerId}`, {
      type: 'tool',
      toolName: toolNameRef.current,
      toolRoot: '/',
      user: isAuthenticated ? navigationUserInfo : null,
      signOut: () => {
        window.location = `${BASE}/logout?ref=nav`
      },
      signIn: () => {
        window.location = `${authURLs.location
          .replace('%S', retUrl)
          .replace('member?', '#!/member?')}&regSource=${regSource}`
      },
      signUp: () => {
        window.location = `${authURLs.location
          .replace('%S', retUrl)
          .replace('member?', '#!/member?')}&mode=signUp&regSource=${regSource}`
      }
    })
  }, [headerId])

  return <div id={`headerNav-${headerId}`} ref={headerRef} />
}

TopBar.defaultProps = {
  auth: {}
}

TopBar.propTypes = {
  auth: PropTypes.shape()
}

export default TopBar
