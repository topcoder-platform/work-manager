import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt, faTrash } from '@fortawesome/free-solid-svg-icons'
import styles from './Attachment-Field.module.scss'
import cn from 'classnames'

const AttachmentField = ({ challenge, removeAttachment, onUploadFile }) => {
  const renderAttachments = (attachments) => (
    _.map(attachments, (att, index) => (
      <div className={styles.fileRow} key={`${index}-${att.fileName}`}>
        <div className={styles.col1}>{att.fileName}</div>
        <div className={styles.col2}>{formatBytes(att.size)}</div>
        <div className={styles.icon} onClick={() => removeAttachment(att.fileName)}>
          <FontAwesomeIcon icon={faTrash} size={'lg'} />
        </div>
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
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='Attachment'>Attachment :</label>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.uploadPanel}>
          <label htmlFor='uploadFile'>
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faCloudUploadAlt} size='5x' />
            </div>
            <div className={styles.info}>
              <div>Drag & Drop files here</div>
              <div>or</div>
              <div><span>click here</span> to browser</div>
            </div>
          </label>
          <input type='file' id='uploadFile' onChange={(e) => onUploadFile(e.target.files)} />
        </div>
      </div>
      {
        challenge.attachments.length > 0 && (
          <React.Fragment>
            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='fileList'>File List</label>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.header}>
                <div className={styles.col1}>File Name</div>
                <div className={styles.col2}>Size</div>
                <div className={styles.col3}>Action</div>
              </div>
              { renderAttachments(challenge.attachments) }
            </div>
          </React.Fragment>
        )
      }
    </div>
  )
}

AttachmentField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  removeAttachment: PropTypes.func.isRequired,
  onUploadFile: PropTypes.func.isRequired
}

export default AttachmentField
