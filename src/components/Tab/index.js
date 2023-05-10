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

  const onUsersClick = () => {
    if (currentTab === 3) {
      return
    }
    selectTab(3)
  }

  const onSelfServiceClick = () => {
    if (currentTab === 4) {
      return
    }
    selectTab(4)
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
      <li
        key='tab-item-users'
        className={cn(styles.item, { [styles.active]: currentTab === 3 })}
        onClick={onUsersClick}
        onKeyDown={e => {
          if (e.key !== 'Enter') {
            return
          }
          onUsersClick()
        }}
        role='presentation'
      >
          Users
      </li>
      <li
        key='tab-item-self-service'
        className={cn(styles.item, { [styles.active]: currentTab === 4 })}
        onClick={onSelfServiceClick}
        onKeyDown={e => {
          if (e.key !== 'Enter') {
            return
          }
          onSelfServiceClick()
        }}
        role='presentation'
      >
          Self-Service
      </li>
    </ul>
  )

  return (
    <div className={styles.tabs}>
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
