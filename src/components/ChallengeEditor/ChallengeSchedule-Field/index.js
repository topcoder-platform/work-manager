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
import { faTrash } from '@fortawesome/free-solid-svg-icons'
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
    this.prepareTimeline = this.prepareTimeline.bind(this)
    this.getPhaseTemplate = this.getPhaseTemplate.bind(this)
    this.getPhaseFromTimelineTemplate = this.getPhaseFromTimelineTemplate.bind(this)
    this.recalculatePhaseDates = this.recalculatePhaseDates.bind(this)
    this.getAllPhases = this.getAllPhases.bind(this)
  }

  toggleEditMode () {
    const { isEdit } = this.state
    this.setState({ isEdit: !isEdit })
  }

  /**
   * Finds the phase template from the timeline template. Timeline template contains default duration
   * and predecessor information.
   *
   * @param {Object} phase phase for which template is to be found
   */
  getPhaseFromTimelineTemplate (phase) {
    const { currentTemplate } = this.props
    if (currentTemplate && currentTemplate.phases) {
      let templatePhase = currentTemplate.phases.find(tp => tp.phaseId === phase.phaseId)
      if (templatePhase) {
        templatePhase = _.cloneDeep(templatePhase)
      }
      return templatePhase
    }
    return phase
  }

  /**
   * Finds the phase definition/template from phase templates. Phase templates contains name and description
   *
   * @param {Object} phase phase for which definition/template is to be found
   */
  getPhaseTemplate (phase) {
    const { challengePhases } = this.props
    if (!phase) {
      return phase
    }
    let challengePhase = challengePhases.find(cp => cp.id === phase.phaseId)
    if (challengePhase) {
      challengePhase = _.cloneDeep(challengePhase)
    }
    if (challengePhase) challengePhase.duration = phase.duration
    return phase
  }

  getAllPhases () {
    const { challenge } = this.props
    return challenge.phases
  }

  /**
   * Helper method to recalculate the phase dates. It is used just for rendering the timeline.
   * Actual population of dates is done in api at
   * https://github.com/topcoder-platform/challenge-api/blob/0253c238d67fddadfa2d6c0fb882568b97ce8a20/src/services/ChallengeService.js#L402
   *
   * @param {Object} phase phase for which dates are to be calculated
   * @param {Array} phases all phases
   * @param {Date} startDate start date of the first phase, usually it is challenge's start date
   */
  recalculatePhaseDates (phase, phases, startDate) {
    const templatePhase = this.getPhaseFromTimelineTemplate(phase)
    if (!templatePhase) {
      console.warn(`Possible template mismatch. Phase not found in the timeline template of the challenge.`)
    }
    if (templatePhase && templatePhase.predecessor) {
      const prePhase = _.find(phases, (p) => p.phaseId === templatePhase.predecessor)
      // `Predecessor ${templatePhase.predecessor} not found from given phases.`
      phase.predecessor = prePhase.id
    }
    if (!phase.predecessor) {
      phase.scheduledStartDate = startDate
      phase.scheduledEndDate = moment(startDate).add(phase.duration || 0, 'hours').toDate()
      phase.actualStartDate = phase.scheduledStartDate
      phase.actualEndDate = phase.scheduledEndDate
    } else {
      const preIndex = _.findIndex(phases, (p) => p.id === phase.predecessor)
      // `Invalid phase predecessor: ${phase.predecessor}`
      phase.scheduledStartDate = phases[preIndex].scheduledEndDate
      phase.scheduledEndDate = moment(phase.scheduledStartDate).add(phase.duration || 0, 'hours').toDate()
      phase.actualStartDate = phase.scheduledStartDate
      phase.actualEndDate = phase.scheduledEndDate
    }
  }

  prepareTimeline () {
    const { challenge } = this.props
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
    let cStartDate = challenge.startDate
    _.map(allPhases, (p, index) => {
      const phase = this.getPhaseTemplate(p)
      // recalculate the phase dates, assuming duration is edited by user
      this.recalculatePhaseDates(phase, allPhases, cStartDate)
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
        const predecessorPhase = phase.predecessor ? this.getPhaseTemplate(allPhases.filter(ph => ph.phaseId === phase.predecessor)[0]) : null
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
    const { onUpdateSelect, onUpdatePhase, removePhase, challenge, readOnly } = this.props
    return (
      _.map(challenge.phases, (p, index) => (
        <div className={styles.PhaseRow} key={index}>
          <PhaseInput
            phase={this.getPhaseTemplate(p)}
            withDuration
            onUpdateSelect={onUpdateSelect}
            onUpdatePhase={newValue => onUpdatePhase(parseInt(newValue), 'duration', index)}
            endDate={moment(p.scheduledEndDate)}
            readOnly={readOnly}
          />
          {index !== 0 && !readOnly &&
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

  render () {
    const { isEdit } = this.state
    const { currentTemplate, readOnly, templates } = this.props
    const { savePhases, resetPhase, challenge, onUpdateOthers } = this.props
    const timelines = !isEdit ? this.prepareTimeline() : null
    const chartHeight = `${(this.getAllPhases().length * GANTT_ROW_HEIGHT) + GANTT_FOOTER_HEIGHT}px`
    return (
      <div className={styles.container}>
        <div className={cn(styles.row, styles.flexStart)}>
          <div className={cn(styles.field, styles.col1)}>
            <label htmlFor={'notitle'}>Timeline template {!readOnly && (<span className={styles.red}>*</span>)} :</label>
          </div>
          <div className={cn(styles.field, styles.col2)}>
            <div className={styles.templates}>
              {readOnly ? (
                <span>{currentTemplate ? currentTemplate.name : ''}</span>
              ) : (
                <Select
                  name='template'
                  options={templates.map(template => ({ label: template.name, value: template.name, name: template.name }))}
                  placeholder='Select'
                  isClearable={false}
                  value={currentTemplate && { label: currentTemplate.name, value: currentTemplate.name }}
                  onChange={(e) => resetPhase(e)}
                />
              )}
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
            readOnly={readOnly}
          />
        </div>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1, styles.title)}>
            <label htmlFor={`challengeSchedule`}>Challenge Schedule :</label>
            <div className={styles.timezone}>
              <span>Timezone: {jstz.determine().name()}</span>
            </div>
          </div>
          { !readOnly &&
            (<div className={cn(styles.field, styles.col2)}>
              <div className={cn(styles.button, { [styles.active]: isEdit })}>
                <PrimaryButton
                  text={isEdit ? 'Back to Gantt' : 'Edit Phases'}
                  type={'info'}
                  onClick={this.toggleEditMode} />
              </div>
            </div>
            )
          }
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
        {currentTemplate && isEdit && !readOnly && (<div className={styles.row}>
          <div className={cn(styles.actionButtons)}>
            <PrimaryButton
              text={'Save Phases'}
              type={'info'}
              onClick={() => savePhases()} />
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
  removePhase: () => {},
  resetPhase: () => {},
  savePhases: () => {},
  onUpdateSelect: () => {},
  onUpdatePhase: () => {},
  onUpdateOthers: () => {},
  readOnly: false
}

ChallengeScheduleField.propTypes = {
  templates: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challengePhases: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  removePhase: PropTypes.func,
  resetPhase: PropTypes.func,
  savePhases: PropTypes.func,
  onUpdateSelect: PropTypes.func,
  onUpdatePhase: PropTypes.func,
  onUpdateOthers: PropTypes.func.isRequired,
  currentTemplate: PropTypes.shape(),
  readOnly: PropTypes.bool
}

export default ChallengeScheduleField
