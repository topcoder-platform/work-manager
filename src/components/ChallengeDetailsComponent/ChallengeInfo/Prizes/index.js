import React from 'react'
import PropTypes from 'prop-types'
import styles from './Prizes.module.scss'

function getOrdinal (num) {
  const ordinals = ['th', 'st', 'nd', 'rd']
  const v = num % 100
  const suffix = ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0]
  return `${num}${suffix}`
}

function numberWithCommas (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const Prizes = ({ prizes }) => {
  const prizeComponents = prizes.map((p, index) => (
    <div className={styles.prize} key={`prize-${p}-${index}`}>
      <span className={styles.rank}>{getOrdinal(index + 1)}</span>
      <span className={styles.amount}>${numberWithCommas(p)}</span>
    </div>
  ))

  return (
    <div className={styles.prizes}>
      {prizeComponents}
    </div>
  )
}

Prizes.propTypes = {
  prizes: PropTypes.arrayOf(PropTypes.number)
}

Prizes.defaultProps = {
  challenge: {}
}

export default Prizes
