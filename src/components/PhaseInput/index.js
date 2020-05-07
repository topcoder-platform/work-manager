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
    const { phase, onUpdateSelect, onUpdatePhase, withDates, withDuration, endDate } = this.props
    if (_.isEmpty(phase)) return null
    const date = moment(phase.date).format(dateFormat)
    const time = moment(phase.date)

    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1, styles.phaseName)}>
            <label htmlFor={`${phase.name}`}>{phase.name} :</label>
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
                  <DayPickerInput formatDate={formatDate} parseDate={parseDate} placeholder={dateFormat} value={date} onDayChange={(selectedDay) => onUpdatePhase(moment(`${moment(selectedDay).format(dateFormat)} ${time.format(timeFormat)}`, `${dateFormat} ${timeFormat}`))} format={dateFormat} />
                </div>
              )
            }
            {
              withDates && (
                <div className={styles.timePicker}>
                  <TimePicker showSecond={false} value={time} format={timeFormat} onChange={(value) => onUpdatePhase(value)} />
                </div>
              )
            }
            {
              withDuration && (
                <div className={styles.durationPicker}>
                  <input type='number' value={phase.duration} onChange={e => onUpdatePhase(e.target.value)} min={0} placeholder='Duration (hours)' />
                </div>
              )
            }
            {
              !_.isEmpty(phase.scorecards) && (
                <div className={styles.scorecards}>
                  <Select
                    name='scorecard'
                    options={phase.scorecards}
                    placeholder='Select Scorecard'
                    labelKey='name'
                    valueKey='name'
                    clearable={false}
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
  withDates: false,
  withDuration: false,
  endDate: null
}

PhaseInput.propTypes = {
  phase: PropTypes.shape().isRequired,
  onUpdateSelect: PropTypes.func,
  onUpdatePhase: PropTypes.func.isRequired,
  withDates: PropTypes.bool,
  withDuration: PropTypes.bool,
  endDate: PropTypes.shape()
}
export default PhaseInput
