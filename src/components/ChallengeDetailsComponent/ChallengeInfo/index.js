import React from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeInfo.module.scss'
import Prizes from './Prizes'
import Phases from './Phases'
import { getTCChallengeURL } from '../../../config/constants'

const ChallengeInfo = ({ challenge }) => {
  const {
    challengeId,
    phases,
    prizes,
    numberOfRegistrants,
    numberOfSubmissions
  } = challenge

  const challengeURL = getTCChallengeURL(challengeId)

  return (
    <div className={styles.container}>
      <div className={styles.prizeAndStats}>
        <Prizes prizes={prizes || [0]} />
        <div className={styles.stats}>
          <div><span className='bold'>{numberOfRegistrants}</span> Registrants</div>
          <div><span className='bold'>{numberOfSubmissions}</span> Submissions</div>
        </div>
      </div>
      <div className={styles.phases}><Phases phases={phases} /></div>
      <div className={styles.actions}>
        <a href={challengeURL} className={styles.challengeButton}>View Challenge</a>
      </div>
    </div>
  )
}

ChallengeInfo.propTypes = {
  challenge: PropTypes.object
}

ChallengeInfo.defaultProps = {
  challenge: {}
}

export default ChallengeInfo
