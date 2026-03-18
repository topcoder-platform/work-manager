/**
 * Component to define routes of the app
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Redirect, Route, Switch, withRouter } from 'react-router-dom'
import _ from 'lodash'
import { BETA_MODE_COOKIE_TAG } from './config/constants'
import renderApp from './components/App'
import TopBarContainer from './containers/TopbarContainer'
import FooterContainer from './containers/FooterContainer'
import Tab from './containers/Tab'
import Challenges from './containers/Challenges'
import Projects from './containers/Projects'
import TaaSList from './containers/TaaSList'
import ProjectAssets from './containers/ProjectAssets'
import TaaSProjectForm from './containers/TaaSProjectForm'
import ChallengeEditor from './containers/ChallengeEditor'
import EngagementEditor from './containers/EngagementEditor'
import EngagementPayment from './containers/EngagementPayment'
import EngagementsList from './containers/EngagementsList'
import ApplicationsList from './containers/ApplicationsList'
import EngagementFeedback from './containers/EngagementFeedback'
import EngagementExperience from './containers/EngagementExperience'
import { getFreshToken, decodeToken } from 'tc-auth-lib'
import { saveToken } from './actions/auth'
import { loadChallengeDetails } from './actions/challenges'
import { loadOnlyProjectInfo } from './actions/projects'
import { connect } from 'react-redux'
import {
  checkAllowedRoles,
  checkOnlyReadOnlyRoles,
  checkReadOnlyRoles,
  checkAdmin,
  checkCopilot,
  checkManager,
  checkAdminOrTalentManager,
  checkIsProjectMember
} from './util/tc'
import Users from './containers/Users'
import Groups from './containers/Groups'
import { isBetaMode, removeFromLocalStorage, saveToLocalStorage } from './util/localstorage'
import ProjectEditor from './containers/ProjectEditor'
import ProjectInvitations from './containers/ProjectInvitations'
import ProjectEntry from './containers/ProjectEntry'

const { ACCOUNTS_APP_LOGIN_URL } = process.env

class RedirectToChallenge extends React.Component {
  componentWillMount () {
    const { match, loadChallengeDetails } = this.props
    const challengeId = match.params.challengeId
    loadChallengeDetails(null, challengeId)
  }

  componentWillReceiveProps (nextProps) {
    const { token } = nextProps
    const isReadOnly = checkOnlyReadOnlyRoles(token)
    const projectId = _.get(nextProps.challengeDetails, 'projectId')
    const challengeId = _.get(nextProps.challengeDetails, 'id')
    if (projectId && challengeId && isReadOnly) {
      console.log('Redircting to full URL')
      this.props.history.replace(`/projects/${projectId}/challenges/${challengeId}/view`)
    }
  }

  render () {
    return <div>Redirecting...</div>
  }
}

let mapStateToProps = ({ challenges: { challengeDetails }, auth }) => ({
  challengeDetails,
  ...auth
})

let mapDispatchToProps = {
  loadChallengeDetails
}

RedirectToChallenge.propTypes = {
  loadChallengeDetails: PropTypes.func,
  challengeDetails: PropTypes.object,
  match: PropTypes.object,
  history: PropTypes.object,
  token: PropTypes.string
}

const ConnectRedirectToChallenge = connect(mapStateToProps, mapDispatchToProps)(RedirectToChallenge)

class Routes extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      assetsAccessStatusByProjectId: {}
    }
  }

  componentWillMount () {
    this.checkAuth()
  }

  componentDidMount () {
    this.resolveAssetsRouteAccess(this.props)
  }

  checkAuth () {
    // try to get a token and redirect to login page if it fails
    getFreshToken().then((token) => {
      this.props.saveToken(token)
    }).catch((error) => {
      const errorMessage = error && error.message ? error.message : error
      console.error('An unexpected error occurred while getting auth token', errorMessage)
      const redirectBackToUrl = encodeURIComponent(window.location.origin + this.props.location.pathname + this.props.location.search)
      window.location = `${ACCOUNTS_APP_LOGIN_URL}?retUrl=${redirectBackToUrl}`
    })
  }

  /**
   * Parses the pathname and returns the project id for assets routes.
   *
   * @param {String} pathname current location pathname
   * @returns {String|null} assets route project id
   */
  getAssetsProjectIdFromPath (pathname) {
    const match = (pathname || '').match(/^\/projects\/([^/]+)\/assets\/?$/)
    return _.get(match, '[1]', null)
  }

  /**
   * Stores per-project access resolution status for assets routing.
   *
   * @param {String} projectId route project id
   * @param {String} status resolution status (`loading` or `denied`)
   */
  setAssetsAccessStatus (projectId, status) {
    const normalizedProjectId = `${projectId}`
    this.setState(prevState => ({
      assetsAccessStatusByProjectId: {
        ...prevState.assetsAccessStatusByProjectId,
        [normalizedProjectId]: status
      }
    }))
  }

  /**
   * Clears a stored assets access status for the provided project id.
   *
   * @param {String} projectId route project id
   */
  clearAssetsAccessStatus (projectId) {
    const normalizedProjectId = `${projectId}`
    this.setState(prevState => {
      if (!_.has(prevState.assetsAccessStatusByProjectId, normalizedProjectId)) {
        return null
      }

      return {
        assetsAccessStatusByProjectId: _.omit(prevState.assetsAccessStatusByProjectId, normalizedProjectId)
      }
    })
  }

  /**
   * Resolves assets access for direct `/projects/:projectId/assets` navigation.
   * This keeps authorization scoped to the requested route project id.
   *
   * @param {Object} props current component props
   * @param {Object} prevProps previous component props
   */
  resolveAssetsRouteAccess (props, prevProps = {}) {
    const projectId = this.getAssetsProjectIdFromPath(_.get(props, 'location.pathname'))
    if (!projectId || !props.isLoggedIn || !props.token) {
      return
    }

    if (checkAdmin(props.token) || checkCopilot(props.token)) {
      return
    }

    const isProjectDetailForRequestedProject = `${_.get(props, 'projectDetail.id', '')}` === `${projectId}`
    if (isProjectDetailForRequestedProject) {
      this.clearAssetsAccessStatus(projectId)
      return
    }

    const currentPath = _.get(props, 'location.pathname')
    const previousPath = _.get(prevProps, 'location.pathname')
    const isNewAssetsNavigation = currentPath !== previousPath
    const accessStatus = _.get(this.state.assetsAccessStatusByProjectId, `${projectId}`)
    if (accessStatus === 'loading' || (accessStatus === 'denied' && !isNewAssetsNavigation)) {
      return
    }

    this.setAssetsAccessStatus(projectId, 'loading')
    this.props.loadOnlyProjectInfo(projectId)
      .then(() => {
        this.clearAssetsAccessStatus(projectId)
      })
      .catch((error) => {
        const responseStatus = _.get(error, 'payload.response.status', _.get(error, 'response.status'))
        if (responseStatus === 403) {
          this.setAssetsAccessStatus(projectId, 'denied')
          return
        }

        this.clearAssetsAccessStatus(projectId)
      })
  }

  componentDidUpdate (prevProps) {
    const { search } = this.props.location
    const params = new URLSearchParams(search)
    if (!_.isEmpty(params.get('beta'))) {
      if (params.get('beta') === 'true' && !isBetaMode()) {
        saveToLocalStorage(BETA_MODE_COOKIE_TAG, 'true')
      } else if (params.get('beta') === 'false' && isBetaMode()) {
        removeFromLocalStorage(BETA_MODE_COOKIE_TAG)
      }
      this.props.history.push(this.props.location.pathname)
    }

    this.resolveAssetsRouteAccess(this.props, prevProps)
  }

  render () {
    if (!this.props.isLoggedIn) {
      return null
    }

    const { token, projectDetail, hasProjectAccess } = this.props
    const isAllowed = checkAllowedRoles(_.get(decodeToken(token), 'roles'))
    const isReadOnly = checkReadOnlyRoles(token)
    const isCopilot = checkCopilot(token)
    const isAdmin = checkAdmin(token)
    const canAccessEngagements = checkAdminOrTalentManager(token)

    return (
      <React.Fragment>
        {!isAllowed && <Switch>
          <Route exact path='/'
            render={() => renderApp(
              <Challenges menu='NULL' warnMessage={'You are not authorized to use this application'} />,
              <TopBarContainer />,
              <Tab />,
              <FooterContainer />
            )()}
          />
          <Redirect to='/' />
        </Switch>}
        {isAllowed && <Switch>
          <Route exact path='/'
            render={() => renderApp(
              <Challenges dashboard key='dashboard' />,
              <TopBarContainer />,
              <Tab />,
              <FooterContainer />
            )()}
          />
          <Route exact path='/projects'
            render={() => renderApp(
              <Projects />,
              <TopBarContainer />,
              <Tab />,
              <FooterContainer />
            )()}
          />
          {canAccessEngagements && (
            <Route exact path='/engagements'
              render={() => renderApp(
                <EngagementsList allEngagements />,
                <TopBarContainer />,
                <Tab />,
                <FooterContainer />
              )()}
            />
          )}
          {!canAccessEngagements && (
            <Route exact path='/engagements'
              render={() => renderApp(
                <Challenges
                  menu='NULL'
                  warnMessage={'You need Admin or Talent Manager role to view engagements'}
                />,
                <TopBarContainer />,
                <Tab />,
                <FooterContainer />
              )()}
            />
          )}
          <Route exact path='/projects/new'
            render={() => renderApp(
              <ProjectEditor />,
              <TopBarContainer />,
              <Tab />,
              <FooterContainer />
            )()}
          />
          <Route exact path='/projects/:projectId/invitation/:action?'
            render={() => renderApp(
              <ProjectInvitations />,
              <TopBarContainer />,
              <Tab />,
              <FooterContainer />
            )()}
          />
          <Route exact path='/projects/:projectId/edit'
            render={({ match }) => renderApp(
              <ProjectEditor isEdit projectId={_.get(match.params, 'projectId', null)} />,
              <TopBarContainer />,
              <Tab projectId={match.params.projectId} />,
              <FooterContainer />
            )()}
          />
          <Route
            exact
            path='/projects/:projectId/assets'
            render={({ match }) => {
              const routeProjectId = _.get(match.params, 'projectId')
              const isProjectDetailForRequestedProject = `${_.get(projectDetail, 'id', '')}` === `${routeProjectId}`
              const hasScopedProjectAccess = isProjectDetailForRequestedProject && hasProjectAccess
              const isProjectMemberForRequestedProject = isProjectDetailForRequestedProject && checkIsProjectMember(token, projectDetail)
              const canViewRequestedProjectAssets = isCopilot || isAdmin || hasScopedProjectAccess || isProjectMemberForRequestedProject
              const assetsAccessStatus = _.get(this.state.assetsAccessStatusByProjectId, `${routeProjectId}`)
              const canResolveRequestedProjectAccess = !isCopilot &&
                !isAdmin &&
                !isProjectDetailForRequestedProject &&
                assetsAccessStatus !== 'denied'

              if (!canViewRequestedProjectAssets && !canResolveRequestedProjectAccess) {
                return renderApp(
                  <Challenges
                    menu='NULL'
                    warnMessage={'You are not authorized to view this project assets library'}
                  />,
                  <TopBarContainer />,
                  <Tab projectId={routeProjectId} />,
                  <FooterContainer />
                )()
              }

              return renderApp(
                <ProjectAssets projectId={routeProjectId} />,
                <TopBarContainer />,
                <Tab projectId={routeProjectId} />,
                <FooterContainer />
              )()
            }}
          />
          {
            !isReadOnly && (
              <Route exact path='/users'
                render={() => renderApp(
                  <Users />,
                  <TopBarContainer />,
                  <Tab />,
                  <FooterContainer />
                )()}
              />
            )
          }
          {
            !isReadOnly && (isCopilot || isAdmin || checkManager(this.props.token)) && (
              <Route exact path='/groups'
                render={() => renderApp(
                  <Groups />,
                  <TopBarContainer />,
                  <Tab />,
                  <FooterContainer />
                )()}
              />
            )
          }
          <Route exact path='/self-service'
            render={() => renderApp(
              <Challenges selfService />,
              <TopBarContainer />,
              <Tab selfService />,
              <FooterContainer />
            )()}
          />
          <Route exact path='/taas'
            render={() => renderApp(
              <TaaSList />,
              <TopBarContainer />,
              <Tab />,
              <FooterContainer />
            )()}
          />
          {(isCopilot || isAdmin) && (
            <Route
              exact
              path='/taas/new'
              render={({ match }) =>
                renderApp(
                  <TaaSProjectForm />,
                  <TopBarContainer />,
                  <Tab />,
                  <FooterContainer />
                )()
              }
            />
          )}
          {(isCopilot || isAdmin) && (
            <Route
              exact
              path='/taas/:projectId/edit'
              render={({ match }) =>
                renderApp(
                  <TaaSProjectForm projectId={match.params.projectId} />,
                  <TopBarContainer />,
                  <Tab projectId={match.params.projectId} />,
                  <FooterContainer />
                )()
              }
            />
          )}
          {canAccessEngagements && (
            <Route exact path='/projects/:projectId/engagements'
              render={({ match }) => renderApp(
                <EngagementsList projectId={match.params.projectId} />,
                <TopBarContainer projectId={match.params.projectId} />,
                <Tab projectId={match.params.projectId} />,
                <FooterContainer />
              )()} />
          )}
          {canAccessEngagements && (
            <Route exact path='/projects/:projectId/engagements/new'
              render={({ match }) => renderApp(
                <EngagementEditor />,
                <TopBarContainer />,
                <Tab projectId={match.params.projectId} menu={'New Engagement'} />,
                <FooterContainer />
              )()} />
          )}
          {canAccessEngagements && (
            <Route exact path='/projects/:projectId/engagements/:engagementId/applications'
              render={({ match }) => renderApp(
                <ApplicationsList projectId={match.params.projectId} engagementId={match.params.engagementId} />,
                <TopBarContainer projectId={match.params.projectId} />,
                <Tab
                  projectId={match.params.projectId}
                  menu={'Applications'}
                  backPath={`/projects/${match.params.projectId}/engagements`}
                />,
                <FooterContainer />
              )()} />
          )}
          {canAccessEngagements && (
            <Route exact path='/projects/:projectId/engagements/:engagementId/experience'
              render={({ match }) => renderApp(
                <EngagementExperience projectId={match.params.projectId} engagementId={match.params.engagementId} />,
                <TopBarContainer projectId={match.params.projectId} />,
                <Tab
                  projectId={match.params.projectId}
                  menu={'Experience'}
                  backPath={`/projects/${match.params.projectId}/engagements/${match.params.engagementId}/assignments`}
                />,
                <FooterContainer />
              )()} />
          )}
          {canAccessEngagements && (
            <Route exact path='/projects/:projectId/engagements/:engagementId/feedback'
              render={({ match }) => renderApp(
                <EngagementFeedback projectId={match.params.projectId} engagementId={match.params.engagementId} />,
                <TopBarContainer projectId={match.params.projectId} />,
                <Tab
                  projectId={match.params.projectId}
                  menu={'Feedback'}
                  backPath={`/projects/${match.params.projectId}/engagements/${match.params.engagementId}/assignments`}
                />,
                <FooterContainer />
              )()} />
          )}
          {canAccessEngagements && (
            <Route exact path='/projects/:projectId/engagements/:engagementId/assignments'
              render={({ match }) => renderApp(
                <EngagementPayment projectId={match.params.projectId} engagementId={match.params.engagementId} />,
                <TopBarContainer projectId={match.params.projectId} />,
                <Tab
                  projectId={match.params.projectId}
                  menu={'Payment'}
                  backPath={`/projects/${match.params.projectId}/engagements`}
                />,
                <FooterContainer />
              )()} />
          )}
          {canAccessEngagements && (
            <Route exact path='/projects/:projectId/engagements/:engagementId/view'
              render={({ match }) => renderApp(
                <EngagementEditor />,
                <TopBarContainer projectId={match.params.projectId} />,
                <Tab projectId={match.params.projectId} menu={'Engagement'} />,
                <FooterContainer />
              )()} />
          )}
          {canAccessEngagements && (
            <Route path='/projects/:projectId/engagements/:engagementId'
              render={({ match }) => renderApp(
                <EngagementEditor />,
                <TopBarContainer />,
                <Tab projectId={match.params.projectId} menu={'Engagement'} />,
                <FooterContainer />
              )()} />
          )}
          {!canAccessEngagements && (
            <Route path='/projects/:projectId/engagements'
              render={({ match }) => renderApp(
                <Challenges
                  menu='NULL'
                  warnMessage={'You need Admin or Talent Manager role to view engagements'}
                />,
                <TopBarContainer />,
                <Tab projectId={match.params.projectId} />,
                <FooterContainer />
              )()} />
          )}
          {
            !isReadOnly && (
              <Route exact path='/projects/:projectId/challenges/new'
                render={({ match }) => renderApp(
                  <ChallengeEditor />,
                  <TopBarContainer />,
                  <Tab projectId={match.params.projectId} menu={'New Challenge'} />,
                  <FooterContainer />
                )()} />
            )
          }
          <Route exact path='/challenges/:challengeId' component={ConnectRedirectToChallenge} />
          <Route
            path='/projects/:projectId/challenges/:challengeId'
            render={({ match }) => renderApp(
              <ChallengeEditor />,
              <TopBarContainer />,
              <Tab projectId={match.params.projectId} menu={'New Challenge'} />,
              <FooterContainer />
            )()} />
          <Route exact path='/projects/:projectId'
            render={({ match }) => renderApp(
              <ProjectEntry />,
              <TopBarContainer projectId={match.params.projectId} />,
              <Tab projectId={match.params.projectId} />,
              <FooterContainer />
            )()}
          />
          <Route exact path='/projects/:projectId/challenges'
            render={({ match }) => renderApp(
              <Challenges projectId={match.params.projectId} key='challenges' />,
              <TopBarContainer projectId={match.params.projectId} />,
              <Tab projectId={match.params.projectId} />,
              <FooterContainer />
            )()} />
          {/* If path is not defined redirect to landing page */}
          <Redirect to='/' />
        </Switch>}
      </React.Fragment>
    )
  }
}

mapStateToProps = ({ auth, projects }) => ({
  ...auth,
  projectDetail: projects.projectDetail,
  hasProjectAccess: projects.hasProjectAccess
})

mapDispatchToProps = {
  saveToken,
  loadOnlyProjectInfo
}

Routes.propTypes = {
  saveToken: PropTypes.func,
  loadOnlyProjectInfo: PropTypes.func,
  location: PropTypes.object,
  isLoggedIn: PropTypes.bool,
  token: PropTypes.string,
  history: PropTypes.object,
  projectDetail: PropTypes.object,
  hasProjectAccess: PropTypes.bool
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Routes))
