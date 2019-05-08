import React from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeTags.module.scss'
import Tag from '../../Tag'
import { fixedTrack } from '../../../util/tc'

const ChallengeTags = ({ challenge, challengeTypes }) => {
  const {
    track,
    subTrack,
    technologies,
    platforms,
    roles
  } = challenge

  const techAndPlatforms = [...(technologies || []), ...(platforms || [])]

  const trackTag = <Tag track={fixedTrack(track, subTrack)} subTrack={subTrack} challengeTypes={challengeTypes} />
  const techAndPlatformTags = techAndPlatforms.map((t, i) => <Tag value={t} key={`tag-${t}-${i}`} />)
  const roleTags = (roles || []).map((r, i) => <Tag roleTag value={r} key={`role-${r}-${i}`} />)
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        {trackTag}
        {techAndPlatformTags}
      </div>
      <div className={styles.right}>
        {roleTags}
      </div>
    </div>
  )
}

ChallengeTags.propTypes = {
  challenge: PropTypes.object,
  challengeTypes: PropTypes.arrayOf(PropTypes.object)
}

ChallengeTags.defaultProps = {
  challenge: {},
  challengeTypes: []
}

export default ChallengeTags
