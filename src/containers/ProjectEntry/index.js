import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Loader from '../../components/Loader'
import { loadOnlyProjectInfo } from '../../actions/projects'
import { checkIsUserInvitedToProject } from '../../util/tc'
import Challenges from '../Challenges'
import { clearProjectDetail } from '../../actions/projects'
import { PROJECT_ACCESS_DENIED_MESSAGE } from '../../config/constants'

/**
 * Resolves the correct project landing route for `/projects/:projectId`.
 *
 * It loads lightweight project details first so invited users can be sent to
 * the invitation modal before challenge-specific requests run.
 */
const ProjectEntry = ({
  history,
  isProjectLoading,
  loadOnlyProjectInfo,
  clearProjectDetail,
  match,
  projectDetail,
  token
}) => {
  const projectId = _.get(match, 'params.projectId')
  const [resolvedProjectId, setResolvedProjectId] = useState(null)
  const [projectAccessDenied, setProjectAccessDenied] = useState(false)

  useEffect(() => {
    let isActive = true

    if (!projectId) {
      history.replace('/projects')
      return undefined
    }

    setResolvedProjectId(null)
    setProjectAccessDenied(false)
    loadOnlyProjectInfo(projectId)
      .then(() => {
        if (isActive) {
          setResolvedProjectId(projectId)
        }
      })
      .catch((error) => {
        if (isActive) {
          const responseStatus = _.get(
            error,
            'payload.response.status',
            _.get(error, 'response.status')
          )
          if (`${responseStatus}` === '403') {
            clearProjectDetail()
            setProjectAccessDenied(true)
          } else {
            history.replace('/projects')
          }
        }
      })

    return () => {
      isActive = false
    }
  }, [history, loadOnlyProjectInfo, projectId, clearProjectDetail])

  useEffect(() => {
    if (
      !resolvedProjectId ||
      isProjectLoading ||
      `${_.get(projectDetail, 'id', '')}` !== `${resolvedProjectId}`
    ) {
      return
    }

    const destination = checkIsUserInvitedToProject(token, projectDetail)
      ? `/projects/${resolvedProjectId}/invitation`
      : `/projects/${resolvedProjectId}/challenges`

    history.replace(destination)
  }, [history, isProjectLoading, projectDetail, resolvedProjectId, token])

  if (projectAccessDenied) {
    return (
      <Challenges
        menu='NULL'
        warnMessage={PROJECT_ACCESS_DENIED_MESSAGE}
      />
    )
  }

  return <Loader />
}

ProjectEntry.propTypes = {
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired
  }).isRequired,
  isProjectLoading: PropTypes.bool,
  loadOnlyProjectInfo: PropTypes.func.isRequired,
  clearProjectDetail: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string
    })
  }).isRequired,
  projectDetail: PropTypes.object,
  token: PropTypes.string
}

const mapStateToProps = ({ auth, projects }) => ({
  isProjectLoading: projects.isLoading,
  projectDetail: projects.projectDetail,
  token: auth.token
})

const mapDispatchToProps = {
  loadOnlyProjectInfo,
  clearProjectDetail
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProjectEntry)
)
