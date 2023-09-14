import React from 'react'
import _ from 'lodash'
import ReactSelect from 'react-select'
import CreatableSelect from 'react-select/creatable'
import AsyncSelect from 'react-select/async'
import PT from 'prop-types'
import styles from './styles'

export default function Select (props) {
  const { selectRef, isCreatable, isAsync } = props

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
  isAsync: PT.bool
}
