import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Terms-Field.module.scss'

const TermsField = ({ terms, projectTerms, challenge, onUpdateMultiSelect }) => {
  const mapOps = item => ({ label: item, value: item })

  const [currTerms, setCurrTerms] = React.useState([])

  React.useEffect(() => {
    const challengeTermsIds = challenge.terms.map(({ id }) => id)
    const allTerms = [...new Set([...projectTerms, ...challengeTermsIds])]
      .map(mapOps)
    setCurrTerms(allTerms)
  }, [])

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='terms'>Terms  :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input type='hidden' />
        <Select
          id='track-select'
          isMulti
          options={terms.map(mapOps)}
          simpleValue
          value={currTerms}
          onChange={(value) => {
            onUpdateMultiSelect(value, 'terms')
            setCurrTerms(value)
          }}
        />
      </div>
    </div>
  )
}

TermsField.defaultProps = {
  terms: []
}

TermsField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  terms: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onUpdateMultiSelect: PropTypes.func.isRequired,
  projectTerms: PropTypes.array
}

export default TermsField
