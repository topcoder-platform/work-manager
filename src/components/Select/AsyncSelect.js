import React from 'react'
import _ from 'lodash'
import ReactSelect from 'react-select/async'
import PT from 'prop-types'
import styles from './styles'

export default function Select (props) {
  const { selectRef } = props
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
  selectRef: _.noop
}

Select.propTypes = {
  selectRef: PT.func
}
