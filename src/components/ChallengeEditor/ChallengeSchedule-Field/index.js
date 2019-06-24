import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import styles from './ChallengeSchedule-Field.module.scss'
import cn from 'classnames'
import PhaseInput from '../../PhaseInput'
import Chart from 'react-google-charts'
import Select from '../../Select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faTrash } from '@fortawesome/free-solid-svg-icons'
import jstz from 'jstimezonedetect'

const GANTT_ROW_HEIGHT = 45
const GANTT_FOOTER_HEIGHT = 40

class ChallengeScheduleField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEdit: false,
      currentTemplate: ''
    }
    this.toggleEditMode = this.toggleEditMode.bind(this)
    this.getPhaseEndDate = this.getPhaseEndDate.bind(this)
    this.renderTimeLine = this.renderTimeLine.bind(this)
  }

  toggleEditMode () {
    const { isEdit } = this.state
    this.setState({ isEdit: !isEdit })
  }

  getPhaseEndDate (index) {
    const { challenge } = this.props
    const map = {}
    const alreadyCalculated = {}
    _.each(challenge.phases, p => { map[p.id] = p.duration })
    const finalDate = moment(challenge.startDate)
    finalDate.add(challenge.phases[index].duration, 'hours')

    if (!challenge.phases[index].predecessor) {
      return finalDate
    }

    for (let i = index; i >= 0; i -= 1) {
      const { predecessor } = challenge.phases[i]
      if (predecessor) {
        if (!alreadyCalculated[predecessor]) {
          alreadyCalculated[predecessor] = true
          finalDate.add(map[predecessor], 'hours')
        }
      }
    }
    return finalDate
  }

  renderTimeLine () {
    const { challenge } = this.props
    const timelines = []
    if (challenge.phases) {
      timelines.push(
        [
          { type: 'string', label: 'Task ID' },
          { type: 'string', label: 'Task Name' },
          { type: 'date', label: 'Start Date' },
          { type: 'date', label: 'End Date' },
          { type: 'number', label: 'Duration' },
          { type: 'number', label: 'Percent Complete' },
          { type: 'string', label: 'Dependencies' }
        ]
      )

      var oneDay = 3600000 // = 1 hr
      _.map(challenge.phases, (p, index) => {
        var startDate = index === 0 || !p.predecessor ? moment(challenge.startDate).toDate() : this.getPhaseEndDate(index - 1).toDate()
        var endDate = this.getPhaseEndDate(index).toDate()
        var currentTime = moment().valueOf()
        var percentage = 0
        if (startDate.getTime() > currentTime) {
          percentage = 0
        } else if (endDate.getTime() > currentTime) {
          percentage = Math.round(((currentTime - startDate.getTime()) / (oneDay * p.duration)) * 100)
        } else {
          percentage = Math.round(((endDate.getTime() - startDate.getTime()) / (oneDay * p.duration)) * 100)
        }
        timelines.push(
          [
            p.name,
            p.name,
            startDate,
            endDate,
            null,
            percentage,
            p.predecessor ? challenge.phases.filter(ph => ph.id === p.predecessor)[0].name : null
          ]
        )
      })
    }
    return timelines
  }

  renderPhaseEditor () {
    const { challenge, onUpdateSelect, onUpdatePhase, removePhase } = this.props
    return (
      _.map(challenge.phases, (p, index) => (
        <div className={styles.PhaseRow} key={p.name}>
          <PhaseInput
            phase={p}
            withDuration
            onUpdateSelect={onUpdateSelect}
            onUpdatePhase={newValue => onUpdatePhase(newValue, 'duration', index)}
            endDate={this.getPhaseEndDate(index)}
          />

          <div className={styles.icon} onClick={() => removePhase(index)}>
            <FontAwesomeIcon icon={faTrash} />
          </div>

        </div>
      )
      ))
  }

  render () {
    const { isEdit, currentTemplate } = this.state
    const { templates, resetPhase, challenge, onUpdateOthers } = this.props

    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1, styles.title)}>
            <label htmlFor={`challengeSchedule`}>Challenge Schedule :</label>
            <div className={styles.timezone}>
              <span>Timezone: {jstz.determine().name()}</span>
            </div>
          </div>
          <div className={cn(styles.field, styles.col2)} onClick={this.toggleEditMode}>
            <div className={cn(styles.editButton, { [styles.active]: isEdit })}>
              <span>Edit</span>
              <FontAwesomeIcon className={cn(styles.icon, { [styles.active]: isEdit })} icon={faAngleDown} />
            </div>
          </div>
        </div>
        {
          !isEdit && typeof challenge.phases !== 'undefined' && challenge.phases.length > 0 && (
            <div className={styles.chart}>
              <Chart
                width={'100%'}
                height={`${(challenge.phases.length * GANTT_ROW_HEIGHT) + GANTT_FOOTER_HEIGHT}px`}
                chartType='Gantt'
                loader={<div>Loading Timelines</div>}
                data={this.renderTimeLine()}
                rootProps={{ 'data-testid': '1' }}
              />
            </div>
          )
        }
        {
          isEdit && (
            <React.Fragment>
              <div className={cn(styles.row, styles.flexStart)}>
                <div className={cn(styles.field, styles.col1)}>
                  <label htmlFor={'notitle'}>Timeline template :</label>
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
        { isEdit && (
          <div className={styles.PhaseRow}>
            <PhaseInput
              withDates
              phase={{
                name: 'Start Date',
                date: challenge.startDate
              }}
              onUpdatePhase={newValue => onUpdateOthers({
                field: 'startDate',
                value: newValue
              })}
            />
          </div>
        ) }
        {
          isEdit && this.renderPhaseEditor()
        }
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
  onUpdatePhase: PropTypes.func.isRequired,
  onUpdateOthers: PropTypes.func.isRequired
}

export default ChallengeScheduleField
