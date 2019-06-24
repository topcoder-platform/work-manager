import _ from 'lodash'
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useDropzone } from 'react-dropzone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { downloadAttachmentURL } from '../../../config/constants'
import { faCloudUploadAlt, faTrash } from '@fortawesome/free-solid-svg-icons'
import styles from './Attachment-Field.module.scss'
import cn from 'classnames'

const AttachmentField = ({ challenge, removeAttachment, onUploadFile, token }) => {
  const onDrop = useCallback(acceptedFiles => {
    _.forEach(acceptedFiles, item => {
      onUploadFile(challenge.id, item)
    })
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const renderAttachments = (attachments) => (
    _.map(attachments, (att, index) => (
      <div className={styles.fileRow} key={`${index}-${att.fileName}`}>
        <a className={styles.col1} href={downloadAttachmentURL(challenge.id, att.id, token)}>{att.fileName}</a>
        <div className={styles.col2}>{formatBytes(att.fileSize)}</div>
        <div className={styles.icon} onClick={() => removeAttachment(att.id)}>
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
        <div {...getRootProps({ className: styles.uploadPanel })}>
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
          <input {...getInputProps()} />
        </div>
      </div>
      {
        _.has(challenge, 'attachments') && challenge.attachments.length > 0 && (
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
  onUploadFile: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired
}

export default AttachmentField
