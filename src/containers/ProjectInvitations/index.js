import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { toastr } from 'react-redux-toastr'
import { checkIsUserInvitedToProject } from '../../util/tc'
import { isEmpty } from 'lodash'
import { loadProjectInvites } from '../../actions/projects'
import ConfirmationModal from '../../components/Modal/ConfirmationModal'

import styles from './ProjectInvitations.module.scss'
import { updateProjectMemberInvite } from '../../services/projectMemberInvites'
import { PROJECT_MEMBER_INVITE_STATUS_ACCEPTED, PROJECT_MEMBER_INVITE_STATUS_REFUSED } from '../../config/constants'
import { delay } from '../../util/delay'

const theme = {
  container: styles.modalContainer
}

const ProjectInvitations = ({ match, auth, isProjectLoading, history, projectDetail, loadProjectInvites }) => {
  const automaticAction = useMemo(() => [PROJECT_MEMBER_INVITE_STATUS_ACCEPTED, PROJECT_MEMBER_INVITE_STATUS_REFUSED].includes(match.params.action) ? match.params.action : undefined, [match.params])
  const projectId = useMemo(() => parseInt(match.params.projectId), [match.params])
  const invitation = useMemo(() => checkIsUserInvitedToProject(auth.token, projectDetail), [auth.token, projectDetail])
  const [isUpdating, setIsUpdating] = useState(automaticAction || false)
  const isAccepting = isUpdating === PROJECT_MEMBER_INVITE_STATUS_ACCEPTED
  const isDeclining = isUpdating === PROJECT_MEMBER_INVITE_STATUS_REFUSED

  useEffect(() => {
    if (!projectId) {
      return
    }

    if (isProjectLoading || isEmpty(projectDetail)) {
      if (!isProjectLoading) {
        loadProjectInvites(projectId)
      }
      return
    }

    if (!invitation) {
      history.push(`/projects`)
    }
  }, [projectId, auth, projectDetail, isProjectLoading, history])

  const updateInvite = useCallback(async (status) => {
    setIsUpdating(status)
    await updateProjectMemberInvite(projectId, invitation.id, status)

    // await for the project details to propagate
    await delay(1000)
    await loadProjectInvites(projectId)
    toastr.success('Success', `Successfully ${status} the invitation.`)

    // await for the project details to fetch
    await delay(1000)
    history.push(status === PROJECT_MEMBER_INVITE_STATUS_ACCEPTED ? `/projects/${projectId}/challenges` : '/projects')
  }, [projectId, invitation, loadProjectInvites, history])

  const acceptInvite = useCallback(() => updateInvite(PROJECT_MEMBER_INVITE_STATUS_ACCEPTED), [updateInvite])
  const declineInvite = useCallback(() => updateInvite(PROJECT_MEMBER_INVITE_STATUS_REFUSED), [updateInvite])

  useEffect(() => {
    if (!invitation || !automaticAction) {
      return
    }

    if (automaticAction === PROJECT_MEMBER_INVITE_STATUS_ACCEPTED) {
      acceptInvite()
    } else if (automaticAction === PROJECT_MEMBER_INVITE_STATUS_REFUSED) {
      declineInvite()
    }
  }, [invitation, automaticAction])

  return (
    <>
      {invitation && (
        <ConfirmationModal
          title={
            isUpdating ? (
              isAccepting ? 'Adding you to the project....' : 'Declining invitation...'
            ) : "You're invited to join this project"
          }
          message={isDeclining ? '' : `
            Once you join the team you will be able to see the project details, collaborate on project specification and monitor the progress of all deliverables
          `}
          theme={theme}
          cancelText='Decline'
          confirmText='Join project'
          onCancel={declineInvite}
          onConfirm={acceptInvite}
          isProcessing={isUpdating}
        />
      )}
    </>
  )
}

ProjectInvitations.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string
    })
  }).isRequired,
  auth: PropTypes.object.isRequired,
  isProjectLoading: PropTypes.bool,
  history: PropTypes.object,
  loadProjectInvites: PropTypes.func.isRequired,
  projectDetail: PropTypes.object
}

const mapStateToProps = ({ projects, auth }) => {
  return {
    projectDetail: projects.projectDetail,
    isProjectLoading: projects.isLoading || projects.isProjectInvitationsLoading,
    auth
  }
}

const mapDispatchToProps = {
  loadProjectInvites
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProjectInvitations)
)
