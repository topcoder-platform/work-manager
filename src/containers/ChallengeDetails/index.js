/**
 * Container to render challenge details page
 * If only challengeId is provided it fetches only challengeDetails
 * If submissionId is also provided it also fetches submissionDetails
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { get } from 'lodash'
import ChallengeDetailsComponent from '../../components/ChallengeDetailsComponent'
import { loadChallengeDetails, loadChallengeTypes } from '../../actions/challengeDetails'
import { loadSubmissionDetails, loadSubmissionArtifacts, switchTab } from '../../actions/submissionDetails'
import { loadChallengeSubmissions } from '../../actions/challengeSubmissions'

import Loader from '../../components/Loader'

class ChallengeDetails extends Component {
  componentDidMount () {
    const {
      loadChallengeDetails,
      loadChallengeTypes,
      loadChallengeSubmissions,
      loadSubmissionDetails,
      challengeId,
      submissionId,
      loadSubmissionArtifacts
    } = this.props

    loadChallengeDetails(challengeId)
    // Load submission details if on submission details page
    if (submissionId) {
      loadSubmissionDetails(submissionId)
      loadSubmissionArtifacts(submissionId)
    } else {
      loadChallengeSubmissions(challengeId)
    }
    loadChallengeTypes()
  }

  componentDidUpdate (prevProps, prevState) {
    const {
      loadSubmissionDetails,
      challengeSubmissionsChallengeId,
      loadChallengeSubmissions,
      loadSubmissionArtifacts,
      challengeId,
      submissionId
    } = this.props

    // If navigated to or from the submission details page
    if (prevProps.submissionId !== submissionId) {
      if (submissionId) {
        loadSubmissionDetails(submissionId)
        loadChallengeSubmissions(challengeId)
        loadSubmissionArtifacts(submissionId)
      } else {
        // if challenge submissions not loaded already
        if (challengeId !== challengeSubmissionsChallengeId) {
          loadChallengeSubmissions(challengeId)
        }
      }
    }
  }

  render () {
    const {
      challengeDetails,
      invalidChallenge,
      challengeId,
      challengeSubmissions,
      challengeTypes,
      submissionDetails,
      submissionId,
      isLoading,
      isSubmissionLoading,
      isChallengeSubmissionsLoading,
      userToken,
      isArtifactsLoading,
      submissionArtifacts,
      currentTab,
      switchTab
    } = this.props

    if (!isLoading && invalidChallenge) return <Redirect to='/' />

    const shouldWait = challengeId.toString() !== get(challengeDetails, 'challengeId', '').toString()

    return isLoading || shouldWait ? <Loader /> : (
      <ChallengeDetailsComponent
        challenge={challengeDetails}
        challengeTypes={challengeTypes}
        submissionId={submissionId}
        submissionDetails={submissionDetails}
        isSubmissionLoading={isSubmissionLoading}
        challengeSubmissions={challengeSubmissions}
        isChallengeSubmissionsLoading={isChallengeSubmissionsLoading}
        userToken={userToken}
        isArtifactsLoading={isArtifactsLoading}
        submissionArtifacts={submissionArtifacts}
        currentTab={currentTab}
        switchTab={switchTab}
      />
    )
  }
}

ChallengeDetails.propTypes = {
  challengeDetails: PropTypes.object,
  challengeTypes: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
  loadChallengeDetails: PropTypes.func,
  loadChallengeTypes: PropTypes.func,
  loadChallengeSubmissions: PropTypes.func,
  loadSubmissionDetails: PropTypes.func,
  loadSubmissionArtifacts: PropTypes.func,
  switchTab: PropTypes.func,
  challengeId: PropTypes.string,
  submissionId: PropTypes.string,
  challengeSubmissionsChallengeId: PropTypes.string,
  isChallengeSubmissionsLoading: PropTypes.bool,
  challengeSubmissions: PropTypes.arrayOf(PropTypes.object),
  isSubmissionLoading: PropTypes.bool,
  submissionDetails: PropTypes.object,
  isArtifactsLoading: PropTypes.bool,
  submissionArtifacts: PropTypes.object,
  currentTab: PropTypes.string,
  userToken: PropTypes.string,
  invalidChallenge: PropTypes.bool
}

const mapStateToProps = ({ auth, challengeDetails, challengeSubmissions, submissionDetails }) => ({
  ...challengeDetails,
  challengeSubmissionsChallengeId: challengeSubmissions.challengeId,
  challengeSubmissions: challengeSubmissions.challengeSubmissions,
  isChallengeSubmissionsLoading: challengeSubmissions.isLoading,
  submissionDetails: submissionDetails.submissionDetails,
  isSubmissionLoading: submissionDetails.isLoading,
  submissionArtifacts: submissionDetails.submissionArtifacts,
  isArtifactsLoading: submissionDetails.isLoading,
  currentTab: submissionDetails.currentTab,
  userToken: auth.token
})

const mapDispatchToProps = {
  loadChallengeDetails,
  loadChallengeTypes,
  loadChallengeSubmissions,
  loadSubmissionDetails,
  loadSubmissionArtifacts,
  switchTab
}

export default connect(mapStateToProps, mapDispatchToProps)(ChallengeDetails)
