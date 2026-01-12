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
  onSaveDraft,
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
            <OutlineButton
              text='Save Draft'
              type='info'
              onClick={onSaveDraft}
              disabled={isSaving}
            />
          )}
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
                    placeholder='Engagement title'
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
                <label>Duration <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                <div className={styles.inlineFields}>
                  <div className={styles.inlineField}>
                    <span>Start Date</span>
                    {canEdit ? (
                      <DateInput
                        className={styles.selectInput}
                        value={engagement.startDate}
                        dateFormat={INPUT_DATE_FORMAT}
                        timeFormat={false}
                        onChange={value => onUpdateDate('startDate', value)}
                      />
                    ) : (
                      <div className={styles.readOnlyValue}>
                        {engagement.startDate ? moment(engagement.startDate).format('MMM DD, YYYY') : '-'}
                      </div>
                    )}
                  </div>
                  <div className={styles.inlineField}>
                    <span>End Date</span>
                    {canEdit ? (
                      <DateInput
                        className={styles.selectInput}
                        value={engagement.endDate}
                        dateFormat={INPUT_DATE_FORMAT}
                        timeFormat={false}
                        onChange={value => onUpdateDate('endDate', value)}
                      />
                    ) : (
                      <div className={styles.readOnlyValue}>
                        {engagement.endDate ? moment(engagement.endDate).format('MMM DD, YYYY') : '-'}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.durationDivider}>or</div>
                <div className={styles.inlineFields}>
                  <div className={styles.inlineField}>
                    <span>Duration</span>
                    {canEdit ? (
                      <input
                        className={styles.input}
                        type='number'
                        min='1'
                        name='durationAmount'
                        value={engagement.durationAmount}
                        onChange={onUpdateInput}
                        placeholder='Enter duration'
                      />
                    ) : (
                      <div className={styles.readOnlyValue}>{engagement.durationAmount || '-'}</div>
                    )}
                  </div>
                  <div className={styles.inlineField}>
                    <span>Unit</span>
                    {canEdit ? (
                      <Select
                        className={styles.selectInput}
                        value={engagement.durationUnit ? {
                          label: engagement.durationUnit,
                          value: engagement.durationUnit
                        } : null}
                        options={['weeks', 'months'].map(unit => ({ label: unit, value: unit }))}
                        onChange={(option) => onUpdateInput({
                          target: {
                            name: 'durationUnit',
                            value: option ? option.value : ''
                          }
                        })}
                        isClearable={false}
                      />
                    ) : (
                      <div className={styles.readOnlyValue}>{engagement.durationUnit || '-'}</div>
                    )}
                  </div>
                </div>
                {submitTriggered && validationErrors.duration && (
                  <div className={styles.error}>{validationErrors.duration}</div>
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
    durationAmount: '',
    durationUnit: 'weeks',
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
  onSaveDraft: () => {},
  onSavePublish: () => {},
  onCancel: () => {},
  onDelete: () => {}
}

EngagementEditor.propTypes = {
  engagement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    startDate: PropTypes.any,
    endDate: PropTypes.any,
    durationAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    durationUnit: PropTypes.string,
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
    duration: PropTypes.string,
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
  onSaveDraft: PropTypes.func,
  onSavePublish: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func
}

export default EngagementEditor
