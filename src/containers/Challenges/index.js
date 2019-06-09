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
import { loadChallenges } from '../../actions/challenges'

class Challenges extends Component {
  constructor (props) {
    super(props)
    this.state = {
      projectChanged: false
    }
  }
  componentDidMount () {
    const { activeMenu, activeProjectId } = this.props
    const status = activeMenu === SIDEBAR_MENU.ACTIVE_CHALLENGES ? CHALLENGE_STATUS.ACTIVE : ''
    this.props.loadChallenges(activeProjectId, status)
  }

  componentWillReceiveProps (nextProps) {
    const { activeMenu, projectId, activeProjectId } = nextProps
    const { activeMenu: oldActiveMenu, projectId: oldProjectId, activeProjectId: oldActiveProjectId } = this.props
    if (activeMenu !== oldActiveMenu || projectId !== oldProjectId || activeProjectId !== oldActiveProjectId) {
      const status = activeMenu === SIDEBAR_MENU.ACTIVE_CHALLENGES ? CHALLENGE_STATUS.ACTIVE : ''
      this.props.loadChallenges(activeProjectId, status)
      if (projectId !== oldProjectId) {
        this.setState({ projectChanged: true })
      } else if (activeProjectId !== oldActiveProjectId) {
        this.setState({ projectChanged: true })
      }
    } else {
      this.setState({ projectChanged: false })
    }
  }

  render () {
    const { challenges, isLoading, activeProjectId, projectId, activeMenu, menu } = this.props
    const { projectChanged } = this.state
    if (projectChanged && (menu !== activeMenu || projectId !== activeProjectId.toString())) {
      // return <Redirect to={{ pathname: `/projects/${activeProjectId}/challenges/active` }} />
    }

    return (
      <ChallengesComponent challenges={challenges} isLoading={isLoading} activeMenu={activeMenu} />
    )
  }
}

Challenges.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
  loadChallenges: PropTypes.func,
  activeMenu: PropTypes.string,
  projectId: PropTypes.string,
  activeProjectId: PropTypes.number,
  menu: PropTypes.string
}

const mapStateToProps = ({ challenges, sidebar }) => ({
  ...challenges,
  activeMenu: sidebar.activeMenu,
  activeProjectId: sidebar.activeProjectId
})

const mapDispatchToProps = {
  loadChallenges
}

export default connect(mapStateToProps, mapDispatchToProps)(Challenges)
