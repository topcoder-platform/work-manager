import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'

import styles from './Outline.module.scss'
import _ from 'lodash'

const OutlineButton = ({ type, text, link, onClick, url, className, submit, disabled, target = 'self' }) => {
  if (_.isEmpty(link) && _.isEmpty(url)) {
    return (
      <button
        type={submit ? 'submit' : 'button'}
        className={cn(styles.container, styles[type], className)}
        onClick={submit ? null : onClick}
        disabled={disabled}
      >
        <span>{text}</span>
      </button>
    )
  }

  if (!_.isEmpty(link)) {
    return (
      <Link className={cn(styles.container, styles[type], className)} to={`${link}`}>
        <span>{text}</span>
      </Link>
    )
  }

  return (
    <a className={cn(styles.container, styles[type], className)} href={`${url}`} target={target}>
      <span>{text}</span>
    </a>
  )
}

OutlineButton.propTypes = {
  type: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  link: PropTypes.string,
  url: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  submit: PropTypes.bool,
  disabled: PropTypes.bool,
  target: PropTypes.oneOf(['_blank', 'self'])
}

export default OutlineButton
