/**
 * Component to render top bar of app
 */
import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { get } from 'lodash'
import styles from './Topbar.module.scss'
import Handle from '../Handle'
import { COMMUNITY_APP_URL } from '../../config/constants'

const TopBar = ({ user }) => {
  return (
    <div className={styles.topbar}>
      {user &&
      <div className={styles.details}>
        Welcome, <Handle handle={user.handle} rating={get(user, 'maxRating.rating', 0)} />
        <a href={`${COMMUNITY_APP_URL}/logout`}>
          <FontAwesomeIcon icon={faSignInAlt} className={styles.icon} />
        </a>
      </div>
      }
    </div>
  )
}

TopBar.propTypes = {
  user: PropTypes.object
}

export default TopBar
