/**
 * Component to render Challenges page
 */
import React from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-stickynode'
import { Helmet } from 'react-helmet'
import ChallengeList from './ChallengeList'
import styles from './ChallengesComponent.module.scss'
import Loader from '../Loader'

const ChallengesComponent = ({ challenges, isLoading, activeMenu, warnMessage, setFilterChallengeName, filterChallengeName }) => {
  return (
    <Sticky top={10} bottomBoundary='#SidebarContainer'>
      <div>
        <Helmet title={activeMenu} />
        <div className={styles.title}>{activeMenu}</div>
        <div className={styles.challenges}>
          {isLoading ? <Loader /> : <ChallengeList challenges={challenges} warnMessage={warnMessage} activeMenu={activeMenu} setFilterChallengeName={setFilterChallengeName} filterChallengeName={filterChallengeName} />}
        </div>
      </div>
    </Sticky>
  )
}

ChallengesComponent.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
  activeMenu: PropTypes.string,
  warnMessage: PropTypes.string,
  setFilterChallengeName: PropTypes.func,
  filterChallengeName: PropTypes.string
}

ChallengesComponent.defaultProps = {
  challenges: [],
  isLoading: true
}

export default ChallengesComponent
