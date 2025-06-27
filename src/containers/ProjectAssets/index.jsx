/* Component to render project assets page */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import _ from 'lodash'
import * as filepicker from 'filestack-js'
import { toastr } from 'react-redux-toastr'
import PrimaryButton from '../../components/Buttons/PrimaryButton'
import OutlineButton from '../../components/Buttons/OutlineButton'
import TabCommon from '../../components/AssetsLibrary/TabCommon'
import TableAssets from '../../components/AssetsLibrary/TableAssets'
import ModalAttachmentOptions from '../../components/AssetsLibrary/ModalAttachmentOptions'
import ModalAddLink from '../../components/AssetsLibrary/ModalAddLink'
import ConfirmationModal from '../../components/Modal/ConfirmationModal'
import { loadOnlyProjectInfo, removeAttachment } from '../../actions/projects'

import styles from './styles.module.scss'
import Loader from '../../components/Loader'
import {
  ASSETS_FILE_PICKER_FROM_SOURCES,
  ASSETS_FILE_PICKER_MAX_FILES,
  ATTACHMENT_TYPE_FILE,
  ATTACHMENT_TYPE_LINK,
  FILE_PICKER_ACCEPT,
  FILE_PICKER_API_KEY,
  FILE_PICKER_CNAME,
  FILE_PICKER_LOCATION,
  FILE_PICKER_REGION,
  FILE_PICKER_SUBMISSION_CONTAINER_NAME,
  PROJECT_ATTACHMENTS_FOLDER
} from '../../config/constants'
import { removeProjectAttachmentApi } from '../../services/projects'
import { checkAdmin } from '../../util/tc'

const theme = {
  container: styles.modalContainer
}

const ProjectAssets = ({
  projectId,
  projectDetail,
  loadOnlyProjectInfo,
  isLoading,
  removeAttachment,
  loggedInUser,
  token
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  const [showDeleteFile, setShowDeleteFile] = useState(null)
  const [showDeleteLink, setShowDeleteLink] = useState(null)
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false)
  const [pendingUploadFiles, setPendingUploadFiles] = useState([])
  const uploadedFiles = useRef([])
  const [showAddLink, setShowAddLink] = useState(false)
  const hasProjectAccess = useMemo(
    () => (projectDetail ? `${projectDetail.id}` === projectId : false),
    [projectDetail, projectId]
  )
  const isAdmin = useMemo(() => checkAdmin(token), [token])
  const fileUploadClient = useMemo(() => {
    return filepicker.init(FILE_PICKER_API_KEY, {
      cname: FILE_PICKER_CNAME
    })
  }, [])

  const openFileUpload = useCallback(() => {
    if (fileUploadClient && projectId) {
      const attachmentsStorePath = `${PROJECT_ATTACHMENTS_FOLDER}/${projectId}/`
      const picker = fileUploadClient.picker({
        storeTo: {
          location: FILE_PICKER_LOCATION,
          path: attachmentsStorePath,
          container: FILE_PICKER_SUBMISSION_CONTAINER_NAME,
          region: FILE_PICKER_REGION
        },
        maxFiles: ASSETS_FILE_PICKER_MAX_FILES,
        fromSources: ASSETS_FILE_PICKER_FROM_SOURCES,
        accept: FILE_PICKER_ACCEPT,
        uploadInBackground: false,
        onFileUploadFinished: files => {
          const attachments = []
          const fpFiles = _.isArray(files) ? files : [files]
          _.forEach(fpFiles, f => {
            const attachment = {
              title: f.filename,
              description: '',
              size: f.size,
              path: f.key,
              type: ATTACHMENT_TYPE_FILE,
              contentType: f.mimetype || 'application/unknown'
            }
            attachments.push(attachment)
          })
          uploadedFiles.current = [...uploadedFiles.current, ...attachments]
        },
        onOpen: () => {
          uploadedFiles.current = []
        },
        onClose: () => {
          if (uploadedFiles.current.length) {
            setPendingUploadFiles([...uploadedFiles.current])
            setShowAttachmentOptions(true)
          }
        }
      })

      picker.open()
    }
  }, [fileUploadClient, projectId])

  const files = useMemo(() => {
    if (!hasProjectAccess) {
      return []
    }

    let results = _.filter(
      projectDetail.attachments,
      a => a.type === ATTACHMENT_TYPE_FILE
    )
    results = _.sortBy(results, file => -new Date(file.updatedAt).getTime())
    return results
  }, [projectDetail, hasProjectAccess])

  const links = useMemo(() => {
    if (!hasProjectAccess) {
      return []
    }

    let results = _.filter(
      projectDetail.attachments,
      a => a.type === ATTACHMENT_TYPE_LINK
    )
    results = _.sortBy(results, file => -new Date(file.updatedAt).getTime())
    return results
  }, [projectDetail, hasProjectAccess])

  const { tableTitle, tableDatas, isLink } = useMemo(() => {
    if (selectedTab === 0) {
      return {
        tableTitle: 'All Files',
        tableDatas: files,
        isLink: false
      }
    } else if (selectedTab === 1) {
      return {
        tableTitle: 'All Links',
        tableDatas: links,
        isLink: true
      }
    }
    return {
      tableTitle: '',
      tableDatas: [],
      isLink: false
    }
  }, [files, links, selectedTab])

  useEffect(() => {
    if (projectId) {
      loadOnlyProjectInfo(projectId)
    }
  }, [projectId])

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className={styles.container}>
      <div className={styles.blockHeader}>
        <div className={styles.title}>Assets Library</div>
        <div className={styles.btns}>
          {hasProjectAccess && (
            <div className={styles.btn}>
              <OutlineButton
                text={`Add new ${selectedTab ? 'link' : 'file'}`}
                type={'info'}
                onClick={() => {
                  if (selectedTab === 0) {
                    openFileUpload()
                  } else if (selectedTab === 1) {
                    setShowAddLink(true)
                  }
                }}
              />
            </div>
          )}
          <div className={styles.btn}>
            <PrimaryButton
              text='Back'
              type={'info'}
              link={`/projects/${projectId}/challenges`}
            />
          </div>
        </div>
      </div>
      {hasProjectAccess && (
        <>
          <TabCommon
            items={[
              {
                label: 'Files',
                count: files.length
              },
              {
                label: 'Links',
                count: links.length
              }
            ]}
            selectedIndex={selectedTab}
            onSelect={setSelectedTab}
            classsName={styles.blockTabs}
          />
          <TableAssets
            projectId={projectId}
            title={tableTitle}
            onEdit={item => {
              if (selectedTab === 0) {
                setShowAttachmentOptions(item)
              } else if (selectedTab === 1) {
                setShowAddLink(item)
              }
            }}
            onRemove={item => {
              if (selectedTab === 0) {
                setShowDeleteFile(item)
              } else if (selectedTab === 1) {
                setShowDeleteLink(item)
              }
            }}
            datas={tableDatas}
            isLink={isLink}
            members={projectDetail.members}
            loggedInUser={loggedInUser}
            isAdmin={isAdmin}
          />
        </>
      )}

      {showAttachmentOptions && (
        <ModalAttachmentOptions
          theme={theme}
          onCancel={() => setShowAttachmentOptions(false)}
          attachment={
            showAttachmentOptions === true ? null : showAttachmentOptions
          }
          members={projectDetail.members}
          projectId={projectId}
          loggedInUser={loggedInUser}
          newAttachments={pendingUploadFiles}
        />
      )}
      {showAddLink && (
        <ModalAddLink
          theme={theme}
          onCancel={() => setShowAddLink(false)}
          projectId={projectId}
          link={showAddLink === true ? null : showAddLink}
        />
      )}
      {showDeleteFile && (
        <ConfirmationModal
          title={`You're about to delete "${showDeleteFile.title}"`}
          message="Your team might need this file, are you sure you want to delete it? This action can't be undone."
          onCancel={() => setShowDeleteFile(null)}
          theme={theme}
          confirmText='Delete file'
          confirmType='danger'
          cancelType='info'
          isProcessing={isProcessing}
          onConfirm={() => {
            setIsProcessing(true)
            removeProjectAttachmentApi(projectId, showDeleteFile.id)
              .then(() => {
                toastr.success('Success', 'Removed file successfully.')
                removeAttachment(showDeleteFile.id)
                setIsProcessing(false)
                setShowDeleteFile(null)
              })
              .catch(e => {
                setIsProcessing(false)
                const errorMessage = _.get(
                  e,
                  'response.data.message',
                  'Failed to remove file.'
                )
                toastr.error('Error', errorMessage)
              })
          }}
        />
      )}
      {showDeleteLink && (
        <ConfirmationModal
          title="You're about to delete a link"
          message="Your team might need this link, are you sure you want to delete it? This action can't be undone."
          onCancel={() => setShowDeleteLink(null)}
          onConfirm={() => {
            setIsProcessing(true)
            removeProjectAttachmentApi(projectId, showDeleteLink.id)
              .then(() => {
                toastr.success('Success', 'Removed link successfully.')
                removeAttachment(showDeleteLink.id)
                setIsProcessing(false)
                setShowDeleteLink(null)
              })
              .catch(e => {
                setIsProcessing(false)
                const errorMessage = _.get(
                  e,
                  'response.data.message',
                  'Failed to remove link.'
                )
                toastr.error('Error', errorMessage)
              })
          }}
          theme={theme}
          confirmText='Delete link'
          confirmType='danger'
          cancelType='info'
          isProcessing={isProcessing}
        />
      )}
    </div>
  )
}

ProjectAssets.propTypes = {
  projectId: PropTypes.string.isRequired,
  token: PropTypes.string,
  loadOnlyProjectInfo: PropTypes.func.isRequired,
  removeAttachment: PropTypes.func.isRequired,
  projectDetail: PropTypes.object,
  isLoading: PropTypes.bool,
  loggedInUser: PropTypes.object
}

const mapStateToProps = ({ projects, auth }) => {
  return {
    projectDetail: projects.projectDetail,
    isLoading: projects.isLoading,
    loggedInUser: auth.user,
    token: auth.token
  }
}

const mapDispatchToProps = {
  loadOnlyProjectInfo,
  removeAttachment
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectAssets)
