/**
 * Component to render when there is a warning message
 */
import React from 'react'
import PropTypes from 'prop-types'
import styles from './Message.module.scss'

const Message = ({ warnMessage, linkComponent }) => {
  return (
    <div className={styles.messageContainer}>
      {warnMessage}
      {linkComponent}
    </div>
  )
}

Message.defaultProps = {
  warnMessage: '',
  linkComponent: () => null
}

Message.propTypes = {
  warnMessage: PropTypes.string,
  linkComponent: PropTypes.func
}

export default Message
