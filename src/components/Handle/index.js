/**
 * Component to render member handles with a link to profile page
 */
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { getTCMemberURL, SYSTEM_USERS } from '../../config/constants'
import { getRatingColor } from '../../util/tc'
import styles from './Handle.module.scss'

const Handle = ({ handle, rating, color, className }) => {
  if (!color && rating) {
    color = getRatingColor(rating)
  }
  const link = getTCMemberURL(handle)
  if (SYSTEM_USERS.includes(handle)) return <span style={{ color: color }} className={cn(styles.handle, className)} >{handle}</span>
  return <a href={link} style={{ color: color }} className={cn(styles.handle, className)} >{handle}</a>
}

Handle.propTypes = {
  handle: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
  rating: PropTypes.number
}

export default Handle
