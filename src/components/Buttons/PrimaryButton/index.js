import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'

import styles from './PrimaryButton.module.scss'

const PrimaryButton = ({ type, text, link, onClick }) => {
  if (_.isEmpty(link)) {
    return (
      <div className={cn(styles.container, styles[type])} onClick={onClick}>
        <span>{text}</span>
      </div>
    )
  }
  return (
    <Link className={cn(styles.container, styles[type])} to={`${link}`}>
      <span>{text}</span>
    </Link>
  )
}

PrimaryButton.propTypes = {
  type: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  link: PropTypes.string,
  onClick: PropTypes.func
}

export default PrimaryButton
