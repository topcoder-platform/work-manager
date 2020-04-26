/**
 * Container to render Challenges page
 */
import _ from 'lodash'
import React, { Component } from 'react'
// import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ChallengesComponent from '../../components/ChallengesComponent'
import { loadChallenges, setFilterChallengeValue } from '../../actions/challenges'
import { loadProject } from '../../actions/projects'
import { resetSidebarActiveParams } from '../../actions/sidebar'
import {
  CHALLENGE_STATUS
} from '../../config/constants'

class Challenges extends Component {
  componentDidMount () {
    const { activeProjectId, filterChallengeName, resetSidebarActiveParams, menu, projectId, challenges, status, projectDetail: reduxProjectInfo } = this.props
    if (menu === 'NULL' && activeProjectId !== -1) {
      resetSidebarActiveParams()
    } else {
      const id = activeProjectId > 0 ? activeProjectId : (projectId ? parseInt(projectId) : null)
      // only load challenge if it's init state
      if (challenges.length === 0 && !filterChallengeName && (status === CHALLENGE_STATUS.ACTIVE || !status)) {
        this.props.loadChallenges(id, CHALLENGE_STATUS.ACTIVE, filterChallengeName)
      }
      if (!reduxProjectInfo || reduxProjectInfo.id !== id) {
        this.props.loadProject(id)
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    const { projectId, activeProjectId, filterChallengeName, status } = nextProps
    const { projectId: oldProjectId, activeProjectId: oldActiveProjectId, filterChallengeName: oldFilterChallengeName, status: oldStatus } = this.props

    if (
      projectId !== oldProjectId ||
      activeProjectId !== oldActiveProjectId ||
      filterChallengeName !== oldFilterChallengeName ||
      status !== oldStatus
    ) {
      if (projectId !== oldProjectId || activeProjectId !== oldActiveProjectId) {
        setFilterChallengeValue({ name: '', status: CHALLENGE_STATUS.ACTIVE })
        this.props.loadChallenges(activeProjectId, CHALLENGE_STATUS.ACTIVE, '')
      } else {
        this.props.loadChallenges(activeProjectId, status, filterChallengeName)
      }
    }
  }

  render () {
    const { challenges, isLoading, warnMessage, setFilterChallengeValue, filterChallengeName, projects, activeProjectId, status, projectDetail: reduxProjectInfo } = this.props
    const projectInfo = _.find(projects, { id: activeProjectId }) || {}

    return (
      <ChallengesComponent
        activeProject={({
          ...projectInfo,
          ...((reduxProjectInfo && reduxProjectInfo.id === activeProjectId) ? reduxProjectInfo : {})
        })}
        warnMessage={warnMessage}
        challenges={challenges}
        isLoading={isLoading}
        setFilterChallengeValue={setFilterChallengeValue}
        filterChallengeName={filterChallengeName}
        status={status}
      />
    )
  }
}

Challenges.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape()),
  menu: PropTypes.string,
  challenges: PropTypes.arrayOf(PropTypes.object),
  projectDetail: PropTypes.object,
  isLoading: PropTypes.bool,
  loadChallenges: PropTypes.func,
  loadProject: PropTypes.func.isRequired,
  projectId: PropTypes.string,
  activeProjectId: PropTypes.number,
  warnMessage: PropTypes.string,
  filterChallengeName: PropTypes.string,
  status: PropTypes.string,
  setFilterChallengeValue: PropTypes.func,
  resetSidebarActiveParams: PropTypes.func
}

const mapStateToProps = ({ challenges, sidebar, projects }) => ({
  ...challenges,
  activeProjectId: sidebar.activeProjectId,
  projects: sidebar.projects,
  projectDetail: projects.projectDetail

})

const mapDispatchToProps = {
  loadChallenges,
  setFilterChallengeValue,
  resetSidebarActiveParams,
  loadProject
}

export default connect(mapStateToProps, mapDispatchToProps)(Challenges)
