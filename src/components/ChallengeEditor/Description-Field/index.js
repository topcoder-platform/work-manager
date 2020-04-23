import React, { Component } from 'react'
import styles from './Description-Field.module.scss'
import PropTypes from 'prop-types'
import SimpleMDE from 'simplemde'

class DescriptionField extends Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
  }

  componentDidMount () {
    const { challenge, onUpdateDescription, type } = this.props
    this.simplemde = new SimpleMDE({ element: this.ref.current, initialValue: challenge[type] })
    this.simplemde.codemirror.on('change', () => onUpdateDescription(this.simplemde.value(), type))
  }

  render () {
    const { type } = this.props
    return <div className={styles.editor}>
      <textarea
        ref={this.ref} id={type} name={type}
        placeholder='Enter challenge description' />
    </div>
  }
}

DescriptionField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateDescription: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired
}
export default DescriptionField
