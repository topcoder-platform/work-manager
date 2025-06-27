/* Component to render project member */

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import cn from 'classnames'
import { PROFILE_URL } from '../../../config/constants'
import { getFullNameWithFallback } from '../../../util/tc'

const ProjectMember = ({ classsName, memberInfo }) => {
  const fullName = useMemo(() => getFullNameWithFallback(memberInfo), [
    memberInfo
  ])
  return (
    <a
      href={`${PROFILE_URL}${memberInfo.handle}`}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(styles.container, classsName)}
    >
      {fullName}
    </a>
  )
}

ProjectMember.defaultProps = {}

ProjectMember.propTypes = {
  classsName: PropTypes.string,
  memberInfo: PropTypes.shape()
}

export default ProjectMember
