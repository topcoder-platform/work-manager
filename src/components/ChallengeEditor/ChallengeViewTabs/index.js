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
import Registrants from '../Registrants'
import Submissions from '../Submissions'
import { getResourceRoleByName } from '../../../util/tc'
import { MESSAGE } from '../../../config/constants'
import Tooltip from '../../Tooltip'
import CancelDropDown from '../Cancel-Dropdown'
import 'react-tabs/style/react-tabs.css'
import styles from './ChallengeViewTabs.module.scss'

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
  projectPhases
}) => {
  const [selectedTab, setSelectedTab] = useState(0)

  const registrants = useMemo(() => {
    const { resourceRoles } = metadata
    const role = getResourceRoleByName(resourceRoles, 'Submitter')
    if (role && challengeResources) {
      const registrantList = challengeResources.filter(
        resource => resource.roleId === role.id
      )
      // Add submission date to registrants
      registrantList.forEach((r, i) => {
        const submission = (challengeSubmissions || []).find(s => {
          return '' + s.memberId === '' + r.memberId
        })
        if (submission) {
          registrantList[i].submissionDate = submission.created
        }
      })
      return registrantList
    } else {
      return []
    }
  }, [metadata, challengeResources, challengeSubmissions])

  const submissions = useMemo(() => {
    return _.map(challengeSubmissions, s => {
      s.registrant = _.find(registrants, r => {
        return +r.memberId === s.memberId
      })
      return s
    })
  }, [challengeSubmissions, registrants])

  const isTask = _.get(challenge, 'task.isTask', false)
  const isPureV5 = _.get(challenge, 'legacy.pureV5', false)

  return (
    <div className={styles.list}>
      <Helmet title='View Details' />
      <div className={styles.topContainer}>
        <div className={styles.leftContainer}>
          <div className={styles.title}>{challenge.name}</div>
          {!isTask && !isPureV5 && (
            <div
              className={cn(
                styles.actionButtons,
                styles.button,
                styles.actionButtonsLeft
              )}
            >
              <LegacyLinks challenge={challenge} challengeView />
            </div>
          )}
        </div>
        <div
          className={cn(
            styles.actionButtons,
            styles.button,
            styles.actionButtonsRight
          )}
        >
          {(challenge.status === 'Draft' || challenge.status === 'New') && <div className={styles['cancel-button']}><CancelDropDown challenge={challenge} onSelectMenu={cancelChallenge} /></div>}
          {challenge.status === 'Draft' && (
            <div className={styles.button}>
              {challenge.legacyId || isTask || isPureV5 ? (
                <PrimaryButton
                  text={'Launch'}
                  type={'info'}
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
          {isTask && challenge.status === 'Active' && (
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
          )}
          {enableEdit && (
            <PrimaryButton text={'Edit'} type={'info'} submit link={`./edit`} />
          )}
          <PrimaryButton text={'Back'} type={'info'} submit link={`..`} />
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
        {registrants.length ? (
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
            REGISTRANTS ({registrants.length})
          </a>
        ) : null}
        {challengeSubmissions.length ? (
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
            SUBMISSIONS ({submissions.length})
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
        />
      )}
      {selectedTab === 1 && (
        <Registrants challenge={challenge} registrants={registrants} />
      )}
      {selectedTab === 2 && (
        <Submissions challenge={challenge} submissions={submissions} />
      )}
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
  projectPhases: PropTypes.arrayOf(PropTypes.object)
}

export default ChallengeViewTabs
