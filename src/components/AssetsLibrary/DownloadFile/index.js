/* Component to render button to download project attachment file */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styles from './styles.module.scss'
import Loader from '../../Loader'
import { toastr } from 'react-redux-toastr'
import cn from 'classnames'
import { getProjectAttachment } from '../../../services/projects'
import ReactSVG from 'react-svg'
const Download = './IconSquareDownload.svg'
const assets = require.context('../../../assets/images', false, /svg/)

const DownloadFile = ({ classsName, file, projectId }) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <button
      type='button'
      className={cn(styles.container, classsName)}
      onClick={() => {
        setIsLoading(true)
        getProjectAttachment(projectId, file.id)
          .then(attachment => {
            setIsLoading(false)
            window.open(attachment.url, '_blank').focus()
          })
          .catch(e => {
            setIsLoading(false)
            const errorMessage = _.get(
              e,
              'response.data.message',
              'File unavailable'
            )
            toastr.error('Error', errorMessage)
          })
      }}
      disabled={isLoading}
    >
      {file.title}

      {isLoading && <Loader classsName={styles.loader} />}
      {!isLoading && (
        <span className={styles.downloadIcon}>
          <ReactSVG path={assets(`${Download}`)} />
        </span>
      )}
    </button>
  )
}

DownloadFile.defaultProps = {
  file: {}
}

DownloadFile.propTypes = {
  classsName: PropTypes.string,
  projectId: PropTypes.string,
  file: PropTypes.shape()
}

export default DownloadFile
