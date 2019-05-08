/**
 * Component to render submissions of Marathon Matches
 */
import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import Table from '../../../Table'
import styles from './MMSubmissionList.module.scss'
import Handle from '../../../Handle'
import NoSubmissions from '../NoSubmissions'

// Table options for non MM matches
const options = [
  // API Not Implemented Yet
  // {
  //   name: 'Rank',
  //   width: 2
  // },
  {
    name: 'Competitor',
    width: 6
  },
  {
    name: 'Time',
    width: 6
  },
  // API Not Implemented Yet
  // {
  //   name: 'Final',
  //   width: 5
  // },
  // {
  //   name: 'Provisional',
  //   width: 3
  // }
  {
    name: '',
    width: 1
  }
]

const expandableOptions = [
  {
    name: 'Submission'
  },
  // API Not Implemented Yet
  // {
  //   name: 'Final'
  // },
  // {
  //   name: 'Provisonal'
  // },
  {
    name: 'Time'
  }
]

class MMSubmissionList extends React.Component {
  constructor (props) {
    super(props)
    this.toggleRow = this.toggleRow.bind(this)

    this.state = {
      expandStates: {}
    }
  }

  toggleRow (memberId) {
    const { expandStates } = this.state
    this.setState({
      expandStates: { ...expandStates, [memberId]: !expandStates[memberId] }
    })
  }

  renderExpandButton (memberId, onClick) {
    const { expandStates } = this.state
    const isExpanded = !!expandStates[memberId]
    const rotation = isExpanded ? 90 : null
    return (
      <FontAwesomeIcon
        icon={faChevronRight}
        className={styles.expandButton}
        rotation={rotation}
        onClick={onClick}
      />
    )
  }

  renderExpandableRows (submissions) {
    const { challengeId } = this.props
    const headers = expandableOptions.map(o => (
      <th key={`expandable-row-header-${o.name}`}>{o.name}</th>)
    )
    const getFormattedTime = (time) => moment(time).format('DD MMM YYYY, HH:mm:ss')
    const rows = submissions.map(
      s => (
        <tr className={styles.expandableContentRow} key={`expanded-row-${s.id}`}>
          <td />
          <td>
            <Link className={styles.submissionLink} to={`/challenges/${challengeId}/submissions/${s.id}`}>
              {s.id}
            </Link>
          </td>
          {/* API Not Implemented Yet */}
          {/* <td>
            <span>{s.finalScore || '-'}</span>
          </td>
          <td>
            <span>{s.provisionalScore || '-'}</span>
          </td> */}
          <td>
            <span className={styles.date}>{getFormattedTime(s.created)}</span>
          </td>
        </tr>
      )
    )
    return <>
      <tr className={styles.expandableContentRow}>
        <th />
        {headers}
      </tr>
      {rows}
    </>
  }

  render () {
    const { submissions, challengeId } = this.props
    const { expandStates } = this.state

    if (submissions.length === 0) {
      return <NoSubmissions />
    }

    const rows = submissions.map(
      (s, i) => {
        const submission = s.submissions[0]
        const time = moment(submission.created).format('MMM DD, HH:mma')
        const expandButton = this.renderExpandButton(s.memberId, () => this.toggleRow(s.memberId))
        const expandRows = this.renderExpandableRows(s.submissions)
        return (
          <Table.ExpandableRow
            key={`mm-submission-${s.memberId}-${i}-${challengeId}`}
            className={styles.item}
            expanded={expandStates[s.memberId]}
            expandRows={expandRows}
          >
            {/* API Not Implemented Yet */}
            {/* <Table.Col width={options[0].width}>
              <span className={styles.rank}>-/{rank}</span>
            </Table.Col> */}
            <Table.Col width={options[0].width}>
              <div className={styles.handle}>
                <Handle handle={s.memberHandle} color={s.memberHandleColor} />
              </div>
            </Table.Col>
            <Table.Col width={options[1].width}>
              <span className={styles.date}>{time}</span>
            </Table.Col>
            {/* API Not Implemented Yet */}
            {/* <Table.Col width={options[3].width}>
              <span>{finalScore || '-'}</span>
            </Table.Col>
            <Table.Col width={options[4].width}>
              <span className={styles.provisionalScore}>{provisionalScore || '-'}</span>
              {expandButton}
            </Table.Col> */}
            <Table.Col width={options[2].width}>
              {expandButton}
            </Table.Col>
          </Table.ExpandableRow>
        )
      }
    )
    return (
      <Table rows={rows} options={options} className={styles.list} expandable />
    )
  }
}

MMSubmissionList.propTypes = {
  submissions: PropTypes.arrayOf(PropTypes.object),
  challengeId: PropTypes.number
}

export default MMSubmissionList
