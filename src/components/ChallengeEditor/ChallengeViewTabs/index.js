/**
 * Component to render tabs in challenge view page
 */
import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import cn from 'classnames'
import _ from 'lodash'

import ChallengeViewComponent from '../ChallengeView'
import { PrimaryButton } from '../../Buttons'
import LegacyLinks from '../../LegacyLinks'
import ForumLink from '../../ForumLink'
import ResourcesTab from '../Resources'
import Submissions from '../Submissions'
import {
  checkAdmin,
  checkEditResourceRoles,
  checkReadOnlyRoles,
  checkCopilot
} from '../../../util/tc'
import { CHALLENGE_STATUS, MESSAGE } from '../../../config/constants'
import Tooltip from '../../Tooltip'
import CancelDropDown from '../Cancel-Dropdown'
import 'react-tabs/style/react-tabs.css'
import styles from './ChallengeViewTabs.module.scss'
import ResourcesAdd from '../ResourcesAdd'

function getSelectorStyle (selectedView, currentView) {
  return cn(styles['challenge-selector-common'], {
    [styles['challenge-selected-view']]: selectedView === currentView,
    [styles['challenge-unselected-view']]: selectedView !== currentView
  })
}

const ChallengeViewTabs = ({
  projectDetail,
  challenge,
  attachments,
  isBillingAccountExpired,
  metadata,
  challengeResources,
  challengeSubmissions,
  token,
  isLoading,
  challengeId,
  assignedMemberDetails,
  enableEdit,
  onLaunchChallenge,
  cancelChallenge,
  onCloseTask,
  projectPhases,
  assignYourselfCopilot,
  showRejectChallengeModal,
  loggedInUser,
  onApproveChallenge,
  createResource,
  deleteResource,
  loadSubmissions,
  totalSubmissions,
  submissionsPerPage,
  page
}) => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [showAddResourceModal, setShowAddResourceModal] = useState(false)
  const { resourceRoles } = metadata
  const loggedInUserResource = useMemo(
    () => {
      if (!loggedInUser) {
        return null
      }
      const loggedInUserResourceTmps = _.cloneDeep(_.filter(challengeResources, { memberId: `${loggedInUser.userId}` }))
      let loggedInUserResourceTmp = null
      if (loggedInUserResourceTmps.length > 0) {
        loggedInUserResourceTmp = loggedInUserResourceTmps[0]
        loggedInUserResourceTmp.resources = loggedInUserResourceTmps
        if (resourceRoles) {
          let roles = []
          _.forEach(loggedInUserResourceTmps, resource => {
            const roleNames = _.filter(resourceRoles, { id: resource.roleId }).map(ri => ri.name)
            roles = [...roles, ...roleNames]
          })
          loggedInUserResourceTmp.roles = roles
        }
      }
      return loggedInUserResourceTmp
    },
    [loggedInUser, challengeResources, metadata]
  )
  const canEditResource = useMemo(
    () => {
      return selectedTab === 1 &&
      (
        (
          loggedInUserResource &&
          checkEditResourceRoles(loggedInUserResource.roles)
        ) ||
        checkAdmin(token)
      )
    },
    [loggedInUserResource, token, selectedTab]
  )

  const allResources = useMemo(() => {
    return challengeResources.map(rs => {
      if (!rs.role) {
        const roleInfo = _.find(resourceRoles, { id: rs.roleId })
        rs.role = roleInfo ? roleInfo.name : ''
      }
      return rs
    })
  }, [metadata, challengeResources])

  const submissions = useMemo(() => {
    return _.map(challengeSubmissions, s => {
      s.registrant = _.find(allResources, r => {
        return +r.memberId === s.memberId
      })
      return s
    })
  }, [challengeSubmissions, allResources, page])

  const isTask = _.get(challenge, 'task.isTask', false)

  const isSelfService = challenge.legacy.selfService
  const isDraft = challenge.status.toUpperCase() === CHALLENGE_STATUS.DRAFT
  const isSelfServiceCopilot = challenge.legacy.selfServiceCopilot === loggedInUser.handle
  const isAdmin = checkAdmin(token)

  // Make sure that the Launch and Mark as completed buttons are hidden
  // for tasks that are assigned to the current logged in user, if that user has the copilot role.
  const preventCopilotFromActivatingTask = useMemo(() => {
    return isTask &&
      checkCopilot(token) &&
      assignedMemberDetails &&
      loggedInUser &&
      `${loggedInUser.userId}` === `${assignedMemberDetails.userId}`
  }, [
    token,
    assignedMemberDetails,
    loggedInUser
  ])

  const isReadOnly = checkReadOnlyRoles(token)
  const canApprove = (isSelfServiceCopilot || enableEdit) && isDraft && isSelfService
  const hasBillingAccount = _.get(projectDetail, 'billingAccountId') !== null
  // only challenges that have a billing account can be launched AND
  // if this isn't self-service, permit launching if the challenge is draft
  // OR if this isn't a non-self-service draft, permit launching if:
  // a) the current user is either the self-service copilot or is an admin AND
  // b) the challenge is approved
  const canLaunch = useMemo(() => {
    return enableEdit &&
      hasBillingAccount &&
      (!isReadOnly) &&
      (!preventCopilotFromActivatingTask) &&
      (
        (
          !isSelfService &&
          isDraft
        ) ||
        (
          (
            isSelfServiceCopilot ||
            isAdmin
          ) &&
          challenge.status.toUpperCase() === CHALLENGE_STATUS.APPROVED
        )
      )
  }, [
    enableEdit,
    hasBillingAccount,
    isReadOnly,
    isSelfService,
    isDraft,
    isSelfServiceCopilot,
    isAdmin,
    challenge.status,
    preventCopilotFromActivatingTask
  ])

  return (
    <div className={styles.list}>
      <Helmet title='View Details' />
      <div className={styles.topContainer}>
        <div className={styles.leftContainer}>
          <div className={styles.title}>{challenge.name}</div>

          <div
            className={cn(
              styles.actionButtons,
              styles.button,
              styles.actionButtonsLeft
            )}
          >
            {isTask ? (<ForumLink challenge={challenge} />)
              : (<LegacyLinks challenge={challenge} challengeView />)
            }
          </div>

        </div>
        <div
          className={cn(
            styles.actionButtons,
            styles.button,
            styles.actionButtonsRight
          )}
        >
          {enableEdit && (isDraft || challenge.status === 'New') && !isReadOnly && !isSelfService &&
            (<div className={styles['cancel-button']}><CancelDropDown challenge={challenge} onSelectMenu={cancelChallenge} /></div>)}
          {canLaunch && (
            <div className={styles.button}>
              {challenge.legacyId || isTask ? (
                <PrimaryButton
                  text='Launch'
                  type='info'
                  onClick={onLaunchChallenge}
                />
              ) : (
                <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
                  {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
                  <PrimaryButton text={'Launch'} type={'disabled'} />
                </Tooltip>
              )}
            </div>
          )}
          {canApprove && (
            <div className={styles.button}>
              <PrimaryButton
                text='Approve'
                type='info'
                onClick={onApproveChallenge}
              />
            </div>
          )}
          {
            (
              isTask &&
              challenge.status === CHALLENGE_STATUS.ACTIVE &&
              !preventCopilotFromActivatingTask
            ) && (
              <div className={styles.button}>
                {assignedMemberDetails ? (
                  <Tooltip content={MESSAGE.MARK_COMPLETE}>
                    <PrimaryButton text={'Mark Complete'} type={'success'} onClick={onCloseTask} />
                  </Tooltip>
                ) : (
                  <Tooltip content={MESSAGE.NO_TASK_ASSIGNEE}>
                    {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
                    <PrimaryButton text={'Mark Complete'} type={'disabled'} />
                  </Tooltip>
                )}
              </div>
            )
          }
          {enableEdit && !canEditResource && (
            <PrimaryButton text={'Edit'} type={'info'} submit link={`./edit`} />
          )}
          {canEditResource && (
            <PrimaryButton text={'Add'} type={'info'} onClick={() => {
              setShowAddResourceModal(true)
            }} />
          )}
          {isSelfService && isDraft && (isAdmin || isSelfServiceCopilot || enableEdit) && (
            <div className={styles.button}>
              <PrimaryButton
                text='Reject challenge'
                type='danger'
                onClick={showRejectChallengeModal}
              />
            </div>
          )}
          {!canEditResource ? (<PrimaryButton text={'Back'} type={'info'} submit link={`..`} />) : null}
        </div>
      </div>
      <div className={styles['challenge-view-selector']}>
        <a
          tabIndex='0'
          role='tab'
          aria-selected={selectedTab === 0}
          onClick={e => {
            setSelectedTab(0)
          }}
          onKeyPress={e => {
            setSelectedTab(0)
          }}
          className={getSelectorStyle(selectedTab, 0)}
        >
          DETAILS
        </a>
        <a
          tabIndex='1'
          role='tab'
          aria-selected={selectedTab === 1}
          onClick={e => {
            setSelectedTab(1)
          }}
          onKeyPress={e => {
            setSelectedTab(1)
          }}
          className={getSelectorStyle(selectedTab, 1)}
        >
          RESOURCES
        </a>
        {totalSubmissions ? (
          <a
            tabIndex='2'
            role='tab'
            aria-selected={selectedTab === 2}
            onClick={e => {
              setSelectedTab(2)
            }}
            onKeyPress={e => {
              setSelectedTab(2)
            }}
            className={getSelectorStyle(selectedTab, 2)}
          >
            SUBMISSIONS ({totalSubmissions})
          </a>
        ) : null}
      </div>
      {selectedTab === 0 && (
        <ChallengeViewComponent
          isLoading={isLoading}
          isBillingAccountExpired={isBillingAccountExpired}
          metadata={metadata}
          projectDetail={projectDetail}
          challenge={challenge}
          attachments={attachments}
          challengeResources={challengeResources}
          token={token}
          challengeId={challengeId}
          assignedMemberDetails={assignedMemberDetails}
          enableEdit={enableEdit}
          onLaunchChallenge={onLaunchChallenge}
          onCloseTask={onCloseTask}
          projectPhases={projectPhases}
          assignYourselfCopilot={assignYourselfCopilot}
          showRejectChallengeModal={showRejectChallengeModal}
          onApproveChallenge={onApproveChallenge}
          loggedInUser={loggedInUser}
        />
      )}
      {selectedTab === 1 && (
        <ResourcesTab
          challenge={challenge}
          resources={allResources}
          canEditResource={canEditResource}
          deleteResource={deleteResource}
          submissions={submissions}
          loggedInUserResource={loggedInUserResource}
        />
      )}
      {selectedTab === 2 && (
        <Submissions
          challenge={challenge}
          submissions={submissions}
          token={token}
          loggedInUserResource={loggedInUserResource}
          loadSubmissions={loadSubmissions}
          totalSubmissions={totalSubmissions}
          submissionsPerPage={submissionsPerPage}
          page={page}
        />
      )}
      {showAddResourceModal ? (<ResourcesAdd
        onClose={() => setShowAddResourceModal(false)}
        challenge={challenge}
        loggedInUser={loggedInUser}
        resourceRoles={resourceRoles}
        createResource={createResource}
      />) : null}
    </div>
  )
}

ChallengeViewTabs.defaultProps = {
  projectDetail: {},
  challenge: {},
  metadata: {},
  challengeResources: {},
  token: ''
}

ChallengeViewTabs.propTypes = {
  projectDetail: PropTypes.object,
  challenge: PropTypes.object,
  isBillingAccountExpired: PropTypes.bool,
  attachments: PropTypes.array,
  metadata: PropTypes.object,
  token: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  challengeId: PropTypes.string.isRequired,
  challengeResources: PropTypes.arrayOf(PropTypes.object),
  challengeSubmissions: PropTypes.arrayOf(PropTypes.object),
  assignedMemberDetails: PropTypes.shape(),
  enableEdit: PropTypes.bool,
  onLaunchChallenge: PropTypes.func,
  cancelChallenge: PropTypes.func.isRequired,
  onCloseTask: PropTypes.func,
  projectPhases: PropTypes.arrayOf(PropTypes.object),
  assignYourselfCopilot: PropTypes.func.isRequired,
  createResource: PropTypes.func.isRequired,
  deleteResource: PropTypes.func.isRequired,
  showRejectChallengeModal: PropTypes.func.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  onApproveChallenge: PropTypes.func,
  loadSubmissions: PropTypes.func,
  totalSubmissions: PropTypes.number,
  submissionsPerPage: PropTypes.number,
  page: PropTypes.number
}

export default ChallengeViewTabs
