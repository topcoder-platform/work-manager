/**
 * Container to render Challenges page
 */
import _ from 'lodash'
import React, { Component, Fragment } from 'react'
// import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DebounceInput } from 'react-debounce-input'
import ChallengesComponent from '../../components/ChallengesComponent'
import ProjectCard from '../../components/ProjectCard'
import Loader from '../../components/Loader'
import { loadChallengesByPage } from '../../actions/challenges'
import { loadProject } from '../../actions/projects'
import { loadProjects, setActiveProject, resetSidebarActiveParams } from '../../actions/sidebar'
import {
  CHALLENGE_STATUS
} from '../../config/constants'
import styles from './Challenges.module.scss'

class Challenges extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchProjectName: '',
      onlyMyProjects: true
    }

    this.updateProjectName = this.updateProjectName.bind(this)
    this.toggleMyProjects = this.toggleMyProjects.bind(this)
  }

  componentDidMount () {
    const { activeProjectId, resetSidebarActiveParams, menu, projectId } = this.props
    if (menu === 'NULL' && activeProjectId !== -1) {
      resetSidebarActiveParams()
    } else {
      // this.props.loadChallengesByPage(1, projectId ? parseInt(projectId) : -1, CHALLENGE_STATUS.ACTIVE, '')
      if (projectId) {
        this.props.loadProject(projectId)
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.activeProjectId !== nextProps.activeProjectId) {
      this.reloadChallenges(nextProps)
    }
  }

  reloadChallenges (props) {
    const { activeProjectId, projectDetail: reduxProjectInfo, projectId, challengeProjectId, loadProject } = props
    if (activeProjectId !== challengeProjectId) {
      this.props.loadChallengesByPage(1, projectId ? parseInt(projectId) : -1, CHALLENGE_STATUS.ACTIVE, '')
      if (
        (!reduxProjectInfo || `${reduxProjectInfo.id}` !== projectId)
      ) {
        loadProject(projectId)
      }
    }
  }

  updateProjectName (val) {
    this.setState({ searchProjectName: val })
    this.props.loadProjects(val, this.state.onlyMyProjects)
  }

  toggleMyProjects (evt) {
    this.setState({ onlyMyProjects: evt.target.checked }, () => {
      this.props.loadProjects(this.state.searchProjectName, this.state.onlyMyProjects)
    })
  }

  render () {
    const {
      challenges,
      isLoading,
      warnMessage,
      filterChallengeName,
      projects,
      activeProjectId,
      status,
      projectDetail: reduxProjectInfo,
      loadChallengesByPage,
      page,
      perPage,
      totalChallenges,
      setActiveProject
    } = this.props
    const { searchProjectName, onlyMyProjects } = this.state
    const projectInfo = _.find(projects, { id: activeProjectId }) || {}
    const projectComponents = projects.map(p => (
      <li key={p.id}>
        <ProjectCard
          projectName={p.name}
          projectId={p.id}
          selected={activeProjectId === `${p.id}`}
          setActiveProject={setActiveProject}
        />
      </li>
    ))
    return (
      <Fragment>
        <div className={styles.projectSearch}>
          <div className={styles.projectSearchHeader}>
            <label>Switch Project</label>
            <DebounceInput
              minLength={2}
              debounceTimeout={300}
              placeholder='Search projects (Enter project id or project title in double quotes or any text from project)'
              onChange={(e) => this.updateProjectName(e.target.value)}
              value={searchProjectName}
            />
            <input
              type='checkbox'
              label='My Projects'
              checked={onlyMyProjects}
              onChange={this.toggleMyProjects}
            />
            <label>My Projects</label>
          </div>
          {
            activeProjectId === -1 && <div>No project selected. Select one below</div>
          }
          {
            isLoading ? <Loader /> : (
              <ul>
                {projectComponents}
              </ul>
            )
          }
        </div>
        { activeProjectId !== -1 && <ChallengesComponent
          activeProject={({
            ...projectInfo,
            ...((reduxProjectInfo && reduxProjectInfo.id === activeProjectId) ? reduxProjectInfo : {})
          })}
          warnMessage={warnMessage}
          challenges={challenges}
          isLoading={isLoading}
          filterChallengeName={filterChallengeName}
          status={status}
          activeProjectId={activeProjectId}
          loadChallengesByPage={loadChallengesByPage}
          page={page}
          perPage={perPage}
          totalChallenges={totalChallenges}
        />
        }
      </Fragment>
    )
  }
}

Challenges.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape()),
  menu: PropTypes.string,
  challenges: PropTypes.arrayOf(PropTypes.object),
  projectDetail: PropTypes.object,
  isLoading: PropTypes.bool,
  loadChallengesByPage: PropTypes.func,
  loadProject: PropTypes.func.isRequired,
  projectId: PropTypes.string,
  activeProjectId: PropTypes.number,
  warnMessage: PropTypes.string,
  filterChallengeName: PropTypes.string,
  status: PropTypes.string,
  resetSidebarActiveParams: PropTypes.func,
  page: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  totalChallenges: PropTypes.number.isRequired,
  loadProjects: PropTypes.func.isRequired,
  setActiveProject: PropTypes.func.isRequired
}

const mapStateToProps = ({ challenges, sidebar, projects }) => ({
  ..._.omit(challenges, ['projectId']),
  challengeProjectId: challenges.projectId,
  activeProjectId: sidebar.activeProjectId,
  projects: sidebar.projects,
  projectDetail: projects.projectDetail

})

const mapDispatchToProps = {
  loadChallengesByPage,
  resetSidebarActiveParams,
  loadProject,
  loadProjects,
  setActiveProject
}

export default connect(mapStateToProps, mapDispatchToProps)(Challenges)
