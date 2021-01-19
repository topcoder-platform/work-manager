export default {
  container: (provided) => ({
    ...provided,
    width: '100%'
  }),
  control: (provided, state) => {
    let styles = {
      ...provided,
      borderRadius: '2px !important'
    }
    if (state.isFocused) {
      styles = {
        ...styles,
        border: '1px solid #2C95D7',
        boxShadow: 'none'
      }
    }
    return styles
  },
  menu: (provided) => ({
    ...provided,
    boxSizing: 'border-box',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    fontSize: '15px',
    fontWeight: 300,
    lineHeight: '18px',
    color: '#2a2a2a',
    border: '1px solid #2C95D7',
    borderRadius: 0,
    zIndex: 4,
    margin: 0,
    padding: 0
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0
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
    paddingLeft: '10px',
    color: '#2a2a2a'
  }),
  input: (provided) => ({
    ...provided,
    backgroundColor: 'transparent',
    marginLeft: 0,
    paddingRight: '6px',
    paddingLeft: '10px',
    border: 'none',
    input: {
      width: 'auto !important',
      height: 'auto !important',
      lineHeight: 'normal !important'
    }
  }),
  singleValue: (provided) => ({
    ...provided,
    paddingLeft: '10px'
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#2c95d7'
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'white'
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    margin: '4px 4px',
    height: '16px',
    width: '16px',
    backgroundColor: '#c6def1',
    color: '#2C95D7',
    borderRadius: '50%'
  })
}
