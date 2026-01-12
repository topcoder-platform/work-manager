import React from 'react'
import cn from 'classnames'
import PT from 'prop-types'
import styles from './Tab.module.scss'

const Tab = ({
  currentTab,
  selectTab,
  projectId,
  canViewAssets
}) => {
  const projectTabs = [
    { id: 1, label: 'Challenges' },
    { id: 2, label: 'Engagements' },
    ...(canViewAssets ? [{ id: 3, label: 'Assets' }] : [])
  ]
  const tabs = projectId
    ? projectTabs
    : [
      { id: 1, label: 'All Work' },
      { id: 2, label: 'Projects' },
      { id: 3, label: 'Users' },
      { id: 4, label: 'Self-Service' },
      { id: 5, label: 'TaaS' }
    ]

  return (
    <div className={styles.tabs}>
      <ul className={styles.challengeTab}>
        {tabs.map((tab) => (
          <li
            key={`tab-item-${tab.id}`}
            className={cn(styles.item, { [styles.active]: currentTab === tab.id })}
            onClick={() => {
              if (currentTab === tab.id) {
                return
              }
              selectTab(tab.id)
            }}
            onKeyDown={e => {
              if (e.key !== 'Enter') {
                return
              }
              if (currentTab === tab.id) {
                return
              }
              selectTab(tab.id)
            }}
            role='presentation'
          >
            {tab.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

Tab.defaultProps = {
  selectTab: () => {},
  projectId: null,
  canViewAssets: true
}

Tab.propTypes = {
  selectTab: PT.func.isRequired,
  currentTab: PT.number.isRequired,
  projectId: PT.oneOfType([PT.string, PT.number]),
  canViewAssets: PT.bool
}

export default Tab
