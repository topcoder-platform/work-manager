import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'

import styles from './Outline.module.scss'
import _ from 'lodash'

const OutlineButton = ({ type, text, link, onClick, url }) => {
  if (_.isEmpty(link) && _.isEmpty(url)) {
    return (
      <div className={cn(styles.container, styles[type])} onClick={onClick}>
        <span>{text}</span>
      </div>
    )
  }

  if (!_.isEmpty(link)) {
    return (
      <Link className={cn(styles.container, styles[type])} to={`${link}`}>
        <span>{text}</span>
      </Link>
    )
  }

  return (
    <a className={cn(styles.container, styles[type])} href={`${url}`}>
      <span>{text}</span>
    </a>
  )
}

OutlineButton.propTypes = {
  type: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  link: PropTypes.string,
  url: PropTypes.string,
  onClick: PropTypes.func
}

export default OutlineButton
