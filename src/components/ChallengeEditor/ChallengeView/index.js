import React, { useState } from 'react'
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
import CopilotField from '../Copilot-Field'
import ChallengeScheduleField from '../ChallengeSchedule-Field'
import TextEditorField from '../TextEditor-Field'
import AttachmentField from '../Attachment-Field'
import ChallengePrizesField from '../ChallengePrizes-Field'
import CopilotFeeField from '../CopilotFee-Field'
import ChallengeTotalField from '../ChallengeTotal-Field'

const ChallengeView = ({ projectDetail, challenge, metadata, challengeResources, token }) => {
  const selectedType = _.find(metadata.challengeTypes, { id: challenge.typeId })

  const [openAdvanceSettings, setOpenAdvanceSettings] = useState(false)

  const getResourceRoleByName = (name) => {
    const { resourceRoles } = metadata
    return resourceRoles ? resourceRoles.find(role => role.name === name) : null
  }

  const getResourceFromProps = (name) => {
    const role = getResourceRoleByName(name)
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

  const reviewType = challenge.reviewType ? challenge.reviewType.toLowerCase() : 'community'
  const isCommunity = reviewType === 'community'
  const isInternal = reviewType === 'internal'
  const timeLineTemplate = _.find(metadata.timelineTemplates, { id: challenge.timelineTemplateId })
  return (
    <div className={styles.wrapper}>
      <Helmet title='View Details' />
      <div className={styles.title}>View Details</div>
      <div className={cn(styles.button, styles.editButton)}>
        <PrimaryButton text={'Edit'} type={'info'} submit link={`./edit`} />
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
                <Track disabled type={challenge.track} isActive key={challenge.track} onUpdateOthers={() => {}} />
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
            <NDAField challenge={challenge} readOnly />
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
            {openAdvanceSettings && (<div className={cn(styles.row, styles.topRow)}>
              <div className={styles.col}>
                <span><span className={styles.fieldTitle}>Groups:</span> {challenge.groups ? challenge.groups.join(', ') : ''}</span>
              </div>
            </div>)}
            <ChallengeScheduleField
              templates={metadata.timelineTemplates}
              challengePhases={metadata.challengePhases}
              challenge={challenge}
              challengePhasesWithCorrectTimeline={challenge.phases}
              currentTemplate={timeLineTemplate}
              readOnly
            />
          </div>
          <div className={styles.group}>
            <div className={styles.title}>Public specification <span>*</span></div>
            <TextEditorField
              challengeTags={metadata.challengeTags}
              challenge={challenge}
              readOnly
            />
            { false && (
              <AttachmentField
                challenge={challenge}
                token={token}
                readOnly
              />
            )}
            <ChallengePrizesField challenge={challenge} readOnly />
            <CopilotFeeField challenge={challenge} readOnly />
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
  metadata: PropTypes.object,
  token: PropTypes.string,
  challengeResources: PropTypes.arrayOf(PropTypes.object)
}

export default withRouter(ChallengeView)
