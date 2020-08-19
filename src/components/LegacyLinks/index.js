/**
 * Component to render LegacyLinks of the app
 */
import React from 'react'
import PropTypes from 'prop-types'
import styles from './LegacyLinks.module.scss'
import { DIRECT_PROJECT_URL, ONLINE_REVIEW_URL } from '../../config/constants'
import PrimaryButton from '../Buttons/PrimaryButton'

const LegacyLinks = ({ challenge }) => {
  const directUrl = `${DIRECT_PROJECT_URL}/contest/detail?projectId=${challenge.legacyId}`
  const orUrl = `${ONLINE_REVIEW_URL}/review/actions/ViewProjectDetails?pid=${challenge.legacyId}`
  return (
    <div className={styles.container}>
      <a
        href={directUrl}
        target={'_blank'}
        onClick={(e) => e.stopPropagation()}
      >
        <PrimaryButton text={'Direct'} type={'info'} />
      </a>
      <a
        href={orUrl}
        target={'_blank'}
        onClick={(e) => e.stopPropagation()}
      >
        <PrimaryButton text={'Online Review'} type={'info'} />
      </a>
    </div>
  )
}

LegacyLinks.propTypes = {
  challenge: PropTypes.object
}

export default LegacyLinks
