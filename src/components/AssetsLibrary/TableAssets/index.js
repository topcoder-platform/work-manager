/* Component to render assets table */

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'
import styles from './styles.module.scss'
import Table from '../../Table'
import IconThreeDot from '../../Icons/IconThreeDot'
import DropdownMenu from '../../DropdownMenu'
import DownloadFile from '../DownloadFile'
import IconFile from '../../Icons/IconFile'
import cn from 'classnames'
import {
  PROJECT_ASSETS_SHARED_WITH_ALL_MEMBERS,
  PROJECT_ASSETS_SHARED_WITH_ADMIN
} from '../../../config/constants'
import ProjectMembers from '../ProjectMembers'
import ProjectMember from '../ProjectMember'

const TableAssets = ({
  classsName,
  title,
  onEdit,
  onRemove,
  datas,
  isLink,
  projectId,
  members,
  loggedInUser,
  isAdmin
}) => {
  const displayAssets = useMemo(
    () =>
      datas.map(item => {
        const titles = item.title.split('.')
        const owner = _.find(members, { userId: item.createdBy })
        const canEdit =
          `${item.createdBy}` === `${loggedInUser.userId}` || isAdmin
        return {
          ...item,
          fileType: titles[titles.length - 1],
          owner,
          updatedAtString: item.updatedAt
            ? moment(item.updatedAt).format('MM/DD/YYYY h:mm A')
            : '—',
          canEdit
        }
      }),
    [datas, members, loggedInUser, isAdmin]
  )
  return (
    <div className={cn(styles.container, classsName)}>
      <span className={styles.textTitle}>{title}</span>

      <Table
        options={[
          {
            name: 'Type'
          },
          {
            name: 'Name'
          },
          {
            name: 'Shared With'
          },
          {
            name: 'Created By'
          },
          {
            name: 'Date'
          },
          {
            name: ''
          }
        ]}
        rows={displayAssets.map(item => (
          <Table.Row key={item.id}>
            <Table.Col className={styles.blockItem}>
              <IconFile type={isLink ? 'link-12' : item.fileType} />
            </Table.Col>
            <Table.Col className={styles.blockItem}>
              {isLink ? (
                <a href={item.path} target='_blank' rel='noopener noreferrer'>
                  {item.title}
                </a>
              ) : (
                <DownloadFile projectId={projectId} file={item} />
              )}
            </Table.Col>
            <Table.Col className={styles.blockItem}>
              {!item.allowedUsers && PROJECT_ASSETS_SHARED_WITH_ALL_MEMBERS}
              {item.allowedUsers &&
                item.allowedUsers === 0 &&
                PROJECT_ASSETS_SHARED_WITH_ADMIN}
              {item.allowedUsers && item.allowedUsers !== 0 && (
                <ProjectMembers
                  members={members}
                  allowedUsers={item.allowedUsers}
                />
              )}
            </Table.Col>
            <Table.Col className={styles.blockItem}>
              {!item.owner && !item.createdBy && '—'}
              {!item.owner && item.createdBy !== 'CoderBot' && 'Unknown'}
              {!item.owner && item.createdBy === 'CoderBot' && 'CoderBot'}
              {!!item.owner && <ProjectMember memberInfo={item.owner} />}
            </Table.Col>
            <Table.Col className={styles.blockItem}>
              {item.updatedAtString}
            </Table.Col>
            <Table.Col className={styles.colMenu}>
              {item.canEdit && (
                <DropdownMenu
                  onSelectMenu={menu => {
                    if (menu === 'Edit') {
                      onEdit(item)
                    } else if (menu === 'Remove') {
                      onRemove(item)
                    }
                  }}
                  options={['Edit', 'Remove']}
                >
                  <IconThreeDot />
                </DropdownMenu>
              )}
            </Table.Col>
          </Table.Row>
        ))}
      />
    </div>
  )
}

TableAssets.defaultProps = {
  title: '',
  onEdit: () => {},
  onRemove: () => {},
  datas: [],
  isLink: false,
  isAdmin: false,
  members: []
}

TableAssets.propTypes = {
  classsName: PropTypes.string,
  projectId: PropTypes.string,
  title: PropTypes.string,
  isAdmin: PropTypes.bool,
  onEdit: PropTypes.func,
  onRemove: PropTypes.func,
  datas: PropTypes.arrayOf(PropTypes.shape()),
  members: PropTypes.arrayOf(PropTypes.shape()),
  isLink: PropTypes.bool,
  loggedInUser: PropTypes.object
}

export default TableAssets
