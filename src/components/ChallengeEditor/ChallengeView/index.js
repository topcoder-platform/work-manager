import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { withRouter } from 'react-router-dom'
import styles from './ChallengeView.module.scss'
import xss from 'xss'
import { PrimaryButton } from '../../Buttons'
import Track from '../../Track'
import NDAField from '../NDAField'
import UseSchedulingAPIField from '../UseSchedulingAPIField'
import PureV5Field from '../PureV5Field'
import CopilotField from '../Copilot-Field'
import ChallengeScheduleField from '../ChallengeSchedule-Field'
import TextEditorField from '../TextEditor-Field'
import AttachmentField from '../Attachment-Field'
import ChallengePrizesField from '../ChallengePrizes-Field'
import CheckpointPrizesField from '../CheckpointPrizes-Field'
import CopilotFeeField from '../CopilotFee-Field'
import ChallengeTotalField from '../ChallengeTotal-Field'
import Loader from '../../Loader'
import PhaseInput from '../../PhaseInput'
import LegacyLinks from '../../LegacyLinks'
import AssignedMemberField from '../AssignedMember-Field'
import { getResourceRoleByName } from '../../../util/tc'
import { isBetaMode } from '../../../util/cookie'
import { loadGroupDetails } from '../../../actions/challenges'
import Tooltip from '../../Tooltip'
import { MESSAGE, REVIEW_TYPES, DES_TRACK_ID } from '../../../config/constants'

const ChallengeView = ({
  projectDetail,
  challenge,
  attachments,
  isBillingAccountExpired,
  metadata,
  challengeResources,
  token,
  isLoading,
  challengeId,
  assignedMemberDetails,
  enableEdit,
  onLaunchChallenge,
  onCloseTask
}) => {
  const selectedType = _.find(metadata.challengeTypes, { id: challenge.typeId })
  const challengeTrack = _.find(metadata.challengeTracks, { id: challenge.trackId })

  const [openAdvanceSettings, setOpenAdvanceSettings] = useState(false)
  const [groups, setGroups] = useState('')

  useEffect(() => {
    if (challenge.groups && challenge.groups.length > 0) {
      loadGroupDetails(challenge.groups).then(res => {
        const groups = _.map(res, 'name').join(', ')
        setGroups(groups)
      })
    } else {
      setGroups('')
    }
  }, [challenge.groups])

  const getResourceFromProps = (name) => {
    const { resourceRoles } = metadata
    const role = getResourceRoleByName(resourceRoles, name)
    return challengeResources && role && challengeResources.find(resource => resource.roleId === role.id)
  }

  const copilotResource = getResourceFromProps('Copilot')
  const copilotFromResources = copilotResource ? copilotResource.memberHandle : ''
  const reviewerResource = getResourceFromProps('Reviewer')
  const reviewerFromResources = reviewerResource ? reviewerResource.memberHandle : ''
  let copilot, reviewer
  if (challenge) {
    copilot = challenge.copilot
    reviewer = challenge.reviewer
  }
  copilot = copilot || copilotFromResources
  reviewer = reviewer || reviewerFromResources

  const reviewType = challenge.reviewType ? challenge.reviewType.toUpperCase() : REVIEW_TYPES.COMMUNITY
  const isCommunity = reviewType === REVIEW_TYPES.COMMUNITY
  const isInternal = reviewType === REVIEW_TYPES.INTERNAL
  const timeLineTemplate = _.find(metadata.timelineTemplates, { id: challenge.timelineTemplateId })
  if (isLoading || _.isEmpty(metadata.challengePhases) || challenge.id !== challengeId) return <Loader />
  const isTask = _.get(challenge, 'task.isTask', false)
  const isPureV5 = _.get(challenge, 'task.pureV5', false)
  return (
    <div className={styles.wrapper}>
      <Helmet title='View Details' />
      {!isTask && (
        <div className={cn(styles.actionButtons, styles.button, styles.actionButtonsLeft)}>
          <LegacyLinks challenge={challenge} />
        </div>
      )}
      <div className={styles.title}>View Details</div>
      <div className={cn(styles.actionButtons, styles.button, styles.actionButtonsRight)}>
        {
          challenge.status === 'Draft' && (
            <div className={styles.button}>
              {(challenge.legacyId || isTask || isPureV5) ? (
                <PrimaryButton text={'Launch'} type={'info'} onClick={onLaunchChallenge} />
              ) : (
                <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
                  {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
                  <PrimaryButton text={'Launch'} type={'disabled'} />
                </Tooltip>
              )}
            </div>
          )
        }
        {
          isTask && challenge.status === 'Active' && (
            <div className={styles.button}>
              { assignedMemberDetails ? (
                <PrimaryButton text={'Close Task'} type={'danger'} onClick={onCloseTask} />
              ) : (
                <Tooltip content={MESSAGE.NO_TASK_ASSIGNEE}>
                  {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
                  <PrimaryButton text={'Close Task'} type={'disabled'} />
                </Tooltip>
              )}
            </div>
          )
        }
        { enableEdit && <PrimaryButton text={'Edit'} type={'info'} submit link={`./edit`} /> }
        <PrimaryButton text={'Back'} type={'info'} submit link={`..`} />
      </div>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.group}>
            <div className={cn(styles.row, styles.topRow)}>
              <div className={styles.col}>
                <span>
                  <span className={styles.fieldTitle}>Project:</span>
                  <span dangerouslySetInnerHTML={{
                    __html: xss(projectDetail ? projectDetail.name : '')
                  }} />
                </span>
              </div>
              <div className={styles.col}>
                <span className={styles.fieldTitle}>Track:</span>
                <Track disabled type={challengeTrack} isActive key={challenge.trackId} onUpdateOthers={() => {}} />
              </div>
              <div className={styles.col}>
                <span><span className={styles.fieldTitle}>Type:</span> {selectedType ? selectedType.name : ''}</span>
              </div>
              <div className={styles.col}>
                <span><span className={styles.fieldTitle}>Status:</span> {challenge.status}</span>
              </div>
            </div>

            <div className={cn(styles.row, styles.topRow)}>
              <div className={styles.col}>
                <span><span className={styles.fieldTitle}>Challenge Name:</span> {challenge.name}</span>
              </div>
            </div>
            {isTask && <AssignedMemberField challenge={challenge} assignedMemberDetails={assignedMemberDetails} readOnly /> }
            <CopilotField challenge={{
              copilot
            }} copilots={metadata.members} readOnly />
            <div className={cn(styles.row, styles.topRow)}>
              <div className={styles.col}>
                <span><span className={styles.fieldTitle}>Review Type:</span> {isCommunity ? 'Community' : 'Internal'}</span>
              </div>
            </div>
            {isInternal && reviewer && (<div className={cn(styles.row, styles.topRow)}>
              <div className={styles.col}>
                <span><span className={styles.fieldTitle}>Reviewer:</span> {reviewer}</span>
              </div>
            </div>)}

            <div className={styles.row}>
              <div className={styles.tcCheckbox}>
                <input
                  name='isOpenAdvanceSettings'
                  type='checkbox'
                  id='isOpenAdvanceSettings'
                  checked={openAdvanceSettings}
                  onChange={() => { setOpenAdvanceSettings(!openAdvanceSettings) }}
                />
                <label htmlFor='isOpenAdvanceSettings'>
                  <div>View Advanced Settings</div>
                  <input type='hidden' />
                </label>
              </div>
            </div>
            {openAdvanceSettings && (
              <>
                <NDAField beta challenge={challenge} readOnly />
                <div className={cn(styles.row, styles.topRow)}>
                  <div className={styles.col}>
                    <span><span className={styles.fieldTitle}>Groups:</span> {groups}</span>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <span>
                      <span className={styles.fieldTitle}>Billing Account Id:</span>
                      {projectDetail.billingAccountId}
                    </span>
                    {isBillingAccountExpired && <span className={styles.expiredMessage}>Expired</span>}
                  </div>
                </div>
                {isBetaMode() && (
                  <UseSchedulingAPIField challenge={challenge} readOnly />
                )}
                {isBetaMode() && (
                  <PureV5Field challenge={challenge} readOnly />
                )}
              </>
            )}
            {
              <div className={styles.PhaseRow}>
                <PhaseInput
                  withDates
                  phase={{
                    name: 'Start Date',
                    date: challenge.startDate
                  }}
                  readOnly
                />
              </div>
            }
            {
              isBetaMode() && (
                <ChallengeScheduleField
                  templates={metadata.timelineTemplates}
                  challengePhases={metadata.challengePhases}
                  challenge={challenge}
                  challengePhasesWithCorrectTimeline={challenge.phases}
                  currentTemplate={timeLineTemplate}
                  readOnly
                />
              )
            }
            <div>
              { challenge.discussions && challenge.discussions.map(d => (
                <div key={d.id} className={cn(styles.row, styles.topRow)}>
                  <div className={styles.col}>
                    <span><span className={styles.fieldTitle}>Forum:</span> <a href={d.url} target='_blank' rel='noopener noreferrer'>{d.name}</a></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.group}>
            <div className={styles.title}>Public specification <span>*</span></div>
            <TextEditorField
              challengeTags={metadata.challengeTags}
              challenge={challenge}
              readOnly
            />
            {/* hide until challenge API change is pushed to PROD https://github.com/topcoder-platform/challenge-api/issues/348 */}
            {false && <AttachmentField
              challengeId={challenge.id}
              attachments={attachments}
              token={token}
              readOnly
            />}
            <ChallengePrizesField challenge={challenge} readOnly />
            <CopilotFeeField challenge={challenge} readOnly />
            {DES_TRACK_ID === challenge.trackId && isBetaMode() && <CheckpointPrizesField challenge={challenge} readOnly />}
            <ChallengeTotalField challenge={challenge} />
          </div>
        </div>
      </div>
    </div>
  )
}

ChallengeView.defaultProps = {
  projectDetail: {},
  challenge: {},
  metadata: {},
  challengeResources: {},
  token: ''
}

ChallengeView.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({
      challengeId: PropTypes.string,
      projectId: PropTypes.string
    })
  }).isRequired,
  projectDetail: PropTypes.object,
  challenge: PropTypes.object,
  isBillingAccountExpired: PropTypes.bool,
  attachments: PropTypes.array,
  metadata: PropTypes.object,
  token: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  challengeId: PropTypes.string.isRequired,
  challengeResources: PropTypes.arrayOf(PropTypes.object),
  assignedMemberDetails: PropTypes.shape(),
  enableEdit: PropTypes.bool,
  onLaunchChallenge: PropTypes.func,
  onCloseTask: PropTypes.func
}

export default withRouter(ChallengeView)
