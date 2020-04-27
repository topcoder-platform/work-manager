/* global document */

import _ from 'lodash'
import React from 'react'
import ReactDom from 'react-dom'
import PT from 'prop-types'
import cn from 'classnames'
import { themr } from 'react-css-super-themr'

import defaultStyle from './Modal.module.scss'

/* NOTE: Modal component is implemented as class, as it demands advanced
 * interaction with DOM upon mount and unmount. */
class BaseModal extends React.Component {
  constructor (props) {
    super(props)
    this.portal = document.createElement('div')
  }

  componentDidMount () {
    document.body.classList.add('scrolling-disabled-by-modal')
    document.body.appendChild(this.portal)
  }

  componentWillUnmount () {
    document.body.classList.remove('scrolling-disabled-by-modal')
    document.body.removeChild(this.portal)
  }

  render () {
    const {
      children,
      onCancel,
      theme
    } = this.props
    return ReactDom.createPortal(
      (
        <React.Fragment>
          <div
            className={theme.container}
            onWheel={event => event.stopPropagation()}
          >
            <div className={theme.childrenwrapper}>
              {children}
              <button className={cn(theme.closebtn, 'close')} onClick={() => onCancel()} type='button' aria-label='Close'>
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
          </div>
          <button
            onClick={() => onCancel()}
            className={theme.overlay}
            type='button'
          />
        </React.Fragment>
      ),
      this.portal
    )
  }
}

BaseModal.defaultProps = {
  onCancel: _.noop,
  children: null,
  theme: {}
}

BaseModal.propTypes = {
  onCancel: PT.func,
  children: PT.node,
  theme: PT.shape()
}

/* Non-themed version of the Modal. */
export { BaseModal }

export default themr('Modal', defaultStyle)(BaseModal)
