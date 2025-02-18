/* Component to render add link modal */

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { connect } from 'react-redux'
import _ from 'lodash'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import cn from 'classnames'
import { toastr } from 'react-redux-toastr'
import Modal from '../../Modal'
import PrimaryButton from '../../Buttons/PrimaryButton'
import OutlineButton from '../../Buttons/OutlineButton'
import FieldLabelDynamic from '../../FieldLabelDynamic'
import FieldInput from '../../FieldInput'
import { assetsLibraryAddLinkSchema } from '../../../util/validation'
import { addAttachment, updateAttachment } from '../../../actions/projects'
import {
  addProjectAttachmentApi,
  updateProjectAttachmentApi
} from '../../../services/projects'
import { ATTACHMENT_TYPE_LINK } from '../../../config/constants'

const ModalAddLink = ({
  classsName,
  theme,
  onCancel,
  link,
  addAttachment,
  updateAttachment,
  projectId
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const buttonText = useMemo(() => (link ? 'Edit Link' : 'Add Link'), [link])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty }
  } = useForm({
    defaultValues: {
      title: '',
      path: ''
    },
    resolver: yupResolver(assetsLibraryAddLinkSchema),
    mode: 'all'
  })

  useEffect(() => {
    if (link) {
      reset({
        title: link.title,
        path: link.path
      })
    }
  }, [link])

  const onSubmit = useCallback(
    data => {
      if (!link) {
        setIsProcessing(true)
        addProjectAttachmentApi(projectId, {
          ...data,
          tags: [],
          type: ATTACHMENT_TYPE_LINK
        })
          .then(result => {
            toastr.success('Success', 'Added link to the project successfully.')
            setIsProcessing(false)
            addAttachment(result)
            onCancel()
          })
          .catch(e => {
            setIsProcessing(false)
            const errorMessage = _.get(
              e,
              'response.data.message',
              'Failed to add link.'
            )
            toastr.error('Error', errorMessage)
          })
      } else {
        setIsProcessing(true)
        updateProjectAttachmentApi(projectId, link.id, data)
          .then(result => {
            toastr.success('Success', 'Updated link successfully.')
            setIsProcessing(false)
            updateAttachment(result)
            onCancel()
          })
          .catch(e => {
            setIsProcessing(false)
            const errorMessage = _.get(
              e,
              'response.data.message',
              'Failed to update link.'
            )
            toastr.error('Error', errorMessage)
          })
      }
    },
    [link, projectId]
  )

  return (
    <Modal theme={theme} onCancel={isProcessing ? _.noop : onCancel}>
      <div className={cn(styles.container, classsName)}>
        <div className={styles.title}>{link ? 'EDIT LINK' : 'ADD A LINK'}</div>

        <form className={styles.blockForm} onSubmit={handleSubmit(onSubmit)}>
          <FieldLabelDynamic
            className={styles.blockRow}
            direction='vertical'
            title='NAME'
            errorMsg={_.get(errors, 'title.message')}
          >
            <FieldInput inputControl={register('title')} />
          </FieldLabelDynamic>
          <FieldLabelDynamic
            className={styles.blockRow}
            direction='vertical'
            title='URL'
            errorMsg={_.get(errors, 'path.message')}
          >
            <FieldInput inputControl={register('path')} />
          </FieldLabelDynamic>
          <div className={styles.blockBtns}>
            <div className={styles.button}>
              <OutlineButton
                text='Cancel'
                type={'info'}
                onClick={onCancel}
                disabled={isProcessing}
              />
            </div>
            <div className={styles.button}>
              <PrimaryButton
                text={isProcessing ? 'Processing...' : buttonText}
                type={'info'}
                submit
                disabled={isProcessing || !isValid || !isDirty}
              />
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}

ModalAddLink.defaultProps = {
  isProcessing: false,
  projectId: '',
  onCancel: () => {}
}

ModalAddLink.propTypes = {
  classsName: PropTypes.string,
  theme: PropTypes.shape(),
  onCancel: PropTypes.func,
  addAttachment: PropTypes.func.isRequired,
  updateAttachment: PropTypes.func.isRequired,
  link: PropTypes.shape(),
  projectId: PropTypes.string
}

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = {
  addAttachment,
  updateAttachment
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalAddLink)
