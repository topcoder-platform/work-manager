/**
 * Tooltip component
 *
 * This component can be wrapped around any child component like this:
 * ```
 *   <Tooltip content="Tooltip content">
 *     <AnyComponent />
 *   </Tooltip>
 * ```
 * and tooltip would be shown when we put mouse on <AnyComponent />.
 *
 * <AnyComponent /> component should support the next props:
 * - `onMouseEnter`
 * - `onMouseLeave`
 * - `ref` to pass reference to its DOM element
 *
 * All the basic DOM components like <div>, <span> and so on are supported by default.
 */
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import styles from './Tooltip.module.scss'
import { usePopper } from 'react-popper'

const Tooltip = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const [arrowElement, setArrowElement] = useState(null)
  const { styles: popperStyles, attributes } = usePopper(
    referenceElement,
    popperElement,
    {
      placement: 'top',
      modifiers: [
        {
          name: 'flip',
          options: {
            fallbackPlacements: ['top']
          }
        },
        {
          name: 'offset',
          options: {
            offset: [0, 6]
          }
        },
        {
          name: 'arrow',
          // padding should be equal to border-radius of the dropdown
          options: { element: arrowElement, padding: 7 }
        },
        {
          name: 'preventOverflow',
          options: {
            // padding from browser edges
            padding: 16
          }
        }
      ]
    }
  )

  const close = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [setIsOpen])

  return (
    <>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          onMouseEnter: open,
          onMouseLeave: close,
          innerRef: setReferenceElement,
          ref: setReferenceElement
        })
      )}

      {isOpen && (
        <div
          className={styles.popover}
          ref={setPopperElement}
          style={popperStyles.popper}
          {...attributes.popper}
        >
          <div className={styles.content}>{content}</div>
          <div
            ref={setArrowElement}
            style={popperStyles.arrow}
            className={styles.popoverArrow}
          />
        </div>
      )}
    </>
  )
}

Tooltip.propTypes = {
  content: PropTypes.node,
  children: PropTypes.node
}

export default Tooltip
