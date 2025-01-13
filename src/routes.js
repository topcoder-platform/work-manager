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
import ChallengeEditor from './containers/ChallengeEditor'
import { getFreshToken, decodeToken } from 'tc-auth-lib'
import { saveToken } from './actions/auth'
import { loadChallengeDetails } from './actions/challenges'
import { connect } from 'react-redux'
import { checkAllowedRoles, checkOnlyReadOnlyRoles, checkReadOnlyRoles } from './util/tc'
import { setCookie, removeCookie, isBetaMode } from './util/cookie'
import IdleTimer from 'react-idle-timer'
import modalStyles from './styles/modal.module.scss'
import ConfirmationModal from './components/Modal/ConfirmationModal'
import Users from './containers/Users'

const { ACCOUNTS_APP_LOGIN_URL, IDLE_TIMEOUT_MINUTES, IDLE_TIMEOUT_GRACE_MINUTES, COMMUNITY_APP_URL } = process.env

const theme = {
  container: modalStyles.modalContainer
}

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
    this.idleTimer = null
    this.handleOnIdle = this.handleOnIdle.bind(this)

    this.logoutIntervalRef = null
    this.state = {
      showIdleModal: false,
      logsoutIn: IDLE_TIMEOUT_GRACE_MINUTES * 60, // convert to seconds
      logoutIntervalRef: null
    }
  }

  componentWillMount () {
    this.checkAuth()
  }

  checkAuth () {
    // try to get a token and redirect to login page if it fails
    getFreshToken().then((token) => {
      this.props.saveToken(token)
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(error)
      } else {
        console.error('An unexpected error occurred while getting auth token')
      }
      const redirectBackToUrl = window.location.origin + this.props.location.pathname
      window.location = ACCOUNTS_APP_LOGIN_URL + '?retUrl=' + redirectBackToUrl
    })
  }

  componentDidUpdate () {
    const { search } = this.props.location
    const params = new URLSearchParams(search)
    if (!_.isEmpty(params.get('beta'))) {
      if (params.get('beta') === 'true' && !isBetaMode()) {
        setCookie(BETA_MODE_COOKIE_TAG, 'true')
      } else if (params.get('beta') === 'false' && isBetaMode()) {
        removeCookie(BETA_MODE_COOKIE_TAG)
      }
      this.props.history.push(this.props.location.pathname)
    }
  }

  handleOnIdle () {
    this.idleTimer.pause()
    const intervalId = setInterval(() => {
      const remaining = this.state.logsoutIn
      if (remaining > 0) {
        this.setState(state => ({ ...state, logsoutIn: remaining - 1 }))
      } else {
        window.location = `${COMMUNITY_APP_URL}/logout`
      }
    }, 1000)

    this.setState(state => ({ ...state, showIdleModal: true, logoutIntervalRef: intervalId }))
  }

  render () {
    if (!this.props.isLoggedIn) {
      return null
    }

    const isAllowed = checkAllowedRoles(_.get(decodeToken(this.props.token), 'roles'))
    const isReadOnly = checkReadOnlyRoles(this.props.token)
    const modal = (<ConfirmationModal
      theme={theme}
      title='Session Timeout'
      message={`You've been idle for quite sometime. You'll be automatically logged out in ${this.state.logsoutIn >= 60 ? Math.ceil(this.state.logsoutIn / 60) + ' minute(s).' : this.state.logsoutIn + ' second(s)'}`}
      confirmText='Logout Now'
      cancelText='Resume Session'
      onCancel={() => {
        clearInterval(this.state.logoutIntervalRef)
        if (this.idleTimer.isIdle()) {
          this.idleTimer.resume()
          this.idleTimer.reset()
          this.setState(state => ({
            ...state, showIdleModal: false, logsoutIn: IDLE_TIMEOUT_GRACE_MINUTES * 60
          }))
        }
      }}
      onConfirm={() => {
        window.location = `${COMMUNITY_APP_URL}/logout`
      }}
    />)

    return (
      <IdleTimer ref={ref => { this.idleTimer = ref }} timeout={1000 * 60 * IDLE_TIMEOUT_MINUTES} onIdle={this.handleOnIdle} debounce={250}>
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
              <Challenges menu='NULL' key='projects' />,
              <TopBarContainer />,
              <Tab />,
              <FooterContainer />
            )()}
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
          <Route exact path='/self-service'
            render={() => renderApp(
              <Challenges selfService />,
              <TopBarContainer />,
              <Tab selfService />,
              <FooterContainer />
            )()}
          />
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
        {this.state.showIdleModal && modal}
      </IdleTimer>
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
