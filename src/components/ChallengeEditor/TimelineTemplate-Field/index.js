import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './TimelineTemplate-Field.module.scss'

class TimelineTemplateField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      validOptions: [],
      selectedOption: {}
    }

    this.checkData = this.checkData.bind(this)
    this.loadSelectedOption = this.loadSelectedOption.bind(this)
    this.getErrorMessage = this.getErrorMessage.bind(this)
  }

  componentDidMount () {
    const { challengeTimelines, timelineTemplates, challenge } = this.props
    this.checkData(challengeTimelines, timelineTemplates, challenge)
  }

  componentWillUnmount () {
    this.props.onUpdateSelect(this.state.selectedOption.value, false, 'timelineTemplateId')
  }

  loadSelectedOption (validOptions, value) {
    // if (!value) return
    const { timelineTemplates, challenge } = this.props
    const selectedOption = {}
    const selectedTemplate = _.find(timelineTemplates, t => t.id === (value))
    // if (!selectedTemplate) return
    selectedOption.label = selectedTemplate.name
    selectedOption.value = selectedTemplate.id
    this.setState({
      validOptions,
      matchString: `${challenge.typeId}-${challenge.trackId}-${value}`,
      selectedOption
    })
  }

  checkData (challengeTimelines, timelineTemplates, challenge) {
    const availableTemplates = _.filter(challengeTimelines, ct => ct.typeId === challenge.typeId && ct.trackId === challenge.trackId)
    const availableTemplateIds = availableTemplates.map(tt => tt.timelineTemplateId)
    const validOptions = _.filter(timelineTemplates, t => _.includes(availableTemplateIds, t.id))
    const defaultValue = _.get(_.find(availableTemplates, t => t.isDefault), 'timelineTemplateId')
    if (challenge.timelineTemplateId) {
      if (!_.includes(_.map(validOptions, o => o.id), challenge.timelineTemplateId)) {
        this.loadSelectedOption(validOptions, defaultValue)
      } else {
        this.loadSelectedOption(validOptions, challenge.timelineTemplateId)
      }
    } else if (defaultValue) {
      return this.loadSelectedOption(validOptions, defaultValue)
    }
  }

  getErrorMessage () {
    if (!this.props.challenge.typeId || !this.props.challenge.trackId) {
      return 'Please select a work type and format to enable this field'
    } else if (this.props.challenge.submitTriggered && !this.props.challenge.timelineTemplateId) {
      return 'Timeline template is required field'
    } else if (this.state.validOptions.length === 0) {
      return 'Sorry, there are no available timeline templates for the options you have selected'
    }
    return null
  }

  render () {
    const { challengeTimelines, timelineTemplates, challenge } = this.props
    const hasSelectedTypeAndTrack = !_.isEmpty(challenge.typeId) && !_.isEmpty(challenge.trackId)
    if ((hasSelectedTypeAndTrack && this.state.validOptions.length === 0) || this.state.matchString !== `${challenge.typeId}-${challenge.trackId}-${this.state.selectedOption.value}`) {
      this.checkData(challengeTimelines, timelineTemplates, challenge)
    }
    const error = this.getErrorMessage()
    return (
      <>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor='type'>Timeline Template {!this.props.readOnly && <span>*</span>} :</label>
          </div>
          <div className={cn(styles.field, styles.col2, { [styles.disabled]: this.state.validOptions.length === 0 })}>
            <Select
              value={this.state.selectedOption}
              name='timelineTemplateId'
              options={this.state.validOptions.map(type => ({ label: type.name, value: type.id }))}
              placeholder='Timeline Template'
              isClearable={false}
              onChange={(e) => {
                this.props.onUpdateSelect(e.value, false, 'timelineTemplateId')
                this.loadSelectedOption(this.state.validOptions, e.value)
              }}
              isDisabled={this.state.validOptions.length === 0 || this.props.readOnly}
            />
          </div>
        </div>
        { error && <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)} />
          <div className={cn(styles.field, styles.col2, styles.error)}>
            {error}
          </div>
        </div> }
      </>
    )
  }
}

TimelineTemplateField.defaultProps = {
  challengeTimelines: [],
  timelineTemplates: [],
  readOnly: false
}

TimelineTemplateField.propTypes = {
  challengeTimelines: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  timelineTemplates: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateSelect: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

export default TimelineTemplateField
