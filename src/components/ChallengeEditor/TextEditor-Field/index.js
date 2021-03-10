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
      removeFileType,
      onUpdateDescription,
      onUpdateMultiSelect,
      shouldShowPrivateDescription,
      onUpdateMetadata,
      readOnly
    } = this.props
    const { addedNewPrivateDescription } = this.state
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
        {challenge.submitTriggered && (challenge.description || '').trim().length === 0 && (
          <div className={styles.error}>Public Specification is required</div>
        )}
        {!readOnly && shouldShowPrivateDescription && !showShowPrivateDescriptionField && (<div className={styles.button} onClick={this.addNewPrivateDescription}>
          <PrimaryButton text={'Add private specification'} type={'info'} />
        </div>)}
        {shouldShowPrivateDescription && showShowPrivateDescriptionField && (<div className={styles.title}>
          <span>Private specification</span>
          {!readOnly && (<div>
            <i>Access specification templates <a href='https://github.com/topcoder-platform-templates/specification-templates'>here</a></i>
          </div>)}
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
        <TagsField
          challengeTags={challengeTagsFiltered}
          challenge={challenge}
          onUpdateMultiSelect={onUpdateMultiSelect}
          readOnly={readOnly}
        />
        {challenge.trackId === CHALLENGE_TRACKS.DESIGN && (
          <React.Fragment>
            <FinalDeliverablesField
              challenge={challenge}
              onUpdateCheckbox={onUpdateCheckbox}
              addFileType={addFileType}
              removeFileType={removeFileType}
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
  shouldShowPrivateDescription: true,
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
  removeFileType: PropTypes.func,
  onUpdateMetadata: PropTypes.func,
  onUpdateDescription: PropTypes.func,
  onUpdateMultiSelect: PropTypes.func,
  shouldShowPrivateDescription: PropTypes.bool,
  readOnly: PropTypes.bool
}

export default TextEditorField
