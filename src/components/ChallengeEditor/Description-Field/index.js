import React, { Component } from 'react'
import styles from './Description-Field.module.scss'
import PropTypes from 'prop-types'
import SimpleMDE from 'simplemde'
import cn from 'classnames'
import _ from 'lodash'

class DescriptionField extends Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.state = {
      isChanged: false
    }
    this.blurTheFieldThrottled = _.throttle(this.blurTheField.bind(this), 10000) // 10s
  }

  blurTheField () {
    const { onBlurDescription, type } = this.props
    onBlurDescription(this.simplemde.value(), type)
  }

  componentDidMount () {
    const { challenge, onUpdateDescription, type } = this.props
    this.simplemde = new SimpleMDE({ element: this.ref.current, initialValue: challenge[type] })
    this.simplemde.codemirror.on('change', () => {
      this.setState({ isChanged: true })
      onUpdateDescription(this.simplemde.value(), type)
    })
    this.simplemde.codemirror.on('blur', () => {
      if (this.state.isChanged) {
        this.setState({ isChanged: false })
        this.blurTheFieldThrottled()
      }
    })
  }

  render () {
    const { type, isPrivate } = this.props
    return <div className={cn(styles.editor, { [styles.isPrivate]: isPrivate })}>
      <textarea
        ref={this.ref} id={type} name={type}
        placeholder='Enter challenge description' />
    </div>
  }
}

DescriptionField.defaultProps = {
  isPrivate: false,
  onBlurDescription: () => {}
}

DescriptionField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateDescription: PropTypes.func.isRequired,
  onBlurDescription: PropTypes.func,
  type: PropTypes.string.isRequired,
  isPrivate: PropTypes.bool
}
export default DescriptionField
