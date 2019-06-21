import React, { Component } from 'react'
import TagsField from '../TagsField'
import FinalDeliverablesField from '../FinalDeliverables-Field'
import StockArtsField from '../StockArts-Field'
import SubmssionVisibility from '../SubmissionVisibility-Field'
import MaximumSubmissionsField from '../MaximumSubmissions-Field'
import { CHALLENGE_TRACKS } from '../../../config/constants'
import styles from './TextEditor-Field.module.scss'
import PropTypes from 'prop-types'
import DescriptionField from '../Description-Field'

class TextEditorField extends Component {
  render () {
    const { keywords, challenge, onUpdateCheckbox, onUpdateInput, onUpdateDescription, onUpdateMultiSelect } = this.props
    const challengeTrack = challenge.track

    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <DescriptionField challenge={challenge} onUpdateDescription={onUpdateDescription} />
        </div>
        { challenge.submitTriggered && !challenge.description && <div className={styles.error}>Description is required field</div> }
        <TagsField keywords={keywords} challenge={challenge} onUpdateMultiSelect={onUpdateMultiSelect} />
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
  onUpdateDescription: PropTypes.func.isRequired,
  onUpdateMultiSelect: PropTypes.func.isRequired
}

export default TextEditorField
