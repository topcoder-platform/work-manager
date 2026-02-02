import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './Groups.module.scss'
import PrimaryButton from '../Buttons/PrimaryButton'
import Loader from '../Loader'
import AlertModal from '../Modal/AlertModal'

class Groups extends Component {
  constructor (props) {
    super(props)
    this.state = {
      groupName: '',
      groupDescription: '',
      selfRegister: false,
      privateGroup: true,
      uploadedFile: null,
      parsedHandlesEmails: [],
      validationResults: [],
      showValidationResults: false,
      isUploading: false,
      isCreating: false,
      errors: {},
      showSuccessModal: false,
      successGroupName: '',
      successMemberCount: 0
    }

    this.fileInputRef = React.createRef()

    this.handleGroupNameChange = this.handleGroupNameChange.bind(this)
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
    this.handleSelfRegisterChange = this.handleSelfRegisterChange.bind(this)
    this.handlePrivateGroupChange = this.handlePrivateGroupChange.bind(this)
    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleValidate = this.handleValidate.bind(this)
    this.handleReupload = this.handleReupload.bind(this)
    this.handleCreateGroup = this.handleCreateGroup.bind(this)
    this.renderValidationResults = this.renderValidationResults.bind(this)
    this.resetForm = this.resetForm.bind(this)
    this.handleSuccessModalClose = this.handleSuccessModalClose.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    const { searchResults, createSuccess, createError, isCreating } = nextProps

    if (this.props.searchResults !== searchResults) {
      this.setState({
        validationResults: Array.isArray(searchResults) ? searchResults : [],
        showValidationResults: true
      })
    }

    const createFinished = this.props.isCreating && !isCreating
    const createSucceeded = (!this.props.createSuccess && createSuccess) ||
      (createFinished && !createError)

    if (createSucceeded) {
      const matchedUserIds = this.getMatchedUserIds(this.state.validationResults)
      const successGroupName = this.state.groupName.trim()
      this.resetForm({
        showSuccessModal: true,
        successGroupName,
        successMemberCount: matchedUserIds.length
      })
    }

    if (this.props.createError !== createError && createError) {
      this.setState({ isCreating: false })
    }

    if (this.props.isCreating && !isCreating) {
      this.setState({ isCreating: false })
    }
  }

  resetForm (overrides = {}) {
    this.setState({
      groupName: '',
      groupDescription: '',
      selfRegister: false,
      privateGroup: true,
      uploadedFile: null,
      parsedHandlesEmails: [],
      validationResults: [],
      showValidationResults: false,
      isUploading: false,
      isCreating: false,
      errors: {},
      showSuccessModal: false,
      successGroupName: '',
      successMemberCount: 0,
      ...overrides
    })

    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = ''
    }
  }

  handleSuccessModalClose () {
    this.setState({
      showSuccessModal: false,
      successGroupName: '',
      successMemberCount: 0
    })
  }

  handleGroupNameChange (event) {
    const groupName = event.target.value
    this.setState((prevState) => ({
      groupName,
      errors: {
        ...prevState.errors,
        groupName: null,
        validation: null
      }
    }))
  }

  handleDescriptionChange (event) {
    const groupDescription = event.target.value
    this.setState((prevState) => ({
      groupDescription,
      errors: {
        ...prevState.errors,
        groupDescription: null,
        validation: null
      }
    }))
  }

  handleSelfRegisterChange (event) {
    this.setState({ selfRegister: event.target.checked })
  }

  handlePrivateGroupChange (event) {
    this.setState({ privateGroup: event.target.checked })
  }

  handleFileChange (event) {
    const file = event.target.files && event.target.files[0]
    if (!file) {
      return
    }

    this.setState((prevState) => ({
      uploadedFile: file,
      isUploading: true,
      validationResults: [],
      showValidationResults: false,
      errors: {
        ...prevState.errors,
        file: null,
        validation: null
      }
    }))

    const reader = new window.FileReader()
    reader.onload = (readEvent) => {
      const text = readEvent.target.result || ''
      const parsedHandlesEmails = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      this.setState({
        parsedHandlesEmails,
        isUploading: false
      })
    }
    reader.onerror = () => {
      this.setState((prevState) => ({
        isUploading: false,
        errors: {
          ...prevState.errors,
          file: 'Unable to read the uploaded file. Please try again.'
        }
      }))
    }
    reader.readAsText(file)
  }

  handleValidate () {
    const { groupName, parsedHandlesEmails } = this.state
    const errors = {}

    if (!groupName.trim()) {
      errors.groupName = 'Group name is required.'
    }

    if (!parsedHandlesEmails.length) {
      errors.file = 'Please upload a CSV/TXT file with at least one handle or email.'
    }

    if (Object.keys(errors).length > 0) {
      this.setState({ errors })
      return
    }

    this.setState({
      errors: {},
      validationResults: [],
      showValidationResults: false
    })

    this.props.bulkSearchUsers(parsedHandlesEmails).catch(() => null)
  }

  handleReupload () {
    this.setState({
      uploadedFile: null,
      parsedHandlesEmails: [],
      validationResults: [],
      showValidationResults: false,
      errors: {}
    })

    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = ''
    }
  }

  handleCreateGroup () {
    const {
      groupName,
      groupDescription,
      validationResults,
      selfRegister,
      privateGroup
    } = this.state
    const matchedUserIds = this.getMatchedUserIds(validationResults)
    const errors = {}

    if (!groupName.trim()) {
      errors.groupName = 'Group name is required.'
    }

    if (!groupDescription.trim()) {
      errors.groupDescription = 'Description is required.'
    }

    if (Object.keys(errors).length > 0) {
      this.setState((prevState) => ({
        errors: {
          ...prevState.errors,
          ...errors
        }
      }))
      return
    }

    if (!validationResults.length || matchedUserIds.length === 0) {
      this.setState((prevState) => ({
        errors: {
          ...prevState.errors,
          validation: 'Please validate at least one matching user before creating a group.'
        }
      }))
      return
    }

    this.setState((prevState) => ({
      isCreating: true,
      errors: {
        ...prevState.errors,
        validation: null
      }
    }))

    this.props.bulkCreateGroup(
      groupName.trim(),
      groupDescription.trim(),
      matchedUserIds,
      selfRegister,
      privateGroup
    ).catch(() => null)
  }

  getResultInput (result) {
    return result.input || result.handle || result.email || result.value || ''
  }

  getResultUserId (result) {
    return result.userId || result.userID || result.memberId || result.id || ''
  }

  isMatched (result) {
    if (typeof result.match === 'boolean') {
      return result.match
    }

    if (typeof result.matched === 'boolean') {
      return result.matched
    }

    return !!this.getResultUserId(result)
  }

  getMatchedUserIds (results) {
    return (results || [])
      .filter((result) => this.isMatched(result))
      .map((result) => this.getResultUserId(result))
      .filter(Boolean)
  }

  renderValidationResults () {
    const { validationResults, showValidationResults } = this.state

    if (!showValidationResults) {
      return null
    }

    const sortedResults = [...(validationResults || [])].sort((a, b) => {
      const aMatch = this.isMatched(a) ? 1 : 0
      const bMatch = this.isMatched(b) ? 1 : 0
      return aMatch - bMatch
    })

    const matchedCount = sortedResults.filter((result) => this.isMatched(result)).length
    const totalCount = sortedResults.length
    const notMatchedCount = totalCount - matchedCount

    return (
      <div className={styles.validationResults}>
        <div className={styles.summaryText}>
          Validation Results:{' '}
          <span className={styles.matched}>{matchedCount} matched</span>,{' '}
          <span className={styles.notMatched}>{notMatchedCount} not matched</span>{' '}
          out of {totalCount} total
        </div>
        {totalCount > 0 && (
          <table className={styles.validationTable}>
            <thead>
              <tr>
                <th scope='col'>Input</th>
                <th scope='col'>User ID</th>
                <th scope='col'>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result, index) => {
                const matched = this.isMatched(result)
                const inputValue = this.getResultInput(result) || '-'
                const userId = this.getResultUserId(result)
                const statusText = matched ? '\u2713 Matched' : '\u2717 Not Found'

                return (
                  <tr key={`validation-result-${index}`}>
                    <td>{inputValue}</td>
                    <td>{matched ? userId : 'Not Found'}</td>
                    <td className={matched ? styles.matched : styles.notMatched}>{statusText}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  render () {
    const {
      groupName,
      groupDescription,
      selfRegister,
      privateGroup,
      showValidationResults,
      isUploading,
      isCreating,
      showSuccessModal,
      successGroupName,
      successMemberCount,
      errors
    } = this.state
    const { isSearching, searchError, createError, auth, token } = this.props

    const matchedUserIds = this.getMatchedUserIds(this.state.validationResults)
    const isCreatingInFlight = this.props.isCreating || isCreating
    const canCreate = showValidationResults && matchedUserIds.length > 0
    const apiError = searchError || createError
    const showLoader = isUploading || isCreatingInFlight
    const hasAuth = Boolean(auth && auth.user)
    const hasToken = Boolean(token)

    return (
      <div
        className={styles.contentContainer}
        data-has-auth={hasAuth}
        data-has-token={hasToken}
      >
        <h2 className={styles.title}>Create Group</h2>

        {showSuccessModal && (
          <AlertModal
            title='Success'
            message={`${successGroupName} group created successfully and ${successMemberCount} members added`}
            closeText='OK'
            onClose={this.handleSuccessModalClose}
          />
        )}

        {apiError && (
          <div className={styles.errorMessage} role='alert'>
            {apiError}
          </div>
        )}

        <div className={cn(styles.row)}>
          <div className={cn(styles.field, styles.input1)}>
            <label htmlFor='groupName'>
              Group Name <span className={styles.required}>*</span>
            </label>
          </div>
          <div className={cn(styles.field, styles.input2)}>
            <input
              id='groupName'
              name='groupName'
              type='text'
              value={groupName}
              onChange={this.handleGroupNameChange}
            />
            {errors.groupName && (
              <div className={styles.fieldError}>{errors.groupName}</div>
            )}
          </div>
        </div>

        <div className={cn(styles.row)}>
          <div className={cn(styles.field, styles.input1)}>
            <label htmlFor='groupDescription'>
              Description <span className={styles.required}>*</span>
            </label>
          </div>
          <div className={cn(styles.field, styles.input2)}>
            <textarea
              id='groupDescription'
              name='groupDescription'
              value={groupDescription}
              onChange={this.handleDescriptionChange}
            />
            {errors.groupDescription && (
              <div className={styles.fieldError}>{errors.groupDescription}</div>
            )}
          </div>
        </div>

        <div className={cn(styles.row)}>
          <div className={cn(styles.field, styles.input1)}>
            <label>Group Options</label>
          </div>
          <div className={cn(styles.field, styles.input2)}>
            <div className={styles.checkboxGroup}>
              <div className={styles.tcCheckbox}>
                <input
                  id='selfRegister'
                  name='selfRegister'
                  type='checkbox'
                  checked={selfRegister}
                  onChange={this.handleSelfRegisterChange}
                />
                <label htmlFor='selfRegister'>
                  <div className={styles.checkboxLabel}>Self Registration</div>
                </label>
              </div>
              <div className={styles.tcCheckbox}>
                <input
                  id='privateGroup'
                  name='privateGroup'
                  type='checkbox'
                  checked={privateGroup}
                  onChange={this.handlePrivateGroupChange}
                />
                <label htmlFor='privateGroup'>
                  <div className={styles.checkboxLabel}>Private</div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(styles.row)}>
          <div className={cn(styles.field, styles.input1)}>
            <label htmlFor='groupFile'>
              Upload User List (CSV/TXT) <span className={styles.required}>*</span>
            </label>
          </div>
          <div className={cn(styles.field, styles.input2)}>
            <input
              id='groupFile'
              name='groupFile'
              type='file'
              accept='.txt,.csv'
              ref={this.fileInputRef}
              onChange={this.handleFileChange}
              className={styles.fileUpload}
              aria-label='Upload user list file'
            />
            <span className={styles.helperText}>One handle or email per line</span>
            {errors.file && (
              <div className={styles.fieldError}>{errors.file}</div>
            )}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          {isSearching ? (
            <div className={styles.validateSpinner} aria-live='polite' aria-busy='true'>
              <Loader classsName={styles.validateLoader} />
            </div>
          ) : (
            <PrimaryButton
              text='Validate'
              type='info'
              onClick={this.handleValidate}
              disabled={isSearching || isUploading}
            />
          )}
          {showValidationResults && (
            <PrimaryButton
              text='Re-upload File'
              type='info'
              onClick={this.handleReupload}
              disabled={isSearching || isUploading || isCreatingInFlight}
            />
          )}
          <PrimaryButton
            text='Create Group'
            type='success'
            onClick={this.handleCreateGroup}
            disabled={!canCreate || isSearching || isCreatingInFlight}
          />
        </div>

        {errors.validation && (
          <div className={styles.fieldError}>{errors.validation}</div>
        )}

        {showLoader && <Loader classsName={styles.loader} />}

        {this.renderValidationResults()}
      </div>
    )
  }
}

Groups.propTypes = {
  auth: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  isSearching: PropTypes.bool,
  searchResults: PropTypes.arrayOf(PropTypes.object),
  searchError: PropTypes.string,
  isCreating: PropTypes.bool,
  createError: PropTypes.string,
  createSuccess: PropTypes.bool,
  bulkSearchUsers: PropTypes.func.isRequired,
  bulkCreateGroup: PropTypes.func.isRequired
}

export default Groups
