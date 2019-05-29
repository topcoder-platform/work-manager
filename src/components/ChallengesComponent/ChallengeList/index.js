/**
 * Component to render list of challenges
 */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeList.module.scss'
import NoChallenge from '../NoChallenge'
import ChallengeCard from '../ChallengeCard'

class ChallengeList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: ''
    }

    this.filterChallenges = this.filterChallenges.bind(this)
  }

  filterChallenges (text) {
    if (text.trim() === '') {
      return this.props.challenges
    }

    let challenges = this.props.challenges

    return challenges.filter(challenge => {
      return challenge.name.toLowerCase().indexOf(text.toLowerCase()) > -1
    })
  }

  updateSearchText (e) {
    this.setState({ searchText: e.target.value })
  }

  render () {
    const { searchText } = this.state
    const { activeMenu } = this.props
    const challenges = this.filterChallenges(searchText)

    if (challenges.length === 0 && searchText === '') {
      return <NoChallenge activeMenu={activeMenu} />
    }

    return (
      <div className={styles.list}>
        <div className={styles.row}>
          <input name='searchText' type='text' placeholder='Search Challenge' value={searchText} onChange={(e) => this.updateSearchText(e)} />
        </div>
        <div className={styles.header}>
          <div className={styles.col1}>Challenges Names</div>
          <div className={styles.col2}>Status</div>
          <div className={styles.col3}>Current phase</div>
          <div className={styles.col4}>&nbsp;</div>
        </div>
        <ul>
          {
            _.map(challenges, (c) => {
              return <li key={`challenge-card-${c.id}`}><ChallengeCard challenge={c} /></li>
            })
          }
        </ul>
      </div>
    )
  }
}

ChallengeList.defaultProps = {
  activeMenu: ''
}

ChallengeList.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object),
  activeMenu: PropTypes.string
}

export default ChallengeList
