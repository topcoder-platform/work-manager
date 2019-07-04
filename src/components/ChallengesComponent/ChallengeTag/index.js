import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './ChallengeTag.module.scss'

import { CHALLENGE_TRACKS } from '../../../config/constants'

const ChallengeTag = ({ track, challengeType }) => {
  const className = cn(styles.tag, {
    [styles.dataScience]: track === CHALLENGE_TRACKS.DATA_SCIENCE,
    [styles.development]: track === CHALLENGE_TRACKS.DEVELOP,
    [styles.design]: track === CHALLENGE_TRACKS.DESIGN,
    [styles.qa]: track === CHALLENGE_TRACKS.QA
  })

  return (
    <div>
      <div className={className}>
        <span>{challengeType}</span>
      </div>
    </div>
  )
}

ChallengeTag.propTypes = {
  track: PropTypes.string,
  challengeType: PropTypes.string
}

export default ChallengeTag
