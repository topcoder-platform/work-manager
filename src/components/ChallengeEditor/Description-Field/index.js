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
    const { challenge, onUpdateDescription } = this.props
    this.simplemde = new SimpleMDE({ element: this.ref.current, initialValue: challenge.description })
    this.simplemde.codemirror.on('change', () => onUpdateDescription(this.simplemde.value()))
  }

  render () {
    return <div className={styles.editor}>
      <textarea
        ref={this.ref} id='description' name='description'
        placeholder='Enter challenge description' />
    </div>
  }
}

DescriptionField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateDescription: PropTypes.func.isRequired
}
export default DescriptionField
