/**
 * Component to render LegacyLinks of the app
 */
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import styles from './LegacyLinks.module.scss'
import { DIRECT_PROJECT_URL, MESSAGE, ONLINE_REVIEW_URL } from '../../config/constants'
import PrimaryButton from '../Buttons/PrimaryButton'
import Tooltip from '../Tooltip'

const LegacyLinks = ({ challenge }) => {
  const onClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  const directUrl = `${DIRECT_PROJECT_URL}/contest/detail?projectId=${challenge.legacyId}`
  const orUrl = `${ONLINE_REVIEW_URL}/review/actions/ViewProjectDetails?pid=${challenge.legacyId}`
  return (
    <div className={styles.container}>
      {challenge.legacyId ? (
        <>
          <a href={directUrl} target={'_blank'} onClick={onClick}>
            <PrimaryButton text={'Direct'} type={'info'} />
          </a>
          <a href={orUrl} target={'_blank'} onClick={onClick}>
            <PrimaryButton text={'Online Review'} type={'info'} />
          </a>
        </>
      ) : (
        <>
          <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
            {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
            <PrimaryButton text={'Direct'} type={'disabled'} />
          </Tooltip>
          <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
            {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
            <PrimaryButton text={'Online Review'} type={'disabled'} />
          </Tooltip>
        </>
      )}
    </div>
  )
}

LegacyLinks.propTypes = {
  challenge: PropTypes.object
}

export default LegacyLinks
