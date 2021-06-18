/**
 * Component to render tabs in challenge view page
 */
import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import _ from 'lodash'

import ChallengeViewComponent from '../ChallengeView'
import Registrants from '../Registrants'
import Submissions from '../Submissions'
import { getResourceRoleByName } from '../../../util/tc'
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
  onCloseTask
}) => {
  const [selectedTab, setSelectedTab] = useState(0)

  const registrants = useMemo(() => {
    const { resourceRoles } = metadata
    const role = getResourceRoleByName(resourceRoles, 'Submitter')
    if (role && challengeResources) {
      return challengeResources.filter(resource => resource.roleId === role.id)
    } else {
      return []
    }
  }, [metadata, challengeResources])

  const submissions = useMemo(() => {
    return _.map(challengeSubmissions, s => {
      s.registrant = _.find(registrants, r => {
        return +r.memberId === s.memberId
      })
      return s
    })
  }, [challengeSubmissions, registrants])
  return (
    <div className={styles.list}>
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
  onCloseTask: PropTypes.func
}

export default ChallengeViewTabs
