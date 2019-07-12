/**
 * Container to render Challenges page
 */
// import _ from 'lodash'
import React, { Component } from 'react'
// import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { SIDEBAR_MENU, CHALLENGE_STATUS } from '../../config/constants'
import ChallengesComponent from '../../components/ChallengesComponent'
import { loadChallenges, setFilterChallengeName } from '../../actions/challenges'
import { resetSidebarActiveParams } from '../../actions/sidebar'

class Challenges extends Component {
  constructor (props) {
    super(props)
    this.state = {
      projectChanged: false
    }
  }
  componentDidMount () {
    const { activeMenu, activeProjectId, filterChallengeName, resetSidebarActiveParams, menu, projectId } = this.props
    if (menu === 'NULL' && (activeMenu !== '' || activeProjectId !== -1)) {
      resetSidebarActiveParams()
    } else {
      const status = menu === SIDEBAR_MENU.ACTIVE_CHALLENGES ? CHALLENGE_STATUS.ACTIVE : ''
      const id = activeProjectId > 0 ? activeProjectId : parseInt(projectId)
      this.props.loadChallenges(id, status, filterChallengeName)
    }
  }

  componentWillReceiveProps (nextProps) {
    let resetFilterChallengeName = false
    const { activeMenu, projectId, activeProjectId, filterChallengeName, setFilterChallengeName } = nextProps
    const { activeMenu: oldActiveMenu, projectId: oldProjectId, activeProjectId: oldActiveProjectId, filterChallengeName: oldFilterChallengeName } = this.props
    const status = activeMenu === SIDEBAR_MENU.ACTIVE_CHALLENGES ? CHALLENGE_STATUS.ACTIVE : ''
    if (activeMenu !== oldActiveMenu || projectId !== oldProjectId || activeProjectId !== oldActiveProjectId || filterChallengeName !== oldFilterChallengeName) {
      if (projectId !== oldProjectId) {
        this.setState({ projectChanged: true })
        resetFilterChallengeName = true
      } else if (activeProjectId !== oldActiveProjectId) {
        this.setState({ projectChanged: true })
        resetFilterChallengeName = true
      }

      if (activeMenu !== oldActiveMenu) resetFilterChallengeName = true

      if (resetFilterChallengeName && filterChallengeName !== '') {
        setFilterChallengeName('')
      } else {
        this.props.loadChallenges(activeProjectId, status, filterChallengeName)
      }
    } else {
      this.setState({ projectChanged: false })
    }
  }

  render () {
    const { challenges, isLoading, activeMenu, warnMessage, setFilterChallengeName, filterChallengeName } = this.props
    return (
      <ChallengesComponent
        warnMessage={warnMessage}
        challenges={challenges}
        isLoading={isLoading}
        activeMenu={activeMenu}
        setFilterChallengeName={setFilterChallengeName}
        filterChallengeName={filterChallengeName}
      />
    )
  }
}

Challenges.propTypes = {
  menu: PropTypes.string,
  challenges: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
  loadChallenges: PropTypes.func,
  activeMenu: PropTypes.string,
  projectId: PropTypes.string,
  activeProjectId: PropTypes.number,
  warnMessage: PropTypes.string,
  filterChallengeName: PropTypes.string,
  setFilterChallengeName: PropTypes.func,
  resetSidebarActiveParams: PropTypes.func
}

const mapStateToProps = ({ challenges, sidebar }) => ({
  ...challenges,
  activeMenu: sidebar.activeMenu,
  activeProjectId: sidebar.activeProjectId
})

const mapDispatchToProps = {
  loadChallenges,
  setFilterChallengeName,
  resetSidebarActiveParams
}

export default connect(mapStateToProps, mapDispatchToProps)(Challenges)
