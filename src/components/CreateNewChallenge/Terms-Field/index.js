import React from 'react'
import PropTypes from 'prop-types'
import styles from './Terms-Field.module.scss'
import cn from 'classnames'

const TermsField = ({ challenge, onUpdateCheckbox }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='challengeName'>Terms :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <div className={styles.subGroup}>
          <div className={styles.subRow}>
            <div className={styles.tcCheckbox}>
              <input
                name='standard'
                type='checkbox'
                id='standard'
                checked={challenge.terms.standard}
                onChange={(e) => onUpdateCheckbox('standard', e.target.checked, 'terms')}
              />
              <label htmlFor='standard'>
                <div className={styles.checkboxLabel}>
                  Standard Topcoder Terms
                </div>
                <input type='hidden' />
              </label>
            </div>
          </div>
          <div className={styles.subRow}>
            <div className={styles.tcCheckbox}>
              <input
                name='project'
                type='checkbox'
                id='project'
                checked={challenge.terms.project}
                onChange={(e) => onUpdateCheckbox('project', e.target.checked, 'terms')}
              />
              <label htmlFor='project'>
                <div className={styles.checkboxLabel}>
                  Project Customer Term
                </div>
                <input type='hidden' />
              </label>
            </div>
          </div>
          <div className={styles.subRow}>
            <div className={styles.tcCheckbox}>
              <input
                name='nda'
                type='checkbox'
                id='nda'
                checked={challenge.terms.nda}
                onChange={(e) => onUpdateCheckbox('nda', e.target.checked, 'terms')}
              />
              <label htmlFor='nda'>
                <div className={styles.checkboxLabel}>
                  Non Disclosure Agreement (NDA)
                </div>
                <input type='hidden' />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

TermsField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateCheckbox: PropTypes.func.isRequired
}

export default TermsField
