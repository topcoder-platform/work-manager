import React from 'react'
import PropTypes from 'prop-types'

import styles from './ChallengeTag.module.scss'
import { getChallengeTypeAbbr } from '../../../util/tc'

export default function ChallengeTag ({
  type, challengeTypes
}) {
  let abbreviation = getChallengeTypeAbbr(type, challengeTypes)
  if (['CH', 'F2F', 'TSK', 'MM', 'RDM', 'SKL', 'MA', 'SRM', 'PC', 'TGT'].indexOf(abbreviation) < 0) {
    abbreviation = ''
  }
  return (
    <span className={styles.trackIcon}>
      <div
        className={`${styles[abbreviation]} ${styles.mainIcon}`}
      >
        {abbreviation === 'PC' ? 'P' : abbreviation}
      </div>
    </span>
  )
}

ChallengeTag.defaultProps = {
  type: 'Development',
  challengeTypes: []
}

ChallengeTag.propTypes = {
  type: PropTypes.string,
  challengeTypes: PropTypes.arrayOf(PropTypes.shape())
}
