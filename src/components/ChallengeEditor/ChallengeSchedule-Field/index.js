import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeSchedule-Field.module.scss'
import cn from 'classnames'
import PhaseInput from '../../PhaseInput'
import Select from '../../Select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faTrash } from '@fortawesome/free-solid-svg-icons'
import jstz from 'jstimezonedetect'

class ChallengeScheduleField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEdit: false,
      currentTemplate: ''
    }
    this.toggleEditMode = this.toggleEditMode.bind(this)
  }

  toggleEditMode () {
    const { isEdit } = this.state
    this.setState({ isEdit: !isEdit })
  }

  renderTimeLine () {
    const { challenge } = this.props
    return (
      <React.Fragment>
        <div className={styles.row}>
          <div className={styles.timeline}>
            {
              _.map(challenge.phases, p => (
                <div className={styles.phase} key={p.name}>
                  <div className={styles.circle}>&nbsp;</div>
                  <span>{p.name}</span>
                  {
                    !_.isEmpty(p.date) && !_.isEmpty(p.time) && (
                      <span>{p.date}, {p.time}</span>
                    )
                  }
                </div>
              ))
            }
          </div>
        </div>
      </React.Fragment>
    )
  }

  renderPhaseEditor () {
    const { challenge, onUpdateSelect, onUpdatePhaseDate, onUpdatePhaseTime, removePhase } = this.props
    return (
      _.map(challenge.phases, (p, index) => (
        <div className={styles.PhaseRow} key={p.name}>
          <PhaseInput phase={p} onUpdateSelect={onUpdateSelect} index={index} onUpdatePhaseDate={onUpdatePhaseDate} onUpdatePhaseTime={onUpdatePhaseTime} />

          <div className={styles.icon} onClick={() => removePhase(index)}>
            <FontAwesomeIcon icon={faTrash} />
          </div>

        </div>
      )
      ))
  }

  render () {
    const { isEdit, currentTemplate } = this.state
    const { templates, isOpenAdvanceSettings, resetPhase } = this.props
    return (
      <div className={styles.container}>
        {
          isEdit && !isOpenAdvanceSettings && (
            <hr className={styles.breakLine} />
          )
        }
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor={`challengeSchedule`}>Challenge Schedule :</label>
          </div>
          <div className={cn(styles.field, styles.col2)} onClick={this.toggleEditMode}>
            <div className={cn(styles.editButton, { [styles.active]: isEdit })}>
              <span>Edit</span>
              <FontAwesomeIcon className={cn(styles.icon, { [styles.active]: isEdit })} icon={faAngleDown} />
            </div>
          </div>
        </div>
        {
          !isEdit && this.renderTimeLine()
        }
        {
          isEdit && (
            <React.Fragment>
              <div className={cn(styles.row, styles.flexStart)}>
                <div className={cn(styles.field, styles.col1)}>
                  <label htmlFor={'notitle'}>&nbsp;</label>
                </div>
                <div className={cn(styles.field, styles.col2)}>
                  <div className={styles.templates}>
                    <Select
                      name='template'
                      options={templates}
                      placeholder='Import Timeline from Templates'
                      labelKey='name'
                      valueKey='name'
                      clearable={false}
                      value={currentTemplate}
                      onChange={(e) => this.setState({
                        currentTemplate: e
                      }, () => resetPhase(e))}
                    />
                  </div>
                </div>
              </div>
            </React.Fragment>
          )
        }
        {
          isEdit && this.renderPhaseEditor()
        }
        <div className={cn(styles.row, styles.timezone)}>
          <span>Timezone: {jstz.determine().name()}</span>
        </div>
      </div>
    )
  }
}

ChallengeScheduleField.propTypes = {
  templates: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  removePhase: PropTypes.func.isRequired,
  resetPhase: PropTypes.func.isRequired,
  onUpdateSelect: PropTypes.func.isRequired,
  isOpenAdvanceSettings: PropTypes.bool.isRequired,
  onUpdatePhaseDate: PropTypes.func.isRequired,
  onUpdatePhaseTime: PropTypes.func.isRequired
}

export default ChallengeScheduleField
