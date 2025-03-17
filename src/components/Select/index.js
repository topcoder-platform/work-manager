import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import ReactSelect, { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import AsyncSelect from 'react-select/async'
import PT from 'prop-types'
import styles from './styles'

const menuList = ({ onMenuScrollBottom }) => {
  let menuListRef = null

  const handleOnScroll = (ev) => {
    ev.preventDefault()
    const el = ev.target
    if (el.scrollTop + el.offsetHeight >= el.scrollHeight - 10) {
      onMenuScrollBottom()
    }
  }

  const setMenuListRef = (ref) => {
    if (!menuListRef) {
      ref.addEventListener('scroll', handleOnScroll, false)
    }
    menuListRef = ref
  }
  return (props) => (
    <components.MenuList key='projects-select--menu-list' {...props} innerRef={onMenuScrollBottom ? (ref) => { setMenuListRef(ref); props.innerRef(ref) } : props.innerRef} />
  )
}

export default function Select (props) {
  const { selectRef, isCreatable, isAsync } = props
  const [components, setComponents] = useState({})

  useEffect(() => {
    setComponents((prev) => ({ ...prev, MenuList: menuList(props) }))
  }, [props.onMenuScrollBottom])

  if (isAsync) {
    return (<AsyncSelect
      ref={selectRef}
      {...props}
      autosize={false}
      styles={styles}
    />)
  }
  if (isCreatable) {
    return (<CreatableSelect
      ref={selectRef}
      {...props}
      autosize={false}
      styles={styles}
    />)
  }

  return (
    <ReactSelect
      ref={selectRef}
      {...props}
      autosize={false}
      styles={styles}
      components={components}
    />
  )
}

Select.defaultProps = {
  selectRef: _.noop,
  isCreatable: false,
  isAsync: false
}

Select.propTypes = {
  selectRef: PT.func,
  isCreatable: PT.bool,
  isAsync: PT.bool,
  onMenuScrollBottom: PT.func
}
