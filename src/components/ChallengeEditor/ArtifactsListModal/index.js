import React, { useCallback, useEffect, useState } from 'react'
import Modal from '../../Modal'

import styles from './ArtifactsListModal.module.scss'
import PropTypes from 'prop-types'
import ReactSVG from 'react-svg'
import { isValidDownloadFile } from '../../../util/topcoder-react-lib'
import Loader from '../../Loader'
import { getSubmissionsService } from '../../../services/submissions'
const assets = require.context('../../../assets/images', false, /svg/)

export const ArtifactsListModal = ({ onClose, submissionId, token, theme }) => {
  const [artifacts, setArtifacts] = useState([])
  const [loading, setLoading] = useState(false)

  const getArtifacts = useCallback(async () => {
    const submissionsService = getSubmissionsService(token)
    const { artifacts: resp } = await submissionsService.getSubmissionArtifacts(submissionId)
    setArtifacts(resp)
    setLoading(false)
  }, [submissionId, token])

  const getExtensionFromMime = useCallback((mimeType) => {
    const mimeMap = {
      'application/zip': 'zip',
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'text/plain': 'txt'
    }
    return mimeMap[mimeType] || 'zip'
  }, [])

  useEffect(() => {
    setLoading(true)
    getArtifacts()
  }, [submissionId])

  const onDownloadArtifact = useCallback((item) => {
    // download submission
    const submissionsService = getSubmissionsService(token)
    submissionsService.downloadSubmissionArtifact(submissionId, item)
      .then((blob) => {
        isValidDownloadFile(blob).then((isValidFile) => {
          if (isValidFile.success) {
            // eslint-disable-next-line no-undef
            const blobFile = new Blob([blob])
            const url = window.URL.createObjectURL(blobFile)
            const link = document.createElement('a')
            link.href = url
            const extension = getExtensionFromMime(blob.type)
            const fileName = `${submissionId}.${extension}`
            link.setAttribute('download', `${fileName}`)
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
          } else {
            console.log('failed to download artifact')
          }
        })
      })
  }, [submissionId, token])

  return (
    <Modal theme={theme} onCancel={onClose}>
      <div className={styles['container']}>
        <div className={styles['list']}>
          <div className={styles['header']}>
            <div className={styles['header-title']}>Artifact ID</div>
            <div className={styles['header-action']}>Action</div>
          </div>
          {
            !loading && artifacts.map((item) => {
              return (
                <div className={styles['list-item']}>
                  <div className={styles['artifact-name']}>{item}</div>
                  <ReactSVG
                    className={styles['icon-download']}
                    path={assets('./IconSquareDownload.svg')}
                    onClick={() => onDownloadArtifact(item)}
                  />
                </div>
              )
            })
          }

          {
            !loading && artifacts.length === 0 && <div className={styles['no-artifacts']}>No artifacts found</div>
          }

          {
            loading && <Loader />
          }
        </div>
      </div>
    </Modal>
  )
}

ArtifactsListModal.defaultProps = {
  onClose: () => {},
  submissionId: '',
  token: '',
  theme: ''
}

ArtifactsListModal.propTypes = {
  onClose: PropTypes.func,
  submissionId: PropTypes.string,
  token: PropTypes.string,
  theme: PropTypes.shape()
}
