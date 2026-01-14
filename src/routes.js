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
import EngagementsList from './containers/EngagementsList'
import ApplicationsList from './containers/ApplicationsList'
import EngagementFeedback from './containers/EngagementFeedback'
import { getFreshToken, decodeToken } from 'tc-auth-lib'
import { saveToken } from './actions/auth'
import { loadChallengeDetails } from './actions/challenges'
import { connect } from 'react-redux'
import {
  checkAllowedRoles,
  checkOnlyReadOnlyRoles,
  checkReadOnlyRoles,
  checkAdmin,
  checkCopilot
} from './util/tc'
import Users from './containers/Users'
import { isBetaMode, removeFromLocalStorage, saveToLocalStorage } from './util/localstorage'
import ProjectEditor from './containers/ProjectEditor'
import ProjectInvitations from './containers/ProjectInvitations'

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
  componentWillMount () {
    this.checkAuth()
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

  componentDidUpdate () {
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
  }

  render () {
    if (!this.props.isLoggedIn) {
      return null
    }

    const isAllowed = checkAllowedRoles(_.get(decodeToken(this.props.token), 'roles'))
    const isReadOnly = checkReadOnlyRoles(this.props.token)
    const isCopilot = checkCopilot(this.props.token)
    const isAdmin = checkAdmin(this.props.token)

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
          {(isCopilot || isAdmin) && (
            <Route
              exact
              path='/projects/:projectId/assets'
              render={({ match }) =>
                renderApp(
                  <ProjectAssets projectId={match.params.projectId} />,
                  <TopBarContainer />,
                  <Tab projectId={match.params.projectId} />,
                  <FooterContainer />
                )()
              }
            />
          )}
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
          <Route exact path='/projects/:projectId/engagements'
            render={({ match }) => renderApp(
              <EngagementsList projectId={match.params.projectId} />,
              <TopBarContainer projectId={match.params.projectId} />,
              <Tab projectId={match.params.projectId} />,
              <FooterContainer />
            )()} />
          {!isReadOnly && (
            <Route exact path='/projects/:projectId/engagements/new'
              render={({ match }) => renderApp(
                <EngagementEditor />,
                <TopBarContainer />,
                <Tab projectId={match.params.projectId} menu={'New Engagement'} />,
                <FooterContainer />
              )()} />
          )}
          <Route exact path='/projects/:projectId/engagements/:engagementId/applications'
            render={({ match }) => renderApp(
              <ApplicationsList projectId={match.params.projectId} engagementId={match.params.engagementId} />,
              <TopBarContainer projectId={match.params.projectId} />,
              <Tab projectId={match.params.projectId} menu={'Applications'} />,
              <FooterContainer />
            )()} />
          <Route exact path='/projects/:projectId/engagements/:engagementId/feedback'
            render={({ match }) => renderApp(
              <EngagementFeedback projectId={match.params.projectId} engagementId={match.params.engagementId} />,
              <TopBarContainer projectId={match.params.projectId} />,
              <Tab projectId={match.params.projectId} menu={'Feedback'} />,
              <FooterContainer />
            )()} />
          <Route path='/projects/:projectId/engagements/:engagementId'
            render={({ match }) => renderApp(
              <EngagementEditor />,
              <TopBarContainer />,
              <Tab projectId={match.params.projectId} menu={'Engagement'} />,
              <FooterContainer />
            )()} />
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

mapStateToProps = ({ auth }) => ({
  ...auth
})

mapDispatchToProps = {
  saveToken
}

Routes.propTypes = {
  saveToken: PropTypes.func,
  location: PropTypes.object,
  isLoggedIn: PropTypes.bool,
  token: PropTypes.string,
  history: PropTypes.object
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Routes))
