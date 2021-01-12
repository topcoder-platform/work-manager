/**
 * FilestackFilePicker Component
 *
 * Component for uploading files using Filestack Picker and Drag & Drop.
 * - Supports multiple file uploading.
 */
import _ from 'lodash'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  FILE_PICKER_PROGRESS_INTERVAL
} from '../../config/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import styles from './FilestackFilePicker.module.scss'

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
  const [uploadingFiles, setUploadingFiles] = useState([])
  // if something is currently dragged over the area
  const [dragged, setDragged] = useState(false)
  // Filestack client instance
  const filestackRef = useRef(null)
  // we have to use ref for this method, because filestack would be initialized once with a callback using this method
  const updateUploadingFile = useRef()

  // init Filestack (without waiting for rendering)
  useLayoutEffect(() => {
    filestackRef.current = filestack.init(FILE_PICKER_API_KEY, {
      cname: FILE_PICKER_CNAME
    })
  }, [])

  // update the ref to `updateUploadingFile` to keep referencing fresh state data
  useEffect(() => {
    updateUploadingFile.current = (filename, updated) => {
      const uploadingFileIndex = _.findIndex(uploadingFiles, { filename })

      if (uploadingFileIndex > -1) {
        const updatedFile = {
          ...uploadingFiles[uploadingFileIndex],
          ...updated
        }

        setUploadingFiles([
          ...uploadingFiles.slice(0, uploadingFileIndex),
          updatedFile,
          ...uploadingFiles.slice(uploadingFileIndex + 1)
        ])

        return updatedFile
      }
    }
  }, [uploadingFiles, setUploadingFiles])

  useEffect(() => {
    // if all files have been uploaded successfully, clean uploading file list
    if (uploadingFiles.length > 0 && _.every(uploadingFiles, 'file')) {
      setUploadingFiles([])
    }

    // if all files are fully loaded or error happens for them call `onUploadDone` callback
    if (
      uploadingFiles.length > 0 &&
      _.every(uploadingFiles, (file) => file.file || file.error)
    ) {
      if (onUploadDone) {
        const filesFailed = _.filter(uploadingFiles, 'error')
        const filesUploaded = _.filter(uploadingFiles, 'file')

        onUploadDone({
          filesFailed: _.map(filesFailed, 'file'),
          filesUploaded: _.map(filesUploaded, 'file')
        })
      }
    }
  }, [uploadingFiles, setUploadingFiles, onUploadDone])

  /**
   * Handle for success file(s) uploading
   *
   * @param {Object} file upload file info
   */
  const handleFileUploadSuccess = (file) => {
    console.log('handleFileUploadSuccess', file)
    updateUploadingFile.current(file.name, {
      file, // set `file` to indicate that file uploaded
      progress: 100 // make sure that progress is set to 100 when uploading is complete
    })
    onFileUploadFinished && onFileUploadFinished(file)
  }

  /**
   * Handle for error during file(s) uploading
   *
   * @param {Object|String} error error during file uploading
   */
  const handleFileUploadError = (file) => {
    updateUploadingFile.current(file.name, {
      file, // set `file` to indicate that file uploaded
      progress: 100 // make sure that progress is set to 100 when uploading is complete
    })
    onFileUploadFailed && onFileUploadFailed(file)
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
        onUploadStarted: (files) => {
          setUploadingFiles(
            files.map((file) => ({
              filename: file.filename,
              progress: 0,
              file: null,
              error: null
            }))
          )
        },
        onFileUploadFailed: handleFileUploadError,
        onFileUploadFinished: handleFileUploadSuccess,
        onFileUploadProgress: (file, progressInfo) => {
          updateUploadingFile.current(file.filename, {
            progress: progressInfo.totalPercent
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
        error = `Not allowed file type "${fileExt}".`
      }

      if (index + 1 > FILE_PICKER_MAX_FILES) {
        error = `File skipped, because can upload maximum ${FILE_PICKER_MAX_FILES} files at once.`
      }

      return {
        filename: file.name,
        progress: 0,
        file,
        error
      }
    })

    const filesToUpload = _.map(_.reject(files, 'error'), 'file')

    setUploadingFiles(files.map((file) => ({ ...file, file: null })))

    filesToUpload.map((file) =>
      filestackRef.current
        .upload(
          file,
          {
            onProgress: ({ totalPercent }) => {
              updateUploadingFile.current(file.name, {
                progress: totalPercent
              })
            },
            progressInterval: FILE_PICKER_PROGRESS_INTERVAL
          },
          {
            container: FILE_PICKER_CONTAINER_NAME,
            path,
            region: FILE_PICKER_REGION
          }
        )
        .then(handleFileUploadSuccess)
        .catch(handleFileUploadError)
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
                  <span className={styles['file-error']}>{uploadingFile.error}</span>
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
