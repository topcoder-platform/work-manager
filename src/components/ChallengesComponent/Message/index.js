/**
 * Component to render when there is a warning message
 */
import React from 'react'
import PropTypes from 'prop-types'
import styles from './Message.module.scss'

const Message = ({ warnMessage }) => {
  return (
    <div className={styles.messageContainer}>
      <p>{warnMessage}</p>
    </div>
  )
}

Message.defaultProps = {
    warnMessage: ''
}

Message.propTypes = {
    warnMessage: PropTypes.string
}

export default Message
