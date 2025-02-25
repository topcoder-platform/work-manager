import React, { useEffect, useState } from 'react'
import Modal from '../../Modal'

import styles from './ArtifactsListModal.module.scss'
import PropTypes from 'prop-types'
import ReactSVG from 'react-svg'
import { getTopcoderReactLib, isValidDownloadFile } from '../../../util/topcoder-react-lib'
import Loader from '../../Loader'
const assets = require.context('../../../assets/images', false, /svg/)

export const ArtifactsListModal = ({ onClose, submissionId, token, theme }) => {
  const [artifacts, setArtifacts] = useState([])
  const [loading, setLoading] = useState(false)

  const getArtifacts = async () => {
    const reactLib = getTopcoderReactLib()
    const { getService } = reactLib.services.submissions
    const submissionsService = getService(token)
    const { artifacts: resp } = await submissionsService.getSubmissionArtifacts(submissionId)
    setArtifacts(resp)
    setLoading(false)
  }

  const getExtensionFromMime = (mimeType) => {
    const mimeMap = {
      'application/zip': 'zip',
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'text/plain': 'txt'
    }
    return mimeMap[mimeType] || 'zip'
  }

  useEffect(() => {
    setLoading(true)
    getArtifacts()
  }, [submissionId])

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
                    onClick={() => {
                      // download submission
                      const reactLib = getTopcoderReactLib()
                      const { getService } = reactLib.services.submissions
                      const submissionsService = getService(token)
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
                              console.log(isValidFile, 'failed')
                            }
                          })
                        })
                    }}
                  />
                </div>
              )
            })
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
