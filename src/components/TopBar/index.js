/**
 * Component to render top bar of app
 */
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { get } from 'lodash'
import styles from './Topbar.module.scss'
import Handle from '../Handle'
import TopcoderLogo from '../../assets/images/topcoder-logo.png'
import { COMMUNITY_APP_URL } from '../../config/constants'

const TopBar = ({ user, hideBottomLine }) => {
  return (
    <div
      className={cn(styles.topbar, { [styles['hide-line']]: hideBottomLine })}
    >
      <img src={TopcoderLogo} className={styles.logo} />
      {user && (
        <div className={styles.details}>
          Welcome,{' '}
          <Handle
            handle={user.handle}
            rating={get(user, 'maxRating.rating', 0)}
          />
          <a href={`${COMMUNITY_APP_URL}/logout`}>
            <FontAwesomeIcon icon={faSignInAlt} className={styles.icon} />
          </a>
        </div>
      )}
    </div>
  )
}

TopBar.propTypes = {
  user: PropTypes.object,
  hideBottomLine: PropTypes.bool
}

export default TopBar
