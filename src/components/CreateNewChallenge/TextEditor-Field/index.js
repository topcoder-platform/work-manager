import React, { Component } from 'react'
import TechAndPlatformField from '../TechAndPlatform-Field'
import FinalDeliverablesField from '../FinalDeliverables-Field'
import StockArtsField from '../StockArts-Field'
import SubmssionVisibility from '../SubmissionVisibility-Field'
import MaximumSubmissionsField from '../MaximumSubmissions-Field'
import { CHALLENGE_TRACKS } from '../../../config/constants'
import styles from './TextEditor-Field.module.scss'
import PropTypes from 'prop-types'

class TextEditorField extends Component {
  render () {
    const { keywords, challenge, onUpdateCheckbox, onUpdateInput, onUpdateMultiSelect } = this.props
    const challengeTrack = challenge.track

    return (
      <div className={styles.container}>
        {
          challengeTrack && (challengeTrack === CHALLENGE_TRACKS.DEVELOP || challengeTrack === CHALLENGE_TRACKS.QA) && (
            <TechAndPlatformField keywords={keywords} challenge={challenge} onUpdateMultiSelect={onUpdateMultiSelect} />
          )
        }
        {
          challengeTrack && challengeTrack === CHALLENGE_TRACKS.DESIGN && (
            <React.Fragment>
              <FinalDeliverablesField challenge={challenge} onUpdateCheckbox={onUpdateCheckbox} />
              <StockArtsField challenge={challenge} onUpdateCheckbox={onUpdateCheckbox} />
              <SubmssionVisibility challenge={challenge} onUpdateCheckbox={onUpdateCheckbox} />
              <MaximumSubmissionsField challenge={challenge} onUpdateCheckbox={onUpdateCheckbox} onUpdateInput={onUpdateInput} />
            </React.Fragment>
          )
        }
      </div>
    )
  }
}

TextEditorField.propTypes = {
  keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateCheckbox: PropTypes.func.isRequired,
  onUpdateInput: PropTypes.func.isRequired,
  onUpdateMultiSelect: PropTypes.func.isRequired
}

export default TextEditorField
