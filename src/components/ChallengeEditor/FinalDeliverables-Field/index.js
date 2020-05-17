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
    this.setState({ newFileType: _.trim(value) })
  }

  onAddFileType (event) {
    if (!_.isEmpty(this.state.newFileType)) {
      this.props.addFileType(this.state.newFileType)
      this.setState({ newFileType: '' })
    }

    event.preventDefault()
    event.stopPropagation()
  }

  render () {
    const { challenge, onUpdateCheckbox, readOnly } = this.props
    return (
      <React.Fragment>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor='finalDeliverables'>Final Deliverables :</label>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.checkList}>
            {
              _.map(challenge.fileTypes, (type, index) => (
                <div className={styles.tcCheckbox} key={type.name}>
                  <input
                    name={type.name}
                    type='checkbox'
                    id={type.name}
                    checked={type.check}
                    onChange={(e) => onUpdateCheckbox(type.name, e.target.checked, 'fileTypes', index)}
                    readOnly={readOnly}
                  />
                  <label htmlFor={type.name} className={cn({ [styles.readOnly]: readOnly })}>
                    <div className={styles.checkboxLabel}>
                      {type.name}
                    </div>
                  </label>
                </div>
              ))
            }
          </div>
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
  onUpdateCheckbox: PropTypes.func.isRequired,
  addFileType: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

export default FinalDeliverablesField
