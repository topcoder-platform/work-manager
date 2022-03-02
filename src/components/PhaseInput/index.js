import _ from 'lodash'
import moment from 'moment-timezone'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './PhaseInput.module.scss'
import cn from 'classnames'
import 'react-day-picker/lib/style.css'
import 'rc-time-picker/assets/index.css'
import Select from '../Select'
import DateTime from '@nateradebaugh/react-datetime'
import isAfter from 'date-fns/isAfter'
import subDays from 'date-fns/subDays'
import '@nateradebaugh/react-datetime/scss/styles.scss'

const dateFormat = 'MM/DD/YYYY HH:mm'
// const tcTimeZone = 'America/New_York'

class PhaseInput extends Component {
  constructor (props) {
    super(props)

    this.onDateChange = this.onDateChange.bind(this)
  }

  onDateChange (e) {
    const { onUpdatePhase } = this.props

    onUpdatePhase(moment(e, dateFormat))
  }

  render () {
    const { phase, onUpdateSelect, onUpdatePhase, withDates, withDuration, endDate, readOnly } = this.props
    if (_.isEmpty(phase)) return null

    const date = moment(phase.date).format(dateFormat)

    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1, styles.phaseName)}>
            <label htmlFor={`${phase.name}`}>{phase.name} :</label>
            {
              withDuration && endDate && (
                <div className={styles.previewDates}>
                  <span>Ends:</span>
                  {moment(endDate).local().format(`${dateFormat}`)}
                </div>
              )
            }
          </div>
          <div className={cn(styles.field, styles.col2)}>
            {
              withDates && (
                <div className={styles.dayPicker}>
                  {
                    readOnly ? (
                      <span className={styles.readOnlyValue}>{date}</span>
                    )
                      : (
                        <DateTime
                          value={date}
                          onChange={this.onDateChange}
                          isValidDate={(current) => {
                            const yesterday = subDays(new Date(), 1)
                            return isAfter(current, yesterday)
                          }}
                        />)}
                </div>
              )
            }
            {/* {
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
            } */}
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
  withDates: false,
  withDuration: false,
  endDate: null,
  readOnly: false
}

PhaseInput.propTypes = {
  phase: PropTypes.shape().isRequired,
  onUpdateSelect: PropTypes.func,
  onUpdatePhase: PropTypes.func.isRequired,
  withDates: PropTypes.bool,
  withDuration: PropTypes.bool,
  endDate: PropTypes.shape(),
  readOnly: PropTypes.bool
}
export default PhaseInput
