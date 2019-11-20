/**
 * Component to render list of challenges
 */
import { debounce, map } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DebounceInput } from 'react-debounce-input'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import 'react-tabs/style/react-tabs.css'
import styles from './ChallengeList.module.scss'
import NoChallenge from '../NoChallenge'
import ChallengeCard from '../ChallengeCard'
import Message from '../Message'
import {
  CHALLENGE_STATUS
} from '../../../config/constants'

class ChallengeList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: this.props.filterChallengeName
    }
    this.directUpdateSearchParam = this.updateSearchParam.bind(this) // update search param without debounce
    this.updateSearchParam = debounce(this.updateSearchParam.bind(this), 1000)
  }

  /**
   * Update filter for getting project
   * @param {String} searchText search text
   * @param {String} projectStatus project status
   */
  updateSearchParam (searchText, projectStatus) {
    this.setState({ searchText })
    const { setFilterChallengeValue } = this.props
    setFilterChallengeValue({
      name: searchText,
      status: projectStatus
    })
  }

  render () {
    const { searchText } = this.state
    const { activeProject, warnMessage, challenges, status } = this.props
    if (warnMessage) {
      return <Message warnMessage={warnMessage} />
    }

    let selectedTab = 0
    switch (status) {
      case CHALLENGE_STATUS.DRAFT:
        selectedTab = 1
        break
      case CHALLENGE_STATUS.COMPLETED:
        selectedTab = 2
        break
    }

    return (
      <div className={styles.list}>
        <div className={styles.row}>
          <DebounceInput
            className={styles.challengeInput}
            minLength={2}
            debounceTimeout={300}
            placeholder='Search Challenges'
            onChange={(e) => this.updateSearchParam(e.target.value, status)}
            value={searchText}
          />
        </div>
        {activeProject && (<Tabs
          selectedIndex={selectedTab}
          className={styles.tabsContainer}
          onSelect={(index) => {
            switch (index) {
              case 0: {
                this.directUpdateSearchParam(searchText, CHALLENGE_STATUS.ACTIVE)
                break
              }
              case 1: {
                this.directUpdateSearchParam(searchText, CHALLENGE_STATUS.DRAFT)
                break
              }
              case 2: {
                this.directUpdateSearchParam(searchText, CHALLENGE_STATUS.COMPLETED)
                break
              }
            }
          }}>
          <TabList>
            <Tab>Active</Tab>
            <Tab>Draft</Tab>
            <Tab>Completed</Tab>
          </TabList>
          <TabPanel />
          <TabPanel />
          <TabPanel />
        </Tabs>)}
        {
          challenges.length === 0 && (
            <NoChallenge activeProject={activeProject} />
          )
        }
        {
          challenges.length > 0 && (
            <div className={styles.header}>
              <div className={styles.col1}>Challenges Name</div>
              <div className={styles.col2}>Status</div>
              <div className={styles.col3}>Current phase</div>
              <div className={styles.col4}>&nbsp;</div>
            </div>
          )
        }
        {
          challenges.length > 0 && (
            <ul className={styles.challengeList}>
              {
                map(challenges, (c) => {
                  return <li className={styles.challengeItem} key={`challenge-card-${c.id}`}><ChallengeCard challenge={c} /></li>
                })
              }
            </ul>
          )
        }
      </div>
    )
  }
}

ChallengeList.defaultProps = {
}

ChallengeList.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object),
  activeProject: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  warnMessage: PropTypes.string,
  setFilterChallengeValue: PropTypes.func,
  filterChallengeName: PropTypes.string,
  status: PropTypes.string
}

export default ChallengeList
