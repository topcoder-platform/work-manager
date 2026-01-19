import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import moment from 'moment-timezone'
import cn from 'classnames'
import { PrimaryButton, OutlineButton } from '../Buttons'
import DescriptionField from './DescriptionField'
import DateInput from '../DateInput'
import Select from '../Select'
import SkillsField from '../ChallengeEditor/SkillsField'
import ConfirmationModal from '../Modal/ConfirmationModal'
import Loader from '../Loader'
import { ENGAGEMENTS_APP_URL, JOB_ROLE_OPTIONS, JOB_WORKLOAD_OPTIONS } from '../../config/constants'
import { suggestProfiles } from '../../services/user'
import styles from './EngagementEditor.module.scss'

const ANY_OPTION = { label: 'Any', value: 'Any' }
const INPUT_DATE_FORMAT = 'MM/dd/yyyy'
const INPUT_TIME_FORMAT = 'HH:mm'

const getEmptyEngagement = () => ({
  title: '',
  description: '',
  timezones: [],
  countries: [],
  skills: [],
  durationWeeks: '',
  role: null,
  workload: null,
  compensationRange: '',
  status: 'Open',
  isPrivate: false,
  requiredMemberCount: '',
  assignedMemberHandles: []
})

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

const normalizeMemberInfo = (member, index) => {
  if (!member) {
    return { id: null, handle: '-', key: `member-${index}` }
  }
  if (typeof member === 'string') {
    return { id: null, handle: member, key: member }
  }
  const handle = member.handle || member.memberHandle || member.username || member.name || member.userHandle || member.userName || '-'
  const id = member.id || member.memberId || member.userId || null
  const assignmentId = member.assignmentId || null
  return {
    id,
    handle,
    key: id || handle || `member-${index}`,
    assignmentId
  }
}

const EngagementEditor = ({
  engagement,
  projectId,
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
  onDelete,
  resolvedAssignedMembers
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
  const assignments = Array.isArray(engagement.assignments) ? engagement.assignments : []
  const assignedMembers = Array.isArray(engagement.assignedMembers) ? engagement.assignedMembers : []
  const assignedMemberHandles = Array.isArray(engagement.assignedMemberHandles) ? engagement.assignedMemberHandles : []
  const assignedMemberList = assignments.length > 0
    ? assignments.map((assignment, index) => ({
      id: assignment.memberId,
      handle: assignment.memberHandle,
      key: assignment.id || `assignment-${index}`,
      assignmentId: assignment.id
    }))
    : resolvedAssignedMembers.length
      ? resolvedAssignedMembers
      : assignedMembers.length
        ? assignedMembers.map((member, index) => normalizeMemberInfo(member, index))
        : assignedMemberHandles.map((member, index) => normalizeMemberInfo(member, index))
  const showAssignedMembers = assignedMemberList.length > 0
  const assignedMemberCount = assignedMemberList.length
  const requiredMemberCountValue = Number(engagement.requiredMemberCount)
  const assignmentFieldCount = Math.max(1, requiredMemberCountValue || 1)
  const assignmentFieldIndices = Array.from({ length: assignmentFieldCount }, (_, index) => index)
  const hasRequiredMemberCount = Number.isInteger(requiredMemberCountValue) && requiredMemberCountValue > 0
  const isFullyStaffed = hasRequiredMemberCount && assignedMemberCount >= requiredMemberCountValue
  const assignedMemberLabel = assignedMemberCount === 1 ? 'member' : 'members'
  const requiredMemberLabel = requiredMemberCountValue === 1 ? 'member' : 'members'
  let assignmentProgressText = 'No members assigned'

  if (assignedMemberCount > 0) {
    if (!hasRequiredMemberCount) {
      assignmentProgressText = `${assignedMemberCount} ${assignedMemberLabel} assigned (no limit set)`
    } else if (isFullyStaffed) {
      assignmentProgressText = `Fully staffed (${assignedMemberCount} ${assignedMemberLabel})`
    } else {
      assignmentProgressText = `${assignedMemberCount} of ${requiredMemberCountValue} ${requiredMemberLabel} assigned`
    }
  }

  const assignmentProgressClassName = cn(
    styles.assignmentProgress,
    isFullyStaffed ? styles.assignmentProgressComplete : styles.assignmentProgressPartial
  )

  const loadMemberOptions = (inputValue) => {
    if (!inputValue) {
      return Promise.resolve([])
    }
    return suggestProfiles(inputValue).then((profiles = []) => {
      return profiles
        .map((profile) => {
          const handle = typeof profile === 'string' ? profile : profile.handle
          return handle ? { label: handle, value: handle } : null
        })
        .filter(Boolean)
    })
  }

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
          {engagement.id && !isNew && (
            <OutlineButton
              text='View'
              type='info'
              url={`${ENGAGEMENTS_APP_URL}/${engagement.id}`}
              target='_blank'
              disabled={isSaving}
            />
          )}
          {engagement.id && !isNew && showAssignedMembers && canEdit && (
            <OutlineButton
              text='Pay'
              type='info'
              link={`/projects/${projectId}/engagements/${engagement.id}/pay`}
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

            <div className={cn(styles.row, styles.descriptionRow)}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='description'>Description <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                <DescriptionField
                  key={engagement.id || 'new-engagement'}
                  engagement={engagement}
                  onUpdateDescription={onUpdateDescription}
                  readOnly={!canEdit}
                  isPrivate={engagement.isPrivate}
                />
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
                    useBottomBorder
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
                    useBottomBorder
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
                <label>Time Zone <span>*</span> :</label>
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
                {submitTriggered && validationErrors.timezones && (
                  <div className={styles.error}>{validationErrors.timezones}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Country <span>*</span> :</label>
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
                {submitTriggered && validationErrors.countries && (
                  <div className={styles.error}>{validationErrors.countries}</div>
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
                    useBottomBorder
                    value={engagement.status ? {
                      label: engagement.status,
                      value: engagement.status
                    } : null}
                    options={['Open', 'Pending Assignment', 'Active', 'Cancelled', 'Closed'].map(status => ({
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

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor={canEdit ? 'requiredMemberCount' : undefined}>Required Members :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <input
                    className={styles.input}
                    id='requiredMemberCount'
                    name='requiredMemberCount'
                    type='number'
                    min='1'
                    step='1'
                    value={engagement.requiredMemberCount}
                    onChange={onUpdateInput}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {hasRequiredMemberCount ? requiredMemberCountValue : 'Not specified'}
                  </div>
                )}
                <div className={assignmentProgressClassName}>{assignmentProgressText}</div>
                {canEdit && submitTriggered && validationErrors.requiredMemberCount && (
                  <div className={styles.error}>{validationErrors.requiredMemberCount}</div>
                )}
              </div>
            </div>
            {showAssignedMembers && (
              <div className={styles.row}>
                <div className={cn(styles.field, styles.col1)}>
                  <label>Assigned Members :</label>
                </div>
                <div className={cn(styles.field, styles.col2)}>
                  <div className={styles.memberList}>
                    {assignedMemberList.map((member) => (
                      <div key={member.key} className={styles.memberRow}>
                        <div className={styles.memberHandle}>
                          {member.handle || member.memberHandle || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {canEdit && (
              <div className={styles.row}>
                <div className={cn(styles.field, styles.col1)}>
                  <label htmlFor='isPrivate'>Private Engagement :</label>
                </div>
                <div className={cn(styles.field, styles.col2)}>
                  <input
                    id='isPrivate'
                    name='isPrivate'
                    type='checkbox'
                    checked={Boolean(engagement.isPrivate)}
                    onChange={(event) => onUpdateInput({
                      target: {
                        name: 'isPrivate',
                        value: event.target.checked
                      }
                    })}
                  />
                </div>
              </div>
            )}

            {canEdit && engagement.isPrivate && assignmentFieldIndices.map((index) => {
              const assignmentLabel = assignmentFieldCount > 1
                ? `Assign to Member ${index + 1}`
                : 'Assign to Member'
              const selectedHandle = assignedMemberHandles[index]
              const fieldError = validationErrors[`assignedMemberHandle${index}`]
              const nextAssignedMemberHandles = Array.from(
                { length: assignmentFieldCount },
                (_, handleIndex) => assignedMemberHandles[handleIndex] || ''
              )
              return (
                <div key={`assign-member-${index}`} className={styles.row}>
                  <div className={cn(styles.field, styles.col1)}>
                    <label>{assignmentLabel} <span>*</span> :</label>
                  </div>
                  <div className={cn(styles.field, styles.col2)}>
                    <Select
                      className={styles.selectInput}
                      useBottomBorder
                      isAsync
                      loadOptions={loadMemberOptions}
                      placeholder='Type to search for a member...'
                      value={selectedHandle
                        ? {
                          label: selectedHandle,
                          value: selectedHandle
                        }
                        : null}
                      onChange={(option) => {
                        const updatedHandles = [...nextAssignedMemberHandles]
                        updatedHandles[index] = option ? option.value : ''
                        onUpdateInput({
                          target: {
                            name: 'assignedMemberHandles',
                            value: updatedHandles
                          }
                        })
                      }}
                      isClearable
                    />
                    {submitTriggered && fieldError && (
                      <div className={styles.error}>{fieldError}</div>
                    )}
                  </div>
                </div>
              )
            })}
            {canEdit && engagement.isPrivate && submitTriggered && validationErrors.assignedMemberHandles && (
              <div className={styles.row}>
                <div className={cn(styles.field, styles.col1)} />
                <div className={cn(styles.field, styles.col2)}>
                  <div className={styles.error}>{validationErrors.assignedMemberHandles}</div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

EngagementEditor.defaultProps = {
  engagement: getEmptyEngagement(),
  projectId: null,
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
  onDelete: () => {},
  resolvedAssignedMembers: []
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
    isPrivate: PropTypes.bool,
    requiredMemberCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    assignments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      engagementId: PropTypes.string,
      memberId: PropTypes.string,
      memberHandle: PropTypes.string,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string
    })),
    assignedMembers: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        memberId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        handle: PropTypes.string,
        memberHandle: PropTypes.string,
        username: PropTypes.string,
        name: PropTypes.string,
        userHandle: PropTypes.string,
        userName: PropTypes.string
      })
    ])),
    assignedMemberHandles: PropTypes.arrayOf(PropTypes.string),
    timezones: PropTypes.arrayOf(PropTypes.string),
    countries: PropTypes.arrayOf(PropTypes.string),
    skills: PropTypes.arrayOf(PropTypes.shape()),
    applicationDeadline: PropTypes.any,
    status: PropTypes.string
  }),
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
    timezones: PropTypes.string,
    countries: PropTypes.string,
    assignedMemberHandles: PropTypes.string,
    requiredMemberCount: PropTypes.string,
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
  onDelete: PropTypes.func,
  resolvedAssignedMembers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    memberId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string,
    memberHandle: PropTypes.string,
    username: PropTypes.string,
    name: PropTypes.string,
    userHandle: PropTypes.string,
    userName: PropTypes.string,
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }))
}

export default EngagementEditor
