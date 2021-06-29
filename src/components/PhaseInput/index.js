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
const MIN_PHASE_DURATION_MINS = 1
const SECONDS_IN_HOUR = 3600
const SECONDS_IN_MIN = 60

class PhaseInput extends Component {
  getSeconds (hours, mins) {
    if (hours === 0 && mins === 0) {
      return MIN_PHASE_DURATION_MINS * SECONDS_IN_MIN
    }

    return (hours * SECONDS_IN_HOUR) + (mins * SECONDS_IN_MIN)
  }

  render () {
    const { phase, challengePhases, onUpdateSelect, onUpdatePhase, withDates, withDuration, endDate, readOnly } = this.props
    if (_.isEmpty(phase)) return null
    const date = moment(phase.date).format(dateFormat)
    const time = moment(phase.date)
    const hours = Math.floor(phase.duration / SECONDS_IN_HOUR)
    let mins = Math.floor((phase.duration - (hours * SECONDS_IN_HOUR)) / SECONDS_IN_MIN)
    if (hours === 0 && mins === 0) {
      mins = MIN_PHASE_DURATION_MINS
    }

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
              withDates && !readOnly && (
                <div className={styles.startDateLinks}>
                  <a href='#' onClick={() => onUpdatePhase(moment())}>Now</a>
                  <a href='#' onClick={() => onUpdatePhase(moment().add(15, 'minutes'))}>15 min</a>
                  <a href='#' onClick={() => onUpdatePhase(moment().add(1, 'hour'))}>1 hr</a>
                  <a href='#' onClick={() => onUpdatePhase(moment().add(1, 'day'))}>1 day</a>
                </div>
              )
            }
            {
              withDuration && (
                <div className={styles.durationPicker}>
                  {readOnly ? (
                    <span className={styles.readOnlyValue}>{`${hours} hrs ${mins} mins`}</span>
                  ) : (
                    <div className={styles.phaseDuration}>
                      <input
                        type='number'
                        className={styles.phaseInput}
                        value={hours}
                        onChange={e => onUpdatePhase(this.getSeconds(parseInt(e.target.value), mins))}
                        min={0}
                      />
                      <span className={cn(styles.timeText, styles.hoursText)}>hrs</span>
                      <input
                        type='number'
                        className={styles.phaseInput}
                        value={mins}
                        onChange={e => onUpdatePhase(this.getSeconds(hours, parseInt(e.target.value)))}
                        min={0}
                        max={59}
                      />
                      <span className={styles.timeText}>mins</span>
                    </div>)}
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
