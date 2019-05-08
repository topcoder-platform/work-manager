/**
 * Container to provide user info to TopBar component
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { loadUser } from '../../actions/auth'
import { connect } from 'react-redux'
import TopBar from '../../components/TopBar'

class TopbarContainer extends Component {
  componentDidMount () {
    this.props.loadUser()
  }

  render () {
    const { user } = this.props.auth
    return <TopBar user={user} />
  }
}

TopbarContainer.propTypes = {
  loadUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = ({ auth }) => ({
  auth
})

const mapDispatchToProps = {
  loadUser
}

export default connect(mapStateToProps, mapDispatchToProps)(TopbarContainer)
