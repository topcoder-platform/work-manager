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

const format = 'hh:mm a'
const dateFormat = 'DD/MM/YYYY'

class PhaseInput extends Component {
  render () {
    const { phase, onUpdateSelect, index, onUpdatePhaseDate, onUpdatePhaseTime } = this.props
    let time = moment()
    if (!_.isEmpty(phase.date) && !_.isEmpty(phase.time)) {
      time = moment(`${phase.date} ${phase.time}`)
    }
    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor={`${phase.name}`}>{phase.name} :</label>
          </div>
          <div className={cn(styles.field, styles.col2)}>
            <div className={styles.dayPicker}>
              <DayPickerInput formatDate={formatDate} parseDate={parseDate} placeholder={dateFormat} value={phase.date} onDayChange={(selectedDay) => onUpdatePhaseDate(selectedDay, index)} format={dateFormat} />
            </div>
            <div className={styles.timePicker}>
              <TimePicker showSecond={false} use12Hours value={time} format={format} onChange={(value) => onUpdatePhaseTime(moment(value).format('HH:MM'), index)} />
            </div>
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
                    onChange={(e) => onUpdateSelect(e, true, 'phases', index)}
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

PhaseInput.propTypes = {
  phase: PropTypes.shape().isRequired,
  onUpdateSelect: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  onUpdatePhaseDate: PropTypes.func.isRequired,
  onUpdatePhaseTime: PropTypes.func.isRequired
}
export default PhaseInput
