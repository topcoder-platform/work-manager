/**
 * Component to render when there is a warning message
 */
import React from 'react'
import PropTypes from 'prop-types'
import styles from './Message.module.scss'

const Message = ({ warnMessage, children }) => {
  return (
    <div className={styles.messageContainer}>
      <p>{children !== undefined ? children : warnMessage}</p>
    </div>
  )
}

Message.defaultProps = {
  warnMessage: ''
}

Message.propTypes = {
  warnMessage: PropTypes.string,
  children: PropTypes.node
}

export default Message
