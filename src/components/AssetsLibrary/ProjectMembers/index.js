/* Component to render list of project member */

import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styles from './styles.module.scss'
import ProjectMember from '../ProjectMember'
import cn from 'classnames'

const ProjectMembers = ({ classsName, members, allowedUsers, maxShownNum }) => {
  const [showAll, setShowAll] = useState(false)
  const allowedUserInfos = useMemo(() => {
    const results = _.uniqBy(
      _.compact(allowedUsers.map(userId => _.find(members, { userId }))),
      'userId'
    )
    let extra = 0
    const maxUsers = [...results]
    if (maxUsers.length > maxShownNum) {
      extra = results.length - maxShownNum
      maxUsers.length = maxShownNum
    }

    return {
      all: results,
      maxUsers,
      extra
    }
  }, [members, allowedUsers, maxShownNum])

  return (
    <div className={cn(styles.container, classsName)}>
      {(showAll ? allowedUserInfos.all : allowedUserInfos.maxUsers).map(
        item => (
          <ProjectMember key={item.userId} memberInfo={item} />
        )
      )}
      {!showAll && allowedUserInfos.extra !== 0 && (
        <button onClick={() => setShowAll(true)} className={styles.btn}>
          +{allowedUserInfos.extra}
        </button>
      )}
    </div>
  )
}

ProjectMembers.defaultProps = {
  maxShownNum: 3,
  allowedUsers: [],
  members: []
}

ProjectMembers.propTypes = {
  classsName: PropTypes.string,
  maxShownNum: PropTypes.number,
  allowedUsers: PropTypes.arrayOf(PropTypes.number),
  members: PropTypes.arrayOf(PropTypes.shape())
}

export default ProjectMembers
