/**
 * Container to provide user info to TopBar component
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { loadUser } from '../../actions/auth'
import { setActiveProject } from '../../actions/sidebar'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import TopBar from '../../components/TopBar'

class TopbarContainer extends Component {
  componentDidMount () {
    this.props.loadUser()

    const { projectId, activeProjectId } = this.props

    if (projectId && activeProjectId < 0) {
      this.props.setActiveProject(parseInt(projectId))
    }
  }

  render () {
    return <TopBar auth={this.props.auth} />
  }
}

TopbarContainer.propTypes = {
  loadUser: PropTypes.func.isRequired,
  setActiveProject: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  activeProjectId: PropTypes.number,
  projectId: PropTypes.string
}

const mapStateToProps = ({ auth }) => ({
  auth
})

const mapDispatchToProps = {
  loadUser,
  setActiveProject
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopbarContainer))
