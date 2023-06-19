import React, { useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './styles.module.scss'
import { PrimaryButton } from '../../Buttons'
import Modal from '../../Modal'

const theme = {
  container: styles.modalContainer
}

const ResourcesDeleteModal = ({ onClose, deleteResource, resource }) => {
  const [isDeletingResource, setIsDeletingResource] = useState(false)
  return (
    <Modal theme={theme} onCancel={onClose}>
      <div className={cn(styles.contentContainer, styles.confirm)}>
        <div className={styles.title}>Delete Resource</div>
        <span>
          Are you sure you want to remove {resource.memberHandle} from this
          challenge?
        </span>
        <div className={styles.buttonGroup}>
          <div className={styles.buttonSizeA}>
            <PrimaryButton
              text='Yes'
              type={'info'}
              disabled={isDeletingResource}
              onClick={async () => {
                setIsDeletingResource(true)
                await deleteResource(
                  resource.challengeId,
                  resource.roleId,
                  resource.memberHandle
                )
                setIsDeletingResource(false)
                onClose()
              }}
            />
          </div>
          <div className={styles.buttonSizeA}>
            <PrimaryButton text='No' type={'info'} onClick={onClose} />
          </div>
        </div>
      </div>
    </Modal>
  )
}

ResourcesDeleteModal.propTypes = {
  onClose: PropTypes.func,
  deleteResource: PropTypes.func,
  resource: PropTypes.object
}

export default ResourcesDeleteModal
