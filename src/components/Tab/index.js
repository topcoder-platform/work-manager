import React from 'react'
import cn from 'classnames'
import PT from 'prop-types'
import styles from './Tab.module.scss'

const Tab = ({
  currentTab,
  selectTab
}) => {
  const onActiveClick = () => {
    if (currentTab === 1) {
      return
    }
    selectTab(1)
  }

  const onPastChallengesClick = () => {
    if (currentTab === 2) {
      return
    }
    selectTab(2)
  }

  const tabComponent = (
    <ul className={styles.challengeTab}>
      <li
        key='tab-item-active'
        className={cn(styles.item, { [styles.active]: currentTab === 1 })}
        onClick={onActiveClick}
        onKeyDown={e => {
          if (e.key !== 'Enter') {
            return
          }
          onActiveClick()
        }}
        role='presentation'
      >
       All Work
      </li>
      <li
        key='tab-item-past'
        className={cn(styles.item, { [styles.active]: currentTab === 2 })}
        onClick={onPastChallengesClick}
        onKeyDown={e => {
          if (e.key !== 'Enter') {
            return
          }
          onPastChallengesClick()
        }}
        role='presentation'
      >
       Projects
      </li>
    </ul>
  )

  return (
    <div className={styles.tabs}>
      <h1>Work Manager</h1>
      <hr />
      {tabComponent}
    </div>
  )
}

Tab.defaultProps = {
  selectTab: () => {}
}

Tab.propTypes = {
  selectTab: PT.func.isRequired,
  currentTab: PT.number.isRequired
}

export default Tab
