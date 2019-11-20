import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import $ from 'jquery'
import styles from './ChallengeSchedule-Field.module.scss'
import cn from 'classnames'
import jstz from 'jstimezonedetect'
import PhaseInput from '../../PhaseInput'
import Chart from 'react-google-charts'
import Select from '../../Select'
import { getPhaseEndDate } from '../../../util/date'
import { parseSVG } from '../../../util/svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faTrash } from '@fortawesome/free-solid-svg-icons'

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
    this.renderTimeLine = this.renderTimeLine.bind(this)
  }

  componentDidMount () {
    this._ismounted = true
  }

  componentWillUnmount () {
    this._ismounted = false
  }

  componentWillReceiveProps (nextProps) {
    const { currentTemplate } = this.state
    const { templates, resetPhase } = nextProps
    const { challenge } = this.props
    if (!currentTemplate && templates.length > 0 && this._ismounted && challenge.phases.length === 0) {
      // select first default templates for phases
      this.setState({
        currentTemplate: templates[0]
      }, () => {
        const interval = setInterval(() => {
          // use interval to make sure resetPhase work
          const { challenge } = this.props
          if (challenge && challenge.phases.length === 0 && this._ismounted) {
            resetPhase(templates[0])
          } else if (!this._ismounted || (challenge && challenge.phases.length > 0)) {
            clearInterval(interval)
          }
        }, 1000)
      })
    }
  }

  toggleEditMode () {
    const { isEdit } = this.state
    this.setState({ isEdit: !isEdit })
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
        // the registration and submission phases need to be shown as concurrent
        var startDate = (index === 0 || index === 1) || !p.predecessor ? moment(challenge.startDate).toDate() : getPhaseEndDate(index - 1, challenge).toDate()
        var endDate = getPhaseEndDate(index, challenge).toDate()
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
            endDate={getPhaseEndDate(index, challenge)}
          />

          <div className={styles.icon} onClick={() => removePhase(index)}>
            <FontAwesomeIcon icon={faTrash} />
          </div>

        </div>
      )
      ))
  }

  /**
   * Handle chart info in javascript
   * @param {Array} timelines timeline list
   */
  htmlHandleChart (timelines) {
    const svgContainerSelector = '#gantt-chart > div svg'
    const popupContainerElement = () => {
      return $(`${svgContainerSelector} > g`).eq(9)
    }

    const progressContainer = $('#gantt-chart > div svg > g').eq(5)
    const xAxisLabelContainer = $('#gantt-chart > div svg > g').eq(1)
    let textProgressContainer = $('#gantt-chart > div svg > g').eq(9)
    if (textProgressContainer.length === 0) {
      // add new container for start/finish date of challenge
      $(`${svgContainerSelector}`).append(parseSVG('<g></g>'))
      textProgressContainer = $('#gantt-chart > div svg > g').eq(9)
    }

    // bold and add date for last x label
    const lastText = xAxisLabelContainer.find('text').last()
    lastText.css('font-weight', 'bold')
    // check if no date is set for last label
    if (lastText.text().indexOf('/') === -1) {
      const lastDateText = lastText.clone()
      lastDateText.attr('y', parseFloat(lastDateText.attr('y')) + 15)
      xAxisLabelContainer.append(lastDateText)
      const lastDateTextValue = lastDateText.text()
      // check and show last timeline
      const lastTimeline = timelines[timelines.length - 1]
      const startDate = moment(lastTimeline[2])
      let increasingDate = 0
      // increaseing date until match with the last label
      while (startDate.format('ddd') !== lastDateTextValue && increasingDate < 8) {
        increasingDate += 1
        startDate.add(1, 'days')
      }
      lastDateText.html(startDate.format('MM/DD'))
      lastDateText.attr('dx', parseFloat(lastDateText.attr('dx')) - (parseFloat(lastDateText[0].getBBox().width) - parseFloat(lastText[0].getBBox().width)) / 2)
    }

    // show start/end time in progress bar
    progressContainer.find('rect').each((index, element) => {
      const selectedTimeline = timelines[index + 1]
      if (index === 0) {
        // start date
        textProgressContainer.append(parseSVG(`<text style="cursor: default; user-select: none; -webkit-font-smoothing: antialiased; font-family: Arial; font-size: 13px; font-weight: normal;" x="${$(element).attr('x')}" y="-5") - 3}">${moment(selectedTimeline[2]).format('MMM DD YYYY, hh:mm')}</text>`))
      } else if (index === timelines.length - 2) {
        // finish date
        textProgressContainer.append(parseSVG(`<text style="cursor: default; user-select: none; -webkit-font-smoothing: antialiased; font-family: Arial; font-size: 13px; font-weight: normal;" text-anchor="end" x="${parseFloat($(element).attr('x')) + parseFloat($(element).attr('width'))}" y="-5">${moment(selectedTimeline[3]).format('MMM DD YYYY, hh:mm')}</text>`))
      }
    })

    /**
     * Handle mouse over progress event
     * @param {Element} checkingProgressContainer progress container
     */
    const handleMouseoverInProgress = (checkingProgressContainer) => {
      checkingProgressContainer.mouseover(() => {
        const popupContainer = popupContainerElement()
        const textElement = popupContainer.find('text').eq(0)
        if (textElement) {
          _.forEach(timelines, (timeline, index) => {
            if (index > 0) {
              if ((textElement.text()).indexOf(timeline[0] + ':') >= 0) {
                // update grantt chart popup content
                textElement.html(`<tspan dx="0">${timeline[0]}:</tspan><tspan x="${textElement.attr('x')}" dy="18">${moment(timeline[2]).format('MMM DD YYYY, hh:mm')} - ${moment(timeline[3]).format('MMM DD YYYY, hh:mm')}</tspan>`)
              }
            }
          })
        }
      })
    }

    handleMouseoverInProgress(progressContainer)
    handleMouseoverInProgress($('#gantt-chart > div svg > g').eq(6))
    handleMouseoverInProgress($('#gantt-chart > div svg > g').eq(3))
    handleMouseoverInProgress($('#gantt-chart > div svg > g').eq(4))
    handleMouseoverInProgress($('#gantt-chart > div svg > g').eq(1))
    handleMouseoverInProgress($('#gantt-chart > div svg > g').eq(7))

    textProgressContainer.insertBefore($(`${svgContainerSelector} > g`).eq(8))
    textProgressContainer.html(textProgressContainer.html())
  }

  render () {
    const { isEdit, currentTemplate } = this.state
    const { templates, resetPhase, challenge, onUpdateOthers } = this.props
    const timelines = this.renderTimeLine()

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
            <div id='gantt-chart' className={styles.chart}>
              <Chart
                width={'100%'}
                height={`${(challenge.phases.length * GANTT_ROW_HEIGHT) + GANTT_FOOTER_HEIGHT}px`}
                chartType='Gantt'
                loader={<div>Loading Timelines</div>}
                data={timelines}
                rootProps={{ 'data-testid': '1' }}
                options={{
                  hAxis: {
                    format: 'currency'
                  }
                }}
                chartEvents={[{
                  eventName: 'ready',
                  callback: () => {
                    this.htmlHandleChart(timelines)
                  }
                }]}
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

ChallengeScheduleField.defaultProps = {
  templates: []
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
