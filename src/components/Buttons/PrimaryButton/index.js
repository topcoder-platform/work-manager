import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'

import styles from './PrimaryButton.module.scss'

const PrimaryButton = React.forwardRef(
  (
    { type, text, link, onClick, submit, disabled, onMouseEnter, onMouseLeave, href, className },
    ref
  ) => {
    const containerClassName = cn(styles.container, styles[type], className)
    if (!_.isEmpty(href)) {
      return (
        <a
          type={submit ? 'submit' : 'button'}
          className={containerClassName}
          onClick={submit ? null : onClick}
          disabled={disabled}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          ref={ref}
          href={href}
          target='_blank'
        >
          <span>{text}</span>
        </a>
      )
    }
    if (_.isEmpty(link)) {
      return (
        <button
          type={submit ? 'submit' : 'button'}
          className={containerClassName}
          onClick={submit ? null : onClick}
          disabled={disabled}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          ref={ref}
        >
          <span>{text}</span>
        </button>
      )
    }
    return (
      <Link
        className={containerClassName}
        to={`${link}`}
        ref={ref}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <span>{text}</span>
      </Link>
    )
  }
)

PrimaryButton.propTypes = {
  type: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  link: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func,
  submit: PropTypes.bool,
  disabled: PropTypes.bool,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  className: PropTypes.string
}

export default PrimaryButton
