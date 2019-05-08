/**
 * Component to render footer of the app
 */
import React from 'react'
import PropTypes from 'prop-types'
import styles from './Footer.module.scss'

const Footer = ({ title, className }) => {
  const currentYear = (new Date()).getFullYear()
  return (
    <div className={styles.container}>
      {'\u00A9'} {currentYear} Topcoder. All Rights Reserved
    </div>
  )
}

Footer.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string
}

export default Footer
