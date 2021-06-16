import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import styles from './Registrants-Field.module.scss'
import cn from 'classnames'
import _ from 'lodash'

const RegistrantsField = ({ registrants }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='Registrants'>Registrants :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        {
          registrants.length === 0 && (
            <div><p>This challenge has no registrants</p></div>
          )
        }
        {
          registrants.length > 0 && (
            <div className={styles.registrantList}>
              <div className={styles.registrantRow}>
                <div className={styles.registrantCol1}>Rating</div>
                <div className={styles.registrantCol2}>Username</div>
                <div className={styles.registrantCol3}>Registration Date</div>
              </div>
              {
                _.map(registrants, ({ rating, memberHandle, created }) => (
                  <div className={styles.registrantRow}>
                    <div className={styles.registrantCol1}>{rating}</div>
                    <div className={styles.registrantCol2}>{memberHandle}</div>
                    <div className={styles.registrantCol3}>{moment(created).local().format('MMM DD, YYYY HH:mm')}</div>
                  </div>
                ))
              }
            </div>
          )
        }
      </div>
    </div>
  )
}

RegistrantsField.defaultProps = {
  registrants: []
}

RegistrantsField.propTypes = {
  registrants: PropTypes.arrayOf(PropTypes.shape()).isRequired
}

export default RegistrantsField
