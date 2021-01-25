import _ from 'lodash'
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { downloadAttachmentURL, SPECIFICATION_ATTACHMENTS_FOLDER, getAWSContainerFileURL } from '../../../config/constants'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import FilestackFilePicker from '../../FilestackFilePicker'
import styles from './Attachment-Field.module.scss'
import Loader from '../../Loader'

const AttachmentField = ({ challengeId, attachments, removeAttachment, onUploadFiles, token, readOnly }) => {
  // when all files are upload to the S3 this method would be called to create attachments via Challenge API
  const onUploadDone = useCallback(({ filesUploaded }) => {
    if (filesUploaded && filesUploaded.length > 0) {
      onUploadFiles(
        challengeId,
        filesUploaded.map(file => ({
          name: file.originalFile.name,
          fileSize: file.originalFile.size,
          url: encodeURI(getAWSContainerFileURL(file.key))
        }))
      )
    }
  }, [challengeId, onUploadFiles])

  const renderAttachments = (attachments) => (
    _.map(attachments, (att, index) => (
      <div className={styles.fileRow} key={att.id || att.url}>
        <a className={styles.col1} href={downloadAttachmentURL(challengeId, att.id, token)} target='_blank'>{att.name}</a>
        <div className={styles.col2}>{formatBytes(att.fileSize)}</div>
        {!readOnly && (
          <div className={styles.actions}>
            {!att.isDeleting && att.id && (
              <FontAwesomeIcon icon={faTrash} size={'lg'} onClick={() => removeAttachment(challengeId, att.id)} className={styles.removeIcon} />
            )}
            {(att.isDeleting || !att.id) && (
              <div className={styles.loader}><Loader /></div>
            )}
          </div>
        )}
      </div>
    ))
  )

  const formatBytes = (bytes, decimals) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals <= 0 ? 0 : decimals || 2
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <label htmlFor='Attachment'>Attachments :</label>
      </div>

      {!readOnly && (
        <div className={styles.row}>
          <FilestackFilePicker
            path={`challenges/${challengeId}/${SPECIFICATION_ATTACHMENTS_FOLDER}/`}
            onUploadDone={onUploadDone}
          />
        </div>
      )}
      {
        attachments && attachments.length > 0 && (
          <div className={styles.row}>
            <div className={styles.header}>
              <div className={styles.col1}>File Name</div>
              <div className={styles.col2}>Size</div>
              {!readOnly && <div className={styles.col3}>Action</div>}
            </div>
            { renderAttachments(attachments) }
          </div>
        )
      }
    </div>
  )
}

AttachmentField.defaultProps = {
  removeAttachment: () => {},
  onUploadFiles: () => {},
  readOnly: false,
  attachments: []
}

AttachmentField.propTypes = {
  challengeId: PropTypes.string.isRequired,
  attachments: PropTypes.array,
  removeAttachment: PropTypes.func,
  onUploadFiles: PropTypes.func,
  token: PropTypes.string.isRequired,
  readOnly: PropTypes.bool
}

export default AttachmentField
