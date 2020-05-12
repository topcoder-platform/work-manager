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
import { parseSVG } from '../../../util/svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faTrash } from '@fortawesome/free-solid-svg-icons'
import PrimaryButton from '../../Buttons/PrimaryButton'

const GANTT_ROW_HEIGHT = 45
const GANTT_FOOTER_HEIGHT = 40

class ChallengeScheduleField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEdit: false
    }
    this.toggleEditMode = this.toggleEditMode.bind(this)
    this.renderTimeLine = this.renderTimeLine.bind(this)
    this.getChallengePhase = this.getChallengePhase.bind(this)
    this.getAllPhases = this.getAllPhases.bind(this)
    this.renderTimelineAgain = this.renderTimelineAgain.bind(this)
  }

  toggleEditMode () {
    const { isEdit } = this.state
    this.setState({ isEdit: !isEdit })
  }

  getChallengePhase (phase) {
    const { challengePhases } = this.props
    if (!phase) {
      return phase
    }
    let challengePhase = challengePhases.find(challengePhase => challengePhase.id === phase.phaseId)
    if (challengePhase) {
      challengePhase = _.cloneDeep(challengePhase)
    }
    if (challengePhase) challengePhase.duration = phase.duration
    return phase
  }

  getAllPhases () {
    const { challenge, challengePhasesWithCorrectTimeline } = this.props
    if (challengePhasesWithCorrectTimeline && challengePhasesWithCorrectTimeline.length) {
      return challengePhasesWithCorrectTimeline
    }
    return challenge.phases
  }

  renderTimeLine () {
    const allPhases = this.getAllPhases()
    if (_.isEmpty(allPhases) || typeof allPhases[0] === 'undefined') {
      return null
    }

    let timelines = []
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

    var hourToMilisecond = 60 * 60 * 1000 // = 1 hour
    _.map(allPhases, (p, index) => {
      const phase = this.getChallengePhase(p)
      if (phase && timelines) {
        var startDate
        if (p.scheduledStartDate) {
          startDate = moment(p.scheduledStartDate).toDate()
        } else {
          timelines = null
          return
        }
        var endDate
        if (p.scheduledEndDate) {
          endDate = moment(p.scheduledEndDate).toDate()
        } else {
          timelines = null
          return
        }
        var currentTime = moment().valueOf()
        var percentage = 0
        if (startDate.getTime() > currentTime) {
          percentage = 0
        } else if (endDate.getTime() > currentTime) {
          percentage = Math.round(((currentTime - startDate.getTime()) / (hourToMilisecond * p.duration)) * 100)
        } else {
          percentage = Math.round(((endDate.getTime() - startDate.getTime()) / (hourToMilisecond * p.duration)) * 100)
        }
        const predecessorPhase = phase.predecessor ? this.getChallengePhase(allPhases.filter(ph => ph.phaseId === phase.predecessor)[0]) : null
        timelines.push(
          [
            phase.name || '',
            phase.name || '',
            startDate,
            endDate,
            null,
            percentage,
            predecessorPhase
              ? predecessorPhase.name
              : null
          ]
        )
      }
    })
    return timelines
  }

  renderPhaseEditor () {
    const { onUpdateSelect, onUpdatePhase, removePhase, challenge } = this.props
    return (
      _.map(challenge.phases, (p, index) => (
        <div className={styles.PhaseRow} key={index}>
          <PhaseInput
            phase={this.getChallengePhase(p)}
            withDuration
            onUpdateSelect={onUpdateSelect}
            onUpdatePhase={newValue => onUpdatePhase(parseInt(newValue), 'duration', index)}
            endDate={moment(p.scheduledEndDate)}
          />
          {index !== 0 &&
          <div className={styles.icon} onClick={() => removePhase(index)}>
            <FontAwesomeIcon icon={faTrash} />
          </div>
          }
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

    let finishDate = 0
    let startDate = -1
    _.forEach(timelines, (t, i) => {
      if (i === 0) {
        return
      }
      const dateTmp = moment(t[3])
      const startDateTmp = moment(t[2])
      if (dateTmp > finishDate) {
        finishDate = dateTmp
      }
      if (startDateTmp < startDate || startDate === -1) {
        startDate = startDateTmp
      }
    })

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
      let increasingDate = 0
      // increaseing date until match with the last label
      while (finishDate.format('ddd') !== lastDateTextValue && increasingDate < 8) {
        increasingDate += 1
        finishDate.add(1, 'days')
      }
      lastDateText.html(finishDate.format('MM/DD'))
      lastDateText.attr('dx', parseFloat(lastDateText.attr('dx')) - (parseFloat(lastDateText[0].getBBox().width) - parseFloat(lastText[0].getBBox().width)) / 2)
    }

    // show start/end time in progress bar
    let minX = -1
    let maxX = -1
    progressContainer.find('rect').each((index, element) => {
      const tmpX = parseFloat($(element).attr('x'))
      const endTmpX = parseFloat($(element).attr('x')) + parseFloat($(element).attr('width'))
      if (minX < 0 || tmpX < minX) {
        minX = tmpX
      }
      if (maxX < 0 || endTmpX > maxX) {
        maxX = endTmpX
      }
    })

    // start date
    textProgressContainer.append(parseSVG(`<text style="cursor: default; user-select: none; -webkit-font-smoothing: antialiased; font-family: Arial; font-size: 13px; font-weight: normal;" x="${minX}" y="-5") - 3}">${startDate.format('MMM DD YYYY, HH:mm')}</text>`))

    // finish date
    textProgressContainer.append(parseSVG(`<text style="cursor: default; user-select: none; -webkit-font-smoothing: antialiased; font-family: Arial; font-size: 13px; font-weight: normal;" text-anchor="end" x="${maxX}" y="-5">${finishDate.format('MMM DD YYYY, HH:mm')}</text>`))

    /**
     * Handle mouse over progress event
     * @param {Element} checkingProgressContainer progress container
     */
    const handleMouseoverInProgress = (checkingProgressContainer) => {
      checkingProgressContainer.mouseover(() => {
        const popupContainer = popupContainerElement()
        const textElement = popupContainer.find('text').eq(0)
        const bgElement = popupContainer.find('rect').eq(0)
        if (textElement) {
          _.forEach(timelines, (timeline, index) => {
            if (index > 0) {
              if ((textElement.text()).indexOf(timeline[0] + ':') >= 0) {
                // update grantt chart popup content
                textElement.html(`<tspan dx="0">${timeline[0]}:</tspan><tspan x="${textElement.attr('x')}" dy="18">${moment(timeline[2]).format('MMM DD YYYY, HH:mm')} - ${moment(timeline[3]).format('MMM DD YYYY, HH:mm')}</tspan>`)
                bgElement.attr('width', '310')
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

  renderTimelineAgain () {
    const { isEdit } = this.state
    if (!isEdit) {
      this.setState({ isEdit: true }, () => {
        this.setState({ isEdit: false })
      })
    }
  }

  render () {
    const { isEdit } = this.state
    const { currentTemplate } = this.props
    const { templates, resetPhase, challenge, onUpdateOthers } = this.props
    const timelines = !isEdit ? this.renderTimeLine() : null
    const chartHeight = `${(this.getAllPhases().length * GANTT_ROW_HEIGHT) + GANTT_FOOTER_HEIGHT}px`
    if (chartHeight !== this.lastChartHeight) {
      this.renderTimelineAgain()
    }
    this.lastChartHeight = chartHeight
    return (
      <div className={styles.container}>
        <div className={cn(styles.row, styles.flexStart)}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor={'notitle'}>Timeline template <span className={styles.red}>*</span> :</label>
          </div>
          <div className={cn(styles.field, styles.col2)}>
            <div className={styles.templates}>
              <Select
                name='template'
                options={templates}
                placeholder='Select'
                labelKey='name'
                valueKey='name'
                clearable={false}
                value={currentTemplate}
                onChange={(e) => resetPhase(e)}
              />
            </div>
          </div>
        </div>
        { challenge.submitTriggered && _.isEmpty(currentTemplate) && <div className={styles.row}>
          <div className={cn(styles.field, styles.col1, styles.error)}>
            Select a Timeline template
          </div>
        </div> }
        <div className={styles.PhaseRow}>
          <PhaseInput
            withDates
            phase={{
              name: 'Start Date',
              date: challenge.startDate
            }}
            onUpdatePhase={newValue => onUpdateOthers({
              field: 'startDate',
              value: newValue.format()
            })}
          />
        </div>
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
          timelines && (
            <div id='gantt-chart' className={styles.chart}>
              <Chart
                width={'100%'}
                height={chartHeight}
                chartType='Gantt'
                loader={<div>Loading Timelines</div>}
                data={timelines}
                rootProps={{ 'data-testid': '1' }}
                getChartWrapper={chartWrapper => {
                  // get a reference to the chartWrapper
                  this.chartWrapper = chartWrapper
                }}
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
        {currentTemplate && isEdit && (<div className={styles.row}>
          <div className={styles.button}>
            <PrimaryButton
              text={'Reset Phases'}
              type={'info'}
              onClick={() => resetPhase(currentTemplate)} />
          </div>
        </div>)}
        {
          isEdit && this.renderPhaseEditor()
        }
      </div>
    )
  }
}

ChallengeScheduleField.defaultProps = {
  templates: [],
  currentTemplate: null,
  challengePhasesWithCorrectTimeline: []
}

ChallengeScheduleField.propTypes = {
  templates: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challengePhases: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challengePhasesWithCorrectTimeline: PropTypes.arrayOf(PropTypes.shape()),
  challenge: PropTypes.shape().isRequired,
  removePhase: PropTypes.func.isRequired,
  resetPhase: PropTypes.func.isRequired,
  onUpdateSelect: PropTypes.func.isRequired,
  onUpdatePhase: PropTypes.func.isRequired,
  onUpdateOthers: PropTypes.func.isRequired,
  currentTemplate: PropTypes.shape()
}

export default ChallengeScheduleField
