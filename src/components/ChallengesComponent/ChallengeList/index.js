/**
 * Component to render list of challenges
 */
import { debounce, map } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DebounceInput } from 'react-debounce-input'
import styles from './ChallengeList.module.scss'
import NoChallenge from '../NoChallenge'
import ChallengeCard from '../ChallengeCard'
import Message from '../Message'

class ChallengeList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: this.props.filterChallengeName
    }
    this.updateSearchText = debounce(this.updateSearchText.bind(this), 1000)
  }

  updateSearchText (value) {
    this.setState({ searchText: value })
    const { setFilterChallengeName } = this.props
    setFilterChallengeName(value)
  }

  render () {
    const { searchText } = this.state
    const { activeMenu, warnMessage, challenges } = this.props
    if (warnMessage) {
      return <Message warnMessage={warnMessage} />
    }

    return (
      <div className={styles.list}>
        <div className={styles.row}>
          <DebounceInput
            minLength={2}
            debounceTimeout={300}
            placeholder='Search Challenges'
            onChange={(e) => this.updateSearchText(e.target.value)}
            value={searchText}
          />
        </div>
        {
          challenges.length === 0 && (
            <NoChallenge activeMenu={activeMenu} />
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
            <ul>
              {
                map(challenges, (c) => {
                  return <li key={`challenge-card-${c.id}`}><ChallengeCard challenge={c} /></li>
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
  activeMenu: ''
}

ChallengeList.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object),
  activeMenu: PropTypes.string,
  warnMessage: PropTypes.string,
  setFilterChallengeName: PropTypes.func,
  filterChallengeName: PropTypes.string
}

export default ChallengeList
