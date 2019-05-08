/**
 * Component to define routes of the app
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Redirect, Route, Switch, withRouter } from 'react-router-dom'
import renderApp from './components/App'
import TopBarContainer from './containers/TopbarContainer'
import Sidebar from './containers/Sidebar'
import ChallengeList from './containers/Challenges'
import CreateNewChallenge from './containers/CreateNewChallenge'
import ChallengeDetails from './containers/ChallengeDetails'
import { getFreshToken } from 'tc-accounts'
import { ACCOUNTS_APP_LOGIN_URL, SIDEBAR_MENU } from './config/constants'
import { saveToken } from './actions/auth'
import { connect } from 'react-redux'

class Routes extends React.Component {
  componentWillMount () {
    this.checkAuth()
  }

  checkAuth () {
    // try to get a token and redirect to login page if it fails
    getFreshToken().then((token) => {
      this.props.saveToken(token)
    }).catch((error) => {
      console.error(error)
      const redirectBackToUrl = window.location.origin + this.props.location.pathname
      window.location = ACCOUNTS_APP_LOGIN_URL + '?retUrl=' + redirectBackToUrl
    })
  }

  render () {
    if (!this.props.isLoggedIn) {
      return null
    }

    return (
      <Switch>
        <Route exact path='/'
          render={() => renderApp(
            <ChallengeList menu='NULL' />,
            <TopBarContainer />,
            <Sidebar />
          )()}
        />
        <Route exact path='/challenges/:challengeId(\d{8}|\d{5})'
          render={({ match }) => renderApp(
            <ChallengeDetails challengeId={match.params.challengeId} />,
            <TopBarContainer />,
            <Sidebar />
          )()} />
        <Route exact path='/challenges/:challengeId(\d{8}|\d{5})/submissions/:submissionId'
          render={({ match }) => renderApp(
            <ChallengeDetails challengeId={match.params.challengeId} submissionId={match.params.submissionId} />,
            <TopBarContainer />,
            <Sidebar />
          )()} />
        <Route exact path='/projects/:projectId/challenges/active'
          render={({ match }) => renderApp(
            <ChallengeList menu={SIDEBAR_MENU.ACTIVE_CHALLENGES} projectId={match.params.projectId} />,
            <TopBarContainer />,
            <Sidebar />
          )()} />
        <Route exact path='/projects/:projectId/challenges/all'
          render={({ match }) => renderApp(
            <ChallengeList menu={SIDEBAR_MENU.ALL_CHALLENGES} projectId={match.params.projectId} />,
            <TopBarContainer />,
            <Sidebar />
          )()} />
        <Route exact path='/projects/:projectId/challenges/new' render={renderApp(<CreateNewChallenge />, <TopBarContainer />, <Sidebar />)} />
        <Route exact path='/projects/:projectId/challenges/:challengeId/edit' render={renderApp(<CreateNewChallenge />, <TopBarContainer />, <Sidebar />)} />
        {/* If path is not defined redirect to landing page */}
        <Redirect to='/' />
      </Switch>
    )
  }
}

const mapStateToProps = ({ auth }) => ({
  ...auth
})

const mapDispatchToProps = {
  saveToken
}

Routes.propTypes = {
  saveToken: PropTypes.func,
  location: PropTypes.object,
  isLoggedIn: PropTypes.bool
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Routes))
