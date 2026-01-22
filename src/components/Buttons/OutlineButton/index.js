import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'

import styles from './Outline.module.scss'
import _ from 'lodash'

const OutlineButton = ({ type, text, link, onClick, url, className, submit, disabled, target = 'self', rel }) => {
  const containerClassName = cn(styles.container, styles[type], className)

  const handleUrlClick = (event) => {
    if (disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (onClick) {
      onClick(event)
    }
  }

  const resolvedRel = (() => {
    if (target !== '_blank') {
      return rel
    }
    const relTokens = new Set((rel || '').split(/\s+/).filter(Boolean))
    relTokens.add('noopener')
    relTokens.add('noreferrer')
    return Array.from(relTokens).join(' ')
  })()

  if (_.isEmpty(link) && _.isEmpty(url)) {
    return (
      <button
        type={submit ? 'submit' : 'button'}
        className={cn(containerClassName, disabled && styles.disable)}
        onClick={submit ? null : onClick}
        disabled={disabled}
      >
        <span>{text}</span>
      </button>
    )
  }

  if (!_.isEmpty(link)) {
    return (
      <Link className={containerClassName} to={link}>
        <span>{text}</span>
      </Link>
    )
  }

  return (
    <a
      className={cn(containerClassName, disabled && styles.disable)}
      href={`${url}`}
      target={target}
      rel={resolvedRel}
      onClick={(disabled || onClick) ? handleUrlClick : null}
      aria-disabled={disabled ? 'true' : null}
      tabIndex={disabled ? -1 : null}
    >
      <span>{text}</span>
    </a>
  )
}

OutlineButton.propTypes = {
  type: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  link: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  url: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  submit: PropTypes.bool,
  disabled: PropTypes.bool,
  target: PropTypes.oneOf(['_blank', 'self']),
  rel: PropTypes.string
}

export default OutlineButton
