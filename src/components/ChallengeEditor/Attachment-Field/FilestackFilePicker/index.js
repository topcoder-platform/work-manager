/**
 * components.page.challenge-details.FilestackFilePicker
 * <FilePicker> Component
 *
 * Description:
 *   Component for uploading a file using Filestack Picker
 *   and Drag + Drop.  Does not store the file contents in form.  Instead,
 *   uploads file to S3 storage container and sets the
 *   S3 storage details to Redux store for submission.
 */
/* eslint-env browser */

import _ from 'lodash'
import React from 'react'
import PT from 'prop-types'
import { client as filestack } from 'filestack-react'
import { PrimaryButton } from '../../../Buttons'
import styles from './styles.module.scss'

const {
  FILESTACK
} = process.env

/**
 * FilestackFilePicker component
 */
class FilestackFilePicker extends React.Component {
  constructor (props) {
    super(props)
    this.onSuccess = this.onSuccess.bind(this)
    this.onClickPick = this.onClickPick.bind(this)
    this.onUpdateInputUrl = this.onUpdateInputUrl.bind(this)
    this.fireErrorMessage = this.fireErrorMessage.bind(this)
    this.setUploadProgress = this.setUploadProgress.bind(this)
    this.setDragged = this.setDragged.bind(this)
    this.generateFilePath = this.generateFilePath.bind(this)

    this.state = {
      inputUrl: '',
      invalidUrl: false,
      error: '',
      uploadProgress: null,
      dragged: false
    }
  }

  componentDidMount () {
    this.filestack = filestack.init(FILESTACK.API_KEY)
  }

  fireErrorMessage (error) {
    this.setState(error)
  }

  setUploadProgress (uploadProgress) {
    this.setState({ uploadProgress })
  }

  setDragged (dragged) {
    this.setState({ dragged })
  }

  /* Called when a file is successfully stored in the S3 container */
  onSuccess (file) {
    const {
      mimetype,
      size,
      key,
      container,
      source,
      originalPath
    } = file
    const {
      challengeId
    } = this.props
    // container doesn't seem to get echoed from Drag and Drop
    const cont = container || FILESTACK.SUBMISSION_CONTAINER
    // In case of url we need to submit the original url not the S3
    const fileUrl =
      source === 'url'
        ? originalPath
        : `https://s3.amazonaws.com/${key}`

    const fileStackData = {
      challengeId,
      fileUrl,
      mimetype,
      size,
      key,
      container: cont
    }

    console.log('totest fileStackData', fileStackData)
  }

  onClickPick () {
    const { inputUrl } = this.state

    if (this.isValidUrl(inputUrl)) {
      this.setState({ invalidUrl: false })
      const filename = inputUrl.substring(inputUrl.lastIndexOf('/') + 1)
      this.setDragged(false)
      this.onSuccess(
        {
          source: 'url',
          filename,
          mimetype: '',
          size: 0,
          key: '',
          originalPath: inputUrl
        }
      )
    } else {
      this.setState({ invalidUrl: true })
    }
  }

  onUpdateInputUrl (e) {
    this.setState({ inputUrl: e.target.value })
  }

  /* eslint-disable class-methods-use-this */
  isValidUrl (url) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      url
    ) /* eslint-disable-line no-useless-escape */
  }

  /**
   * Returns the path where the picked up file should be stored.
   *
   * @params (String) fileName file name
   * @return {String}
   */
  generateFilePath (fileName = null) {
    const { challengeId } = this.props
    let fileNameTmp = fileName
    if (!fileNameTmp) {
      return `${challengeId}/`
    }
    return `${challengeId}/${fileNameTmp}`
  }

  render () {
    const {
      mandatory
    } = this.props

    const { error, uploadProgress, dragged } = this.state
    return (
      <div className={styles.container}>
        {mandatory && (<div className={styles.desc}>
          <p className={styles.mandatory}>*mandatory</p>
        </div>)}
        <div
          className={`${styles['file-picker']} ${error ? styles.error : ''} ${dragged ? styles.drag : ''}`}
        >
          <p>
            Drag and drop your file here.
          </p>
          <span className={styles.or}>
            or
          </span>
          {_.isNumber(uploadProgress) && uploadProgress < 100 ? (
            <p className={styles['file-name']}>
              Uploading:
              {uploadProgress}%
            </p>
          ) : null}
          <div className={styles.button}>
            <PrimaryButton onClick={this.onClickPick} text='Pick a File' type='info' />
          </div>
          <div
            onClick={() => {
              const path = this.generateFilePath()
              this.filestack
                .picker({
                  fromSources: [
                    'local_file_system',
                    'googledrive',
                    'dropbox',
                    'onedrive',
                    'github',
                    'url'
                  ],
                  maxSize: 500 * 1024 * 1024,
                  onFileUploadFailed: () => this.setDragged(false),
                  onFileUploadFinished: (file) => {
                    this.setDragged(false)
                    this.onSuccess(file)
                  },
                  startUploadingWhenMaxFilesReached: true,
                  storeTo: {
                    container: FILESTACK.SUBMISSION_CONTAINER,
                    path,
                    region: FILESTACK.REGION
                  }
                })
                .open()
            }}
            onKeyPress={() => {
              const path = this.generateFilePath()
              this.filestack
                .picker({
                  fromSources: [
                    'local_file_system',
                    'googledrive',
                    'dropbox',
                    'onedrive',
                    'github',
                    'url'
                  ],
                  maxSize: 500 * 1024 * 1024,
                  onFileUploadFailed: () => this.setDragged(false),
                  onFileUploadFinished: (file) => {
                    this.setDragged(false)
                    this.onSuccess(file)
                  },
                  startUploadingWhenMaxFilesReached: true,
                  storeTo: {
                    container: FILESTACK.SUBMISSION_CONTAINER,
                    path,
                    region: FILESTACK.REGION
                  }
                })
                .open()
            }}
            onDragEnter={() => this.setDragged(true)}
            onDragLeave={() => this.setDragged(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              this.setDragged(false)
              e.preventDefault()
              const path = this.generateFilePath(e.dataTransfer.files[0].name)
              this.setUploadProgress(0)
              this.filestack
                .upload(
                  e.dataTransfer.files[0],
                  {
                    onProgress: ({ totalPercent }) => {
                      this.setUploadProgress(totalPercent)
                    },
                    progressInterval: 1000
                  },
                  {
                    container: FILESTACK.SUBMISSION_CONTAINER,
                    path,
                    region: FILESTACK.REGION
                  }
                )
                .then((file) => this.onSuccess(file))
              return undefined
            }}
            role='tab'
            className={styles['drop-zone-mask']}
            tabIndex={0}
            aria-label='Select file to upload'
          />
        </div>
        {error && <div className={styles['error-container']}>{error}</div>}
      </div>
    )
  }
}

FilestackFilePicker.defaultProps = {
  mandatory: false
}

/**
 * Prop Validation
 */
FilestackFilePicker.propTypes = {
  challengeId: PT.string.isRequired,
  mandatory: PT.bool
}

export default FilestackFilePicker
