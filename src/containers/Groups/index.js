import React, { Component } from 'react'
import { connect } from 'react-redux'
import PT from 'prop-types'
import { withRouter } from 'react-router-dom'
import GroupsComponent from '../../components/Groups'
import { bulkCreateGroup, bulkSearchMembers } from '../../actions/groups'

class Groups extends Component {
  render () {
    const {
      auth,
      token,
      isSearching,
      searchResults,
      searchError,
      isCreating,
      createError,
      createSuccess,
      createdGroup,
      bulkSearchUsers,
      bulkCreateGroup,
      onCreateSuccess,
      onSuccessModalClose,
      history
    } = this.props

    return (
      <GroupsComponent
        auth={auth}
        token={token}
        isSearching={isSearching}
        searchResults={searchResults}
        searchError={searchError}
        isCreating={isCreating}
        createError={createError}
        createSuccess={createSuccess}
        createdGroup={createdGroup}
        bulkSearchUsers={bulkSearchUsers}
        bulkCreateGroup={bulkCreateGroup}
        onCreateSuccess={onCreateSuccess}
        onSuccessModalClose={onSuccessModalClose}
        history={history}
      />
    )
  }
}

const mapStateToProps = ({ groups = {}, auth }) => ({
  auth,
  token: auth.token,
  isSearching: groups.isSearching,
  searchResults: groups.validationResults,
  searchError: groups.searchError,
  isCreating: groups.isCreating,
  createError: groups.createError,
  createSuccess: groups.createSuccess,
  createdGroup: groups.createdGroup
})

const mapDispatchToProps = (dispatch) => ({
  bulkSearchUsers: (handlesEmails) => dispatch(bulkSearchMembers(handlesEmails)),
  bulkCreateGroup: (name, description, userIds, selfRegister, privateGroup) =>
    dispatch(bulkCreateGroup(name, description, userIds, selfRegister, privateGroup))
})

Groups.propTypes = {
  auth: PT.object.isRequired,
  token: PT.string.isRequired,
  isSearching: PT.bool,
  searchResults: PT.arrayOf(PT.object),
  searchError: PT.string,
  isCreating: PT.bool,
  createError: PT.string,
  createSuccess: PT.bool,
  createdGroup: PT.shape({
    id: PT.oneOfType([PT.string, PT.number]),
    name: PT.string
  }),
  bulkSearchUsers: PT.func.isRequired,
  bulkCreateGroup: PT.func.isRequired,
  onCreateSuccess: PT.func,
  onSuccessModalClose: PT.func,
  history: PT.object.isRequired
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Groups))
