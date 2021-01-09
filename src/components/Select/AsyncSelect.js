import React from 'react'
import _ from 'lodash'
import ReactSelect from 'react-select/async'
import PT from 'prop-types'

export default function Select (props) {
  const { selectRef } = props
  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: '100%',
      minWidth: '150px',
      background: 'red'
    }),
    control: (provided) => ({
      ...provided,
      borderRadius: '2px !important',
      ':focus': {
        border: '1px solid #2C95D7',
        boxShadow: 'none'
      }
    }),
    menu: (provided) => ({
      ...provided,
      boxSizing: 'border-box',
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontSize: '15px',
      fontWeight: 300,
      lineHeight: '18px',
      color: '#2a2a2a',
      border: '1px solid #2C95D7',
      zIndex: 4
    }),
    option: (provided) => ({
      ...provided,
      paddingLeft: '20px'
    }),
    placeholder: (provided) => ({
      ...provided,
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontSize: '15px',
      fontWeight: 300,
      paddingLeft: '20px',
      color: '#2a2a2a'
    }),
    input: (provided) => ({
      ...provided,
      backgroundColor: 'transparent',
      marginLeft: 0,
      paddingRight: '6px',
      paddingLeft: '10px',
      border: 'none'
    })
  }
  return (
    <ReactSelect
      ref={selectRef}
      {...props}
      autosize={false}
      styles={customStyles}
    />
  )
}

Select.defaultProps = {
  selectRef: _.noop
}

Select.propTypes = {
  selectRef: PT.func
}
