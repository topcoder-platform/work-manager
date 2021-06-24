import _ from 'lodash'
import moment from 'moment'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './PhaseInput.module.scss'
import cn from 'classnames'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import TimePicker from 'rc-time-picker'
import {
  formatDate,
  parseDate
} from 'react-day-picker/moment'
import 'react-day-picker/lib/style.css'
import 'rc-time-picker/assets/index.css'
import Select from '../Select'

const timeFormat = 'HH:mm'
const dateFormat = 'MM/DD/YYYY'

class PhaseInput extends Component {
  render () {
    const { phase, challengePhases, onUpdateSelect, onUpdatePhase, withDates, withDuration, endDate, readOnly } = this.props
    if (_.isEmpty(phase)) return null
    const date = moment(phase.date).format(dateFormat)
    const time = moment(phase.date)
    const phaseName = phase.name || _.get(_.find(challengePhases, p => p.id === phase.phaseId), 'name', '')
    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1, styles.phaseName)}>
            <label htmlFor={`${phaseName}`}>{phaseName} :</label>
            {
              withDuration && endDate && (
                <div className={styles.previewDates}>
                  <span>Ends:</span>
                  {moment(endDate).format(`${dateFormat} ${timeFormat}`)}
                </div>
              )
            }
          </div>
          <div className={cn(styles.field, styles.col2)}>
            {
              withDates && (
                <div className={styles.dayPicker}>
                  {readOnly ? (
                    <span className={styles.readOnlyValue}>{date}</span>
                  ) : (<DayPickerInput formatDate={formatDate} inputProps={{ readOnly: true }} dayPickerProps={{ disabledDays: { before: new Date() } }} parseDate={parseDate} placeholder={dateFormat} value={date} onDayChange={(selectedDay) => onUpdatePhase(moment(`${moment(selectedDay).format(dateFormat)} ${time.format(timeFormat)}`, `${dateFormat} ${timeFormat}`))} format={dateFormat} />)}
                </div>
              )
            }
            {
              withDates && (
                <div className={styles.timePicker}>
                  {readOnly ? (
                    <span className={styles.readOnlyValue}>{time.format(timeFormat)}</span>
                  ) : (<TimePicker
                    showSecond={false}
                    inputReadOnly
                    value={time}
                    format={timeFormat}
                    onChange={(value) => onUpdatePhase(value)}
                  />)}
                </div>
              )
            }
            {
              withDuration && (
                <div className={styles.durationPicker}>
                  {readOnly ? (
                    <span className={styles.readOnlyValue}>{phase.duration}</span>
                  ) : (<input type='number' value={phase.duration} onChange={e => onUpdatePhase(e.target.value)} min={1} placeholder='Duration (hours)' />)}
                </div>
              )
            }
            {
              !_.isEmpty(phase.scorecards) && (
                <div className={styles.scorecards}>
                  <Select
                    name='scorecard'
                    options={phase.scorecards.map(({ name }) => ({ label: name, value: name, name }))}
                    placeholder='Select Scorecard'
                    isClearable={false}
                    value={phase.scorecard}
                    onChange={(e) => onUpdateSelect(e, true, 'phases')}
                  />
                </div>
              )
            }
          </div>
        </div>
      </div>
    )
  }
}

PhaseInput.defaultProps = {
  challengePhases: [],
  withDates: false,
  withDuration: false,
  endDate: null,
  readOnly: false
}

PhaseInput.propTypes = {
  phase: PropTypes.shape().isRequired,
  challengePhases: PropTypes.arrayOf(PropTypes.shape()),
  onUpdateSelect: PropTypes.func,
  onUpdatePhase: PropTypes.func.isRequired,
  withDates: PropTypes.bool,
  withDuration: PropTypes.bool,
  endDate: PropTypes.shape(),
  readOnly: PropTypes.bool
}
export default PhaseInput
