import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import { searchSkills } from '../../../services/skills'
import cn from 'classnames'
import styles from './styles.module.scss'
import { AUTOCOMPLETE_DEBOUNCE_TIME_MS, SKILLS_OPTIONAL_BILLING_ACCOUNT_IDS } from '../../../config/constants'
import _ from 'lodash'

const fetchSkills = _.debounce((inputValue, callback) => {
  searchSkills(inputValue).then(
    (skills) => {
      const suggestedOptions = skills.map((skillItem) => ({
        label: skillItem.name,
        value: skillItem.id
      }))
      return callback(suggestedOptions)
    })
    .catch(() => {
      return callback(null)
    })
}, AUTOCOMPLETE_DEBOUNCE_TIME_MS)

const SkillsField = ({ readOnly, challenge, onUpdateSkills }) => {
  const selectedSkills = useMemo(() => (challenge.skills || []).map(skill => ({
    label: skill.name,
    value: skill.id
  })), [challenge.skills])
  const existingSkills = useMemo(() => selectedSkills.map(item => item.label).join(','), [selectedSkills])
  const billingAccountId = _.get(challenge, 'billing.billingAccountId')
  const normalizedBillingAccountId = _.isNil(billingAccountId) ? null : String(billingAccountId)
  const skillsRequired = normalizedBillingAccountId ? !SKILLS_OPTIONAL_BILLING_ACCOUNT_IDS.includes(normalizedBillingAccountId) : true

  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='keywords'>Skills {!readOnly && skillsRequired && (<span>*</span>)} :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <input type='hidden' />
          {readOnly ? (
            <span>{existingSkills}</span>
          ) : (
            <Select
              id='skill-select'
              isMulti
              simpleValue
              isAsync
              value={selectedSkills}
              onChange={(values) => {
                onUpdateSkills((values || []).map(value => ({
                  name: value.label,
                  id: value.value
                })))
              }}
              cacheOptions
              loadOptions={fetchSkills}
            />
          )}
        </div>
      </div>

      { !readOnly && skillsRequired && challenge.submitTriggered && (!selectedSkills || !selectedSkills.length) && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Select at least one skill
        </div>
      </div> }
    </>
  )
}

SkillsField.defaultProps = {
  readOnly: false,
  onUpdateSkills: () => { }
}

SkillsField.propTypes = {
  readOnly: PropTypes.bool,
  challenge: PropTypes.shape().isRequired,
  onUpdateSkills: PropTypes.func
}

export default SkillsField
