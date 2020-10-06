import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import PrimaryButton from '../../Buttons/PrimaryButton'

import styles from './FinalDeliverables-Field.module.scss'

class FinalDeliverablesField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      newFileType: ''
    }
    this.onChangeInput = this.onChangeInput.bind(this)
    this.onAddFileType = this.onAddFileType.bind(this)
  }

  onChangeInput (value) {
    this.setState({ newFileType: value })
  }

  onAddFileType (event) {
    if (!_.isEmpty(this.state.newFileType)) {
      this.props.addFileType(this.state.newFileType.trim())
      this.setState({ newFileType: '' })
    }

    event.preventDefault()
    event.stopPropagation()
  }

  render () {
    const { challenge, readOnly, removeFileType } = this.props
    const fileTypesMetadata = _.find(challenge.metadata, { name: 'fileTypes' })
    const fileTypes = (fileTypesMetadata && JSON.parse(fileTypesMetadata.value)) || []
    const isDuplicateValue = _.includes(fileTypes.map((fileType) => fileType.toLowerCase()), this.state.newFileType.toLowerCase().trim())

    return (
      <React.Fragment>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor='finalDeliverables'>Final Deliverables :</label>
          </div>
        </div>
        <div className={styles.row}>
          {!readOnly ? (
            <ul className={styles.fileTypeList}>
              {_.map(fileTypes, (type) => (
                <li key={type} htmlFor={type} className={styles.fileTypeItem}>
                  {type}
                  <button className={styles.fileTypeDelete} type='button' onClick={() => removeFileType(type)}>×</button>
                </li>
              ))}
            </ul>
          ) : (
            fileTypes.join(', ')
          )}
        </div>
        {!readOnly && (<div className={styles.row}>
          <form name='add-file-type-form' autoComplete='off' onSubmit={this.onAddFileType}>
            <div>
              <input
                id='addFileType'
                type='text'
                value={this.state.newFileType}
                onChange={(e) => this.onChangeInput(e.target.value)}
              />
            </div>
            <div className={styles.button}>
              <PrimaryButton
                text={'Add File Type'}
                type={'info'}
                disabled={!this.state.newFileType.trim() || isDuplicateValue}
                submit
              />
            </div>
          </form>
        </div>)}

      </React.Fragment>
    )
  }
}

FinalDeliverablesField.defaultProps = {
  readOnly: false
}

FinalDeliverablesField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  addFileType: PropTypes.func.isRequired,
  removeFileType: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

export default FinalDeliverablesField
