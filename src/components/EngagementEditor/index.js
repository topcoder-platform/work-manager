import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import moment from 'moment-timezone'
import cn from 'classnames'
import { PrimaryButton, OutlineButton } from '../Buttons'
import TuiEditor from '../TuiEditor'
import DateInput from '../DateInput'
import Select from '../Select'
import SkillsField from '../ChallengeEditor/SkillsField'
import ConfirmationModal from '../Modal/ConfirmationModal'
import Loader from '../Loader'
import { JOB_ROLE_OPTIONS, JOB_WORKLOAD_OPTIONS } from '../../config/constants'
import styles from './EngagementEditor.module.scss'

const ANY_OPTION = { label: 'Any', value: 'Any' }
const INPUT_DATE_FORMAT = 'MM/dd/yyyy'
const INPUT_TIME_FORMAT = 'HH:mm'

const normalizeAnySelection = (selectedOptions) => {
  if (!selectedOptions || !selectedOptions.length) {
    return []
  }
  const hasAny = selectedOptions.some(option => option.value === ANY_OPTION.value)
  if (hasAny) {
    return [ANY_OPTION]
  }
  return selectedOptions
}

const EngagementEditor = ({
  engagement,
  isNew,
  isLoading,
  isSaving,
  canEdit,
  submitTriggered,
  validationErrors,
  showDeleteModal,
  onToggleDelete,
  onUpdateInput,
  onUpdateDescription,
  onUpdateSkills,
  onUpdateDate,
  onSavePublish,
  onCancel,
  onDelete
}) => {
  const timeZoneOptions = useMemo(() => {
    const zones = moment.tz.names().map(zone => ({
      label: zone,
      value: zone
    }))
    return [ANY_OPTION, ...zones]
  }, [])

  const countryOptions = useMemo(() => {
    const displayNames = typeof Intl !== 'undefined' && Intl.DisplayNames
      ? new Intl.DisplayNames(['en'], { type: 'region' })
      : null
    const countries = moment.tz.countries().map(code => ({
      label: displayNames ? displayNames.of(code) : code,
      value: code
    }))
    countries.sort((a, b) => a.label.localeCompare(b.label))
    return [ANY_OPTION, ...countries]
  }, [])

  const countryOptionsByValue = useMemo(() => {
    return countryOptions.reduce((acc, option) => {
      acc[option.value] = option
      return acc
    }, {})
  }, [countryOptions])

  const selectedTimeZones = (engagement.timezones || []).map(zone => ({
    label: zone,
    value: zone
  }))

  const selectedCountries = (engagement.countries || []).map(code => {
    return countryOptionsByValue[code] || { label: code, value: code }
  })

  const selectedRoleOption = useMemo(() => {
    if (!engagement.role) {
      return null
    }
    return JOB_ROLE_OPTIONS.find(option => option.value === engagement.role || option.label === engagement.role) || null
  }, [engagement.role])

  const selectedWorkloadOption = useMemo(() => {
    if (!engagement.workload) {
      return null
    }
    return JOB_WORKLOAD_OPTIONS.find(option => option.value === engagement.workload || option.label === engagement.workload) || null
  }, [engagement.workload])

  const roleLabel = selectedRoleOption ? selectedRoleOption.label : engagement.role
  const workloadLabel = selectedWorkloadOption ? selectedWorkloadOption.label : engagement.workload

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className={styles.wrapper}>
      <Helmet title={isNew ? 'Create Engagement' : 'Edit Engagement'} />
      {showDeleteModal && (
        <ConfirmationModal
          title='Confirm Delete'
          message={`Do you want to delete "${engagement.title || 'this engagement'}"?`}
          isProcessing={isSaving}
          onCancel={onToggleDelete}
          onConfirm={onDelete}
        />
      )}
      <div className={styles.topContainer}>
        <div className={styles.leftContainer}>
          <div className={styles.title}>
            {isNew ? 'New Engagement' : (engagement.title || 'Engagement')}
          </div>
        </div>
        <div className={styles.actions}>
          {engagement.id && canEdit && (
            <OutlineButton
              text='Delete'
              type='danger'
              onClick={onToggleDelete}
              disabled={isSaving}
            />
          )}
          <OutlineButton
            text='Cancel'
            type='info'
            onClick={onCancel}
            disabled={isSaving}
          />
          {canEdit && (
            <PrimaryButton
              text='Publish'
              type='info'
              onClick={onSavePublish}
              disabled={isSaving}
            />
          )}
        </div>
      </div>
      <div className={styles.textRequired}>* Required</div>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <form>
            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='title'>Title <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <input
                    className={styles.input}
                    id='title'
                    name='title'
                    type='text'
                    value={engagement.title}
                    onChange={onUpdateInput}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>{engagement.title || '-'}</div>
                )}
                {submitTriggered && validationErrors.title && (
                  <div className={styles.error}>{validationErrors.title}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='description'>Description <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <TuiEditor
                    key={engagement.id || 'new-engagement'}
                    className={styles.editor}
                    initialValue={engagement.description || ''}
                    onChange={onUpdateDescription}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>{engagement.description || '-'}</div>
                )}
                {submitTriggered && validationErrors.description && (
                  <div className={styles.error}>{validationErrors.description}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='durationWeeks'>Duration (Weeks) <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <input
                    className={styles.input}
                    id='durationWeeks'
                    name='durationWeeks'
                    type='number'
                    min='4'
                    step='1'
                    value={engagement.durationWeeks}
                    onChange={onUpdateInput}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {engagement.durationWeeks ? `${engagement.durationWeeks} weeks` : '-'}
                  </div>
                )}
                {submitTriggered && validationErrors.durationWeeks && (
                  <div className={styles.error}>{validationErrors.durationWeeks}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='role'>Role :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    className={styles.selectInput}
                    options={JOB_ROLE_OPTIONS}
                    value={selectedRoleOption}
                    onChange={(option) => onUpdateInput({
                      target: {
                        name: 'role',
                        value: option && option.value ? option.label : null
                      }
                    })}
                    isClearable
                  />
                ) : (
                  <div className={styles.readOnlyValue}>{roleLabel || 'Not specified'}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='workload'>Workload :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    className={styles.selectInput}
                    options={JOB_WORKLOAD_OPTIONS}
                    value={selectedWorkloadOption}
                    onChange={(option) => onUpdateInput({
                      target: {
                        name: 'workload',
                        value: option && option.value ? option.label : null
                      }
                    })}
                    isClearable
                  />
                ) : (
                  <div className={styles.readOnlyValue}>{workloadLabel || 'Not specified'}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='compensationRange'>Compensation Range :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <input
                    className={styles.input}
                    id='compensationRange'
                    name='compensationRange'
                    type='text'
                    placeholder='e.g., $600-$700 USD'
                    value={engagement.compensationRange}
                    onChange={onUpdateInput}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {engagement.compensationRange || 'Not specified'}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Time Zone :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    isMulti
                    options={timeZoneOptions}
                    value={selectedTimeZones}
                    onChange={(values) => {
                      const normalized = normalizeAnySelection(values)
                      onUpdateInput({
                        target: {
                          name: 'timezones',
                          value: normalized.map(option => option.value)
                        }
                      })
                    }}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {(engagement.timezones || []).length ? engagement.timezones.join(', ') : 'Any'}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Country :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    isMulti
                    options={countryOptions}
                    value={selectedCountries}
                    onChange={(values) => {
                      const normalized = normalizeAnySelection(values)
                      onUpdateInput({
                        target: {
                          name: 'countries',
                          value: normalized.map(option => option.value)
                        }
                      })
                    }}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {(engagement.countries || []).length
                      ? engagement.countries
                        .map(code => (countryOptionsByValue[code] ? countryOptionsByValue[code].label : code))
                        .join(', ')
                      : 'Any'}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Required Skills <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                <SkillsField
                  embedded
                  readOnly={!canEdit}
                  challenge={{
                    ...engagement,
                    submitTriggered
                  }}
                  onUpdateSkills={onUpdateSkills}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Application Deadline <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <DateInput
                    className={styles.selectInput}
                    value={engagement.applicationDeadline}
                    dateFormat={INPUT_DATE_FORMAT}
                    timeFormat={INPUT_TIME_FORMAT}
                    onChange={value => onUpdateDate('applicationDeadline', value)}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {engagement.applicationDeadline
                      ? moment(engagement.applicationDeadline).format('MMM DD, YYYY HH:mm')
                      : '-'}
                  </div>
                )}
                {submitTriggered && validationErrors.applicationDeadline && (
                  <div className={styles.error}>{validationErrors.applicationDeadline}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Status <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    className={styles.selectInput}
                    value={engagement.status ? {
                      label: engagement.status,
                      value: engagement.status
                    } : null}
                    options={['Open', 'Pending Assignment', 'Closed'].map(status => ({
                      label: status,
                      value: status
                    }))}
                    onChange={(option) => onUpdateInput({
                      target: {
                        name: 'status',
                        value: option ? option.value : ''
                      }
                    })}
                    isClearable={false}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>{engagement.status || '-'}</div>
                )}
                {submitTriggered && validationErrors.status && (
                  <div className={styles.error}>{validationErrors.status}</div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

EngagementEditor.defaultProps = {
  engagement: {
    title: '',
    description: '',
    timezones: [],
    countries: [],
    skills: [],
    durationWeeks: '',
    role: null,
    workload: null,
    compensationRange: '',
    status: 'Open'
  },
  isNew: true,
  isLoading: false,
  isSaving: false,
  canEdit: true,
  submitTriggered: false,
  validationErrors: {},
  showDeleteModal: false,
  onToggleDelete: () => {},
  onUpdateInput: () => {},
  onUpdateDescription: () => {},
  onUpdateSkills: () => {},
  onUpdateDate: () => {},
  onSavePublish: () => {},
  onCancel: () => {},
  onDelete: () => {}
}

EngagementEditor.propTypes = {
  engagement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    durationWeeks: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    role: PropTypes.string,
    workload: PropTypes.string,
    compensationRange: PropTypes.string,
    timezones: PropTypes.arrayOf(PropTypes.string),
    countries: PropTypes.arrayOf(PropTypes.string),
    skills: PropTypes.arrayOf(PropTypes.shape()),
    applicationDeadline: PropTypes.any,
    status: PropTypes.string
  }),
  isNew: PropTypes.bool,
  isLoading: PropTypes.bool,
  isSaving: PropTypes.bool,
  canEdit: PropTypes.bool,
  submitTriggered: PropTypes.bool,
  validationErrors: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    durationWeeks: PropTypes.string,
    applicationDeadline: PropTypes.string,
    skills: PropTypes.string,
    status: PropTypes.string
  }),
  showDeleteModal: PropTypes.bool,
  onToggleDelete: PropTypes.func,
  onUpdateInput: PropTypes.func,
  onUpdateDescription: PropTypes.func,
  onUpdateSkills: PropTypes.func,
  onUpdateDate: PropTypes.func,
  onSavePublish: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func
}

export default EngagementEditor
