/**
 * Component to render submissions of challenges other than Marathon Matches
 */
import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Link } from 'react-router-dom'
import cn from 'classnames'
import Table from '../../../Table'
import styles from './SubmissionList.module.scss'
import Handle from '../../../Handle'
import NoSubmissions from '../NoSubmissions'

// Table options for non MM matches
const options = [
  {
    name: 'Submission ID',
    width: 8
  },
  {
    name: 'Review Date',
    width: 4
  },
  {
    name: 'Score',
    width: 1
  }
]

const SubmissionList = ({ submissions, challengeId }) => {
  if (submissions.length === 0) {
    return <NoSubmissions />
  }

  const rows = submissions.map(
    (s, i) => {
      const submission = s.submissions[0]
      const { id, reviewSummation } = submission
      const aggregateScore = reviewSummation ? reviewSummation.aggregateScore.toFixed(2) : 'N/A'
      const reviewDate = reviewSummation
        ? moment(reviewSummation.updated || reviewSummation.created).format('MMM DD, HH:mma')
        : 'N/A'
      const isFailed = reviewSummation ? reviewSummation.isPassing : false

      return (
        <Table.Row key={`submission-${s.memberId}-${i}`} className={styles.item}>
          <Table.Col width={options[0].width}>
            <Link className={styles.submissionLink} to={`/challenges/${challengeId}/submissions/${id}`}>
              {id}
            </Link>
            {
              s.memberHandle && (
                <div className={styles.handle}>
                  <span>(</span><Handle handle={s.memberHandle} color={s.memberHandleColor} /><span>)</span>
                </div>
              )
            }
          </Table.Col>
          <Table.Col width={options[1].width}>
            <span className={styles.date}>{reviewDate}</span>
          </Table.Col>
          <Table.Col width={options[2].width}>
            <span className={cn(styles.score, { [styles.fail]: isFailed })} >{aggregateScore}</span>
          </Table.Col>
        </Table.Row>
      )
    }
  )
  return (
    <Table rows={rows} options={options} className={styles.list} />
  )
}

SubmissionList.propTypes = {
  submissions: PropTypes.arrayOf(PropTypes.object),
  challengeId: PropTypes.number
}

export default SubmissionList
