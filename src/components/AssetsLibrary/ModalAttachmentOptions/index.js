/* Component to render attachment options modal */

import React, { useEffect, useState, useRef, useCallback } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { toastr } from 'react-redux-toastr'
import { connect } from 'react-redux'
import cn from 'classnames'
import Modal from '../../Modal'
import FieldUserAutoComplete from '../../FieldUserAutoComplete'
import FieldLabelDynamic from '../../FieldLabelDynamic'
import PrimaryButton from '../../Buttons/PrimaryButton'
import OutlineButton from '../../Buttons/OutlineButton'
import FieldInput from '../../FieldInput'
import { assetsLibraryEditFileSchema } from '../../../util/validation'
import {
  addProjectAttachmentApi,
  updateProjectAttachmentApi
} from '../../../services/projects'
import { addAttachment, updateAttachment } from '../../../actions/projects'

const ModalAttachmentOptions = ({
  classsName,
  theme,
  onCancel,
  attachment,
  members,
  addAttachment,
  updateAttachment,
  projectId,
  loggedInUser,
  newAttachments
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const shareType = useRef('')

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty }
  } = useForm({
    defaultValues: {
      allowedUsers: []
    },
    resolver: attachment ? yupResolver(assetsLibraryEditFileSchema) : null,
    mode: 'all'
  })

  const allowedUsers = watch('allowedUsers')

  useEffect(() => {
    if (attachment) {
      reset({
        title: attachment.title,
        allowedUsers: attachment.allowedUsers || []
      })
    }
  }, [attachment])

  const onEditSubmit = useCallback(
    data => {
      setIsProcessing(true)
      updateProjectAttachmentApi(projectId, attachment.id, data)
        .then(result => {
          toastr.success('Success', 'Updated file successfully.')
          setIsProcessing(false)
          updateAttachment(result)
          onCancel()
        })
        .catch(e => {
          setIsProcessing(false)
          const errorMessage = _.get(
            e,
            'response.data.message',
            'Failed to update file.'
          )
          toastr.error('Error', errorMessage)
        })
    },
    [attachment, projectId]
  )

  const onNewSubmit = useCallback(
    allowedUsers => {
      let count = newAttachments.length
      let errorMessage = ''
      const checkToFinish = () => {
        count = count - 1
        if (count === 0) {
          setIsProcessing(false)
          if (errorMessage) {
            toastr.error('Error', errorMessage)
          } else {
            toastr.success('Success', 'Added file to the project successfully.')
            onCancel()
          }
        }
      }
      setIsProcessing(true)
      _.forEach(newAttachments, newAttachment => {
        addProjectAttachmentApi(projectId, {
          ...newAttachment,
          allowedUsers
        })
          .then(result => {
            addAttachment(result)
            checkToFinish()
          })
          .catch(e => {
            errorMessage = _.get(
              e,
              'response.data.message',
              'Failed to add file.'
            )
            checkToFinish()
          })
      })
    },
    [newAttachments, projectId]
  )

  return (
    <Modal theme={theme} onCancel={isProcessing ? _.noop : onCancel}>
      <div className={cn(styles.container, classsName)}>
        <div className={styles.title}>
          {attachment ? 'EDIT FILE' : 'ATTACHMENT OPTIONS'}
        </div>
        <form
          className={cn(styles.blockRow, styles.blockForm, {
            [styles.blockFormEdit]: !!attachment
          })}
          onSubmit={handleSubmit(onEditSubmit)}
        >
          {!!attachment && (
            <FieldLabelDynamic
              className={styles.blockRow}
              direction='vertical'
              title='TITLE'
              errorMsg={_.get(errors, 'title.message')}
            >
              <FieldInput inputControl={register('title')} />
            </FieldLabelDynamic>
          )}
          <div
            className={cn(styles.blockRow, {
              [styles.blockAddAttachment]: !attachment
            })}
          >
            {!attachment && (
              <>
                <span className={styles.textWhoYouWant}>
                  Who do you want to share this file with?
                </span>
                <div className={styles.button}>
                  <PrimaryButton
                    text={
                      isProcessing && shareType.current === 'all'
                        ? 'Processing...'
                        : 'All project members'
                    }
                    type={'info'}
                    onClick={() => {
                      shareType.current = 'all'
                      onNewSubmit(null)
                    }}
                    disabled={isProcessing}
                  />
                </div>
              </>
            )}
            <div
              className={cn({
                [styles.blockSelectMember]: !attachment
              })}
            >
              {!attachment && (
                <span className={styles.textOrOnly}>
                  OR ONLY SPECIFIC PEOPLE
                </span>
              )}
              <FieldLabelDynamic
                className={styles.blockRow}
                direction='vertical'
                title={attachment ? 'FILE VIEWERS' : ''}
              >
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FieldUserAutoComplete
                      value={value}
                      onChangeValue={onChange}
                      projectMembers={members}
                      loggedInUser={loggedInUser}
                    />
                  )}
                  name='allowedUsers'
                />
              </FieldLabelDynamic>
              {!attachment && (
                <div className={cn(styles.button, styles.btnShareWith)}>
                  <PrimaryButton
                    text={
                      isProcessing && shareType.current === 'selected'
                        ? 'Processing...'
                        : 'Share with selected members'
                    }
                    type={'info'}
                    onClick={() => {
                      shareType.current = 'selected'
                      onNewSubmit(allowedUsers)
                    }}
                    disabled={
                      isProcessing || !allowedUsers || !allowedUsers.length
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {!!attachment && (
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
                  text={isProcessing ? 'Processing...' : 'Edit File'}
                  type={'info'}
                  submit
                  disabled={isProcessing || !isValid || !isDirty}
                />
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  )
}

ModalAttachmentOptions.defaultProps = {
  members: [],
  newAttachments: [],
  projectId: ''
}

ModalAttachmentOptions.propTypes = {
  classsName: PropTypes.string,
  theme: PropTypes.shape(),
  onCancel: PropTypes.func,
  attachment: PropTypes.shape(),
  newAttachments: PropTypes.arrayOf(PropTypes.shape()),
  members: PropTypes.arrayOf(PropTypes.shape()),
  addAttachment: PropTypes.func.isRequired,
  updateAttachment: PropTypes.func.isRequired,
  projectId: PropTypes.string,
  loggedInUser: PropTypes.object
}

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = {
  addAttachment,
  updateAttachment
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalAttachmentOptions)
