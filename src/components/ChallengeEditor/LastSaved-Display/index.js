import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import styles from './LastSaved-Display.module.scss'

const LastSavedDisplay = ({ timeLastSaved }) =>
  <div className={styles.container}>
    <p>{`Last Saved: ${timeLastSaved ? moment(timeLastSaved).format('MMMM Do YYYY, h:mm:ss a') : '-'}`}</p>
  </div>

LastSavedDisplay.propTypes = {
  timeLastSaved: PropTypes.string
}
export default LastSavedDisplay
