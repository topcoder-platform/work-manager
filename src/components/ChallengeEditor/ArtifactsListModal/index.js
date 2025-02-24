import React, { useEffect, useState } from 'react'
import Modal from '../../Modal'

import styles from './ArtifactsListModal.module.scss'
import PropTypes from 'prop-types'
import ReactSVG from 'react-svg'
import { getTopcoderReactLib } from '../../../util/topcoder-react-lib'
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
                  <ReactSVG className={styles['icon-download']} path={assets('./IconSquareDownload.svg')} />
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
