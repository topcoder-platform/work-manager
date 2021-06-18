/**
 * Component to render tabs in challenge view page
 */
import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import ChallengeViewComponent from '../ChallengeView'
import Registrants from '../Registrants'
import { getResourceRoleByName } from '../../../util/tc'
import 'react-tabs/style/react-tabs.css'
import styles from './ChallengeViewTabs.module.scss'

const ChallengeViewTabs = ({
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

  return (
    <div className={styles.list}>
      <Tabs
        selectedIndex={selectedTab}
        className={styles.tabsContainer}
        onSelect={index => {
          setSelectedTab(index)
        }}
      >
        <TabList>
          <Tab>DETAILS</Tab>
          <Tab>REGISTRANTS({registrants.length})</Tab>
        </TabList>
        <TabPanel />
        <TabPanel />
        <TabPanel />
      </Tabs>
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
        <Registrants
          challenge={challenge}
          registrants={registrants}
        />
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
  assignedMemberDetails: PropTypes.shape(),
  enableEdit: PropTypes.bool,
  onLaunchChallenge: PropTypes.func,
  onCloseTask: PropTypes.func
}

export default ChallengeViewTabs
