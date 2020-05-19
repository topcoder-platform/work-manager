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
      addFileType,
      onUpdateDescription,
      onUpdateMultiSelect,
      shouldShowPrivateDescription,
      onUpdateMetadata,
      readOnly
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
            type='description'
            readOnly={readOnly}
          />
        </div>)}
        {!readOnly && shouldShowPrivateDescription && !showShowPrivateDescriptionField && (<div className={styles.button} onClick={this.addNewPrivateDescription}>
          <PrimaryButton text={'Add private specification'} type={'info'} />
        </div>)}
        {shouldShowPrivateDescription && showShowPrivateDescriptionField && (<div className={styles.title}>
          <span>Private specification</span>
          <i>
            This text will only be visible to Topcoder members that have
            registered for this challenge
          </i>
        </div>)}
        {shouldShowPrivateDescription && showShowPrivateDescriptionField && challenge.id && (
          <div className={styles.row}>
            <DescriptionField
              isPrivate
              challenge={challenge}
              onUpdateDescription={onUpdateDescription}
              type='privateDescription'
              readOnly={readOnly}
            />
          </div>
        )}
        {challenge.submitTriggered && !challenge.description && (
          <div className={styles.error}>Public Specification is required</div>
        )}
        <TagsField
          challengeTags={challengeTagsFiltered}
          challenge={challenge}
          onUpdateMultiSelect={onUpdateMultiSelect}
          readOnly={readOnly}
        />
        {challengeTrack && challengeTrack === CHALLENGE_TRACKS.DESIGN && (
          <React.Fragment>
            <FinalDeliverablesField
              challenge={challenge}
              onUpdateCheckbox={onUpdateCheckbox}
              addFileType={addFileType}
              readOnly={readOnly}
            />
            <StockArtsField
              challenge={challenge}
              onUpdateCheckbox={onUpdateMetadata}
              readOnly={readOnly}
            />
            <SubmssionVisibility
              challenge={challenge}
              onUpdateCheckbox={onUpdateMetadata}
              readOnly={readOnly}
            />
            <MaximumSubmissionsField
              challenge={challenge}
              onUpdateMetadata={onUpdateMetadata}
              readOnly={readOnly}
            />
          </React.Fragment>
        )}
      </div>
    )
  }
}

TextEditorField.defaultProps = {
  challengeTags: [],
  // TODO: For our first go-live, we're probably going to have this UI in production before the Community App work to display data from V5 is available. Only hide the UI elements for private description for now. Don't take out any code or functionality.
  shouldShowPrivateDescription: false,
  onUpdateMetadata: () => {},
  onUpdateCheckbox: () => {},
  addFileType: () => {},
  onUpdateDescription: () => {},
  onUpdateMultiSelect: () => {},
  readOnly: false
}

TextEditorField.propTypes = {
  challengeTags: PropTypes.arrayOf(PropTypes.object).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateCheckbox: PropTypes.func,
  addFileType: PropTypes.func,
  onUpdateMetadata: PropTypes.func,
  onUpdateDescription: PropTypes.func,
  onUpdateMultiSelect: PropTypes.func,
  shouldShowPrivateDescription: PropTypes.bool,
  readOnly: PropTypes.bool
}

export default TextEditorField
