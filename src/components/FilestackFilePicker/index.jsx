/**
 * FilestackFilePicker Component
 *
 * Component for uploading files using Filestack Picker and Drag & Drop.
 * - Supports multiple file uploading.
 */
import _ from 'lodash'
import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import PT from 'prop-types'
import * as filestack from 'filestack-js'
import cn from 'classnames'
import {
  FILE_PICKER_API_KEY,
  FILE_PICKER_CNAME,
  FILE_PICKER_FROM_SOURCES,
  FILE_PICKER_REGION,
  FILE_PICKER_CONTAINER_NAME,
  FILE_PICKER_ACCEPT,
  FILE_PICKER_MAX_SIZE,
  FILE_PICKER_MAX_FILES,
  FILE_PICKER_PROGRESS_INTERVAL,
  FILE_PICKER_UPLOAD_RETRY,
  FILE_PICKER_UPLOAD_TIMEOUT
} from '../../config/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import styles from './FilestackFilePicker.module.scss'

const initialState = []

const ACTION = {
  UPDATE_FILE: 'UPDATE_FILE',
  SET_FILES: 'SET_FILES',
  CLEAR_FILES: 'CLEAR_FILES'
}

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION.UPDATE_FILE: {
      const { filename, updated } = action.payload
      const uploadingFileIndex = _.findIndex(state, { filename })

      if (uploadingFileIndex > -1) {
        const updatedFile = {
          ...state[uploadingFileIndex],
          ...updated
        }

        const newState = [
          ...state.slice(0, uploadingFileIndex),
          updatedFile,
          ...state.slice(uploadingFileIndex + 1)
        ]

        return newState
      }

      return state
    }

    case ACTION.SET_FILES: {
      return action.payload
    }

    case ACTION.CLEAR_FILES: {
      return initialState
    }

    default:
      throw new Error()
  }
}

/**
 * FilestackFilePicker component
 */
const FilestackFilePicker = ({
  path,
  onFileUploadFinished,
  onFileUploadFailed,
  onUploadDone
}) => {
  // the list of filenames which are currently being uploaded
  // we cannot utilize `useState` here, because we need to update the items in the uploading files array at random points of time
  // if we use state, then it could happen, that 2 updates happen at the same time overriding results of each other.
  const [uploadingFiles, dispatch] = useReducer(reducer, initialState)
  // if something is currently dragged over the area
  const [dragged, setDragged] = useState(false)
  // Filestack client instance
  const filestackRef = useRef(null)

  // init Filestack (without waiting for rendering)
  useLayoutEffect(() => {
    filestackRef.current = filestack.init(FILE_PICKER_API_KEY, {
      cname: FILE_PICKER_CNAME
    })
  }, [])

  useEffect(() => {
    // if all files are fully loaded or error happens for them call `onUploadDone` callback
    if (
      uploadingFiles.length > 0 &&
      _.every(uploadingFiles, (file) => file.file || file.error)
    ) {
      if (onUploadDone) {
        const filesFailed = _.filter(uploadingFiles, 'error')
        const filesUploaded = _.filter(uploadingFiles, 'file')

        onUploadDone({
          filesFailed: _.map(filesFailed, 'error'),
          filesUploaded: _.map(filesUploaded, 'file')
        })
      }
    }

    // if all files have been uploaded successfully, clean uploading file list
    if (uploadingFiles.length > 0 && _.every(uploadingFiles, 'file')) {
      dispatch({ type: ACTION.CLEAR_FILES })
    }
  }, [uploadingFiles])

  /**
   * Handle for success file(s) uploading
   *
   * NOTE: this method used as callback in two different methods:
   *       `filestackRef.current.picker` and `filestackRef.current.upload`
   *       They call this method with slightly different arguments data.
   *       I've partially normalized the argument this method is called with,
   *       but not completely. So if you make any changes, test it using both
   *       methods of uploading: Drag & Drop and FileStack Picker (on click)
   *
   * @param {Object} file upload file info
   */
  const handleFileUploadSuccess = (file) => {
    dispatch({
      type: ACTION.UPDATE_FILE,
      payload: {
        filename: file.originalFile.name,
        updated: {
          file, // set `file` to indicate that file uploaded
          progress: 100 // make sure that progress is set to 100 when uploading is complete
        }
      }
    })
    onFileUploadFinished && onFileUploadFinished(file)
  }

  /**
   * Handle for error during file(s) uploading
   *
   * NOTE: this method used as callback in two different methods:
   *       `filestackRef.current.picker` and `filestackRef.current.upload`
   *       They call this method with slightly different arguments data.
   *       I've partially normalized the argument this method is called with,
   *       but not completely. So if you make any changes, test it using both
   *       methods of uploading: Drag & Drop and FileStack Picker (on click)
   *
   * @param {Object} error error during file uploading
   */
  const handleFileUploadError = (error) => {
    dispatch({
      type: ACTION.UPDATE_FILE,
      payload: {
        filename: error.originalFile.name,
        updated: {
          error: error
        }
      }
    })
    onFileUploadFailed && onFileUploadFailed(error)
  }

  /**
   * Open Filestack picker
   */
  const openFilePicker = () => {
    filestackRef.current
      .picker({
        accept: FILE_PICKER_ACCEPT,
        fromSources: FILE_PICKER_FROM_SOURCES,
        maxSize: FILE_PICKER_MAX_SIZE,
        maxFiles: FILE_PICKER_MAX_FILES,
        uploadConfig: {
          retry: FILE_PICKER_UPLOAD_RETRY,
          timeout: FILE_PICKER_UPLOAD_TIMEOUT
        },
        onUploadStarted: (files) => {
          dispatch({
            type: ACTION.SET_FILES,
            payload: files.map((file) => ({
              filename: file.filename,
              progress: 0,
              file: null,
              error: null
            }))
          })
        },
        onFileUploadFailed: (file, event) => {
          const error = new Error(event.status)
          error.originalFile = file.originalFile

          handleFileUploadError(error)
        },
        onFileUploadFinished: handleFileUploadSuccess,
        onFileUploadProgress: (file, event) => {
          dispatch({
            type: ACTION.UPDATE_FILE,
            payload: {
              filename: file.filename,
              updated: {
                progress: event.totalPercent
              }
            }
          })
        },
        startUploadingWhenMaxFilesReached: true,
        storeTo: {
          container: FILE_PICKER_CONTAINER_NAME,
          path,
          region: FILE_PICKER_REGION
        }
      })
      .open()
  }

  /**
   * Handle file(s) uploading when dropping them on the area
   *
   * @param {Event} e event
   */
  const handleFileDrop = (e) => {
    e.preventDefault()

    setDragged(false)

    const files = Array.from(e.dataTransfer.files).map((file, index) => {
      const fileExt = '.' + file.name.split('.').pop()
      let error = null

      if (!_.includes(FILE_PICKER_ACCEPT, fileExt)) {
        error = new Error(`Not allowed file type "${fileExt}".`)
        error.originalFile = _.pick(file, ['name', 'type', 'size'])
      }

      if (index + 1 > FILE_PICKER_MAX_FILES) {
        error = new Error(`File skipped, because can upload maximum ${FILE_PICKER_MAX_FILES} files at once.`)
        error.originalFile = _.pick(file, ['name', 'type', 'size'])
      }

      return {
        filename: file.name,
        progress: 0,
        file: file,
        error
      }
    })

    const filesToUpload = _.map(_.reject(files, 'error'), 'file')

    dispatch({
      type: ACTION.SET_FILES,
      payload: files.map((file) => ({ ...file, file: null }))
    })

    filesToUpload.map((file) =>
      filestackRef.current
        .upload(
          file,
          {
            onProgress: ({ totalPercent }) => {
              dispatch({
                type: ACTION.UPDATE_FILE,
                payload: {
                  filename: file.name,
                  updated: {
                    progress: totalPercent
                  }
                }
              })
            },
            progressInterval: FILE_PICKER_PROGRESS_INTERVAL,
            retry: FILE_PICKER_UPLOAD_RETRY,
            timeout: FILE_PICKER_UPLOAD_TIMEOUT
          },
          {
            container: FILE_PICKER_CONTAINER_NAME,
            path,
            region: FILE_PICKER_REGION
          }
        )
        .then((event) => handleFileUploadSuccess({
          ...event,
          originalFile: _.pick(file, ['name', 'type', 'size'])
        }))
        .catch((event) => {
          const error = new Error(event.status)
          error.originalFile = _.pick(file, ['name', 'type', 'size'])

          handleFileUploadError(error)
        })
    )
  }

  const hasErrors = _.some(uploadingFiles, 'error')

  return (
    <div className={styles['container']}>
      <div
        className={cn(styles['file-picker'], {
          [styles['error']]: hasErrors,
          [styles['drag']]: dragged
        })}
      >
        <div className={styles.icon}>
          <FontAwesomeIcon icon={faCloudUploadAlt} size='5x' />
        </div>

        {uploadingFiles.length === 0 ? (
          <>
            <div>Drag & Drop files here</div>
            <div>or</div>
            <div>
              <span className={styles['pseudo-link']}>click here</span> to
              browse
            </div>
          </>
        ) : (
          <div className={styles['uploading-files']}>
            {uploadingFiles.map((uploadingFile) => (
              <div key={uploadingFile.filename}>
                {uploadingFile.filename} (
                {uploadingFile.error ? (
                  <span className={styles['file-error']}>{uploadingFile.error.toString()}</span>
                ) : (
                  `${uploadingFile.progress}%`
                )}
                )
              </div>
            ))}
          </div>
        )}

        <div
          className={styles['drop-zone-mask']}
          onClick={openFilePicker}
          onKeyPress={openFilePicker}
          onDragEnter={() => setDragged(true)}
          onDragLeave={() => setDragged(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          role='tab'
          tabIndex={0}
          aria-label='Select file to upload'
        />
      </div>
    </div>
  )
}

FilestackFilePicker.defaultProps = {}

FilestackFilePicker.propTypes = {
  path: PT.string.isRequired,
  onFileUploadFinished: PT.func,
  onFileUploadFailed: PT.func,
  onUploadDone: PT.func
}

export default FilestackFilePicker
