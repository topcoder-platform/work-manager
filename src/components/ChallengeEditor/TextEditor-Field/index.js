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
import { PrimaryButton } from '../../Buttons'

class TextEditorField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      addedNewPrivateDescription: false
    }
    this.addNewPrivateDescription = this.addNewPrivateDescription.bind(this)
  }

  addNewPrivateDescription () {
    this.setState({ addedNewPrivateDescription: true })
  }

  render () {
    const {
      challengeTags,
      challenge,
      onUpdateCheckbox,
      onUpdateInput,
      onUpdateDescription,
      onBlurDescription,
      onUpdateMultiSelect
    } = this.props
    const { addedNewPrivateDescription } = this.state
    const challengeTrack = challenge.legacy
      ? challenge.legacy.track
      : challenge.track
    const challengeTagsFiltered = challengeTags.map(function (tag) {
      return { id: tag.name, name: tag.name }
    })
    const showShowPrivateDescriptionField = addedNewPrivateDescription || (challenge.privateDescription !== null && challenge.privateDescription !== undefined)

    return (
      <div className={styles.container}>
        {challenge.id && (<div className={styles.row}>
          <DescriptionField
            challenge={challenge}
            onUpdateDescription={onUpdateDescription}
            onBlurDescription={onBlurDescription}
            type='description'
          />
        </div>)}
        {!showShowPrivateDescriptionField && (<div className={styles.button} onClick={this.addNewPrivateDescription}>
          <PrimaryButton text={'Add private specification'} type={'info'} />
        </div>)}
        {showShowPrivateDescriptionField && (<div className={styles.title}>
          <span>Private specification</span>
          <i>
            This text will only be visible to Topcoder members that have
            registered for this challenge
          </i>
        </div>)}
        {showShowPrivateDescriptionField && challenge.id && (
          <div className={styles.row}>
            <DescriptionField
              isPrivate
              challenge={challenge}
              onUpdateDescription={onUpdateDescription}
              onBlurDescription={onBlurDescription}
              type='privateDescription'
            />
          </div>
        )}
        {challenge.submitTriggered && !challenge.description && (
          <div className={styles.error}>Description is required field</div>
        )}
        <TagsField
          challengeTags={challengeTagsFiltered}
          challenge={challenge}
          onUpdateMultiSelect={onUpdateMultiSelect}
        />
        {challengeTrack && challengeTrack === CHALLENGE_TRACKS.DESIGN && (
          <React.Fragment>
            <FinalDeliverablesField
              challenge={challenge}
              onUpdateCheckbox={onUpdateCheckbox}
            />
            <StockArtsField
              challenge={challenge}
              onUpdateCheckbox={onUpdateCheckbox}
            />
            <SubmssionVisibility
              challenge={challenge}
              onUpdateCheckbox={onUpdateCheckbox}
            />
            <MaximumSubmissionsField
              challenge={challenge}
              onUpdateCheckbox={onUpdateCheckbox}
              onUpdateInput={onUpdateInput}
            />
          </React.Fragment>
        )}
      </div>
    )
  }
}

TextEditorField.defaultProps = {
  challengeTags: [],
  onBlurDescription: () => {}
}

TextEditorField.propTypes = {
  challengeTags: PropTypes.arrayOf(PropTypes.object).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateCheckbox: PropTypes.func.isRequired,
  onUpdateInput: PropTypes.func.isRequired,
  onUpdateDescription: PropTypes.func.isRequired,
  onBlurDescription: PropTypes.func,
  onUpdateMultiSelect: PropTypes.func.isRequired
}

export default TextEditorField
