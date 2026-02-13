import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import { searchSkills } from '../../../services/skills'
import cn from 'classnames'
import styles from './styles.module.scss'
import { AUTOCOMPLETE_DEBOUNCE_TIME_MS, SKILLS_OPTIONAL_BILLING_ACCOUNT_IDS } from '../../../config/constants'
import _ from 'lodash'
import { extractSkillsFromText } from '../../../services/workflowAI'
import { toastSuccess, toastFailure } from '../../../util/toaster'
import { OutlineButton } from '../../Buttons'
import Loader from '../../Loader'

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

const SkillsField = ({ readOnly, challenge, onUpdateSkills, embedded }) => {
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  const selectedSkills = useMemo(() => (challenge.skills || []).map(skill => ({
    label: skill.name,
    value: skill.id
  })), [challenge.skills])
  const existingSkills = useMemo(() => selectedSkills.map(item => item.label).join(','), [selectedSkills])
  const billingAccountId = _.get(challenge, 'billing.billingAccountId')
  const normalizedBillingAccountId = _.isNil(billingAccountId) ? null : String(billingAccountId)
  const skillsRequired = normalizedBillingAccountId ? !SKILLS_OPTIONAL_BILLING_ACCOUNT_IDS.includes(normalizedBillingAccountId) : true
  const showRequiredError = !readOnly && skillsRequired && challenge.submitTriggered && (!selectedSkills || !selectedSkills.length)

  // Check if description exists to show AI button
  const hasDescription = challenge.description && challenge.description.trim().length > 0

  const handleAISuggest = async () => {
    if (!hasDescription || isLoadingAI) {
      return
    }

    setIsLoadingAI(true)
    try {
      const result = await extractSkillsFromText(challenge.description)
      const matches = result.matches || []

      if (matches.length === 0) {
        toastFailure('No Skills Found', 'No matching standardized skills found based on the description.')
      } else {
        // Merge with existing skills, avoiding duplicates
        const existingSkillIds = new Set((challenge.skills || []).map(s => s.id))
        const newSkills = matches.filter(skill => !existingSkillIds.has(skill.id))

        if (newSkills.length === 0) {
          toastSuccess('Skills Already Added', 'All suggested skills are already in your selection.')
        } else {
          const updatedSkills = [...(challenge.skills || []), ...newSkills]
          onUpdateSkills(updatedSkills)
          toastSuccess('Skills Added', `${newSkills.length} skill(s) were added from AI suggestions.`)
        }
      }
    } catch (error) {
      console.error('AI skill extraction error:', error)
      toastFailure('Error', 'Failed to extract skills. Please try again or add skills manually.')
    } finally {
      setIsLoadingAI(false)
    }
  }

  if (embedded) {
    return (
      <div className={styles.embeddedWrapper}>
        <input type='hidden' />
        <div className={styles.embeddedContent}>
          {isLoadingAI && (
            <div className={styles.loadingOverlay}>
              <Loader />
              <span className={styles.loadingText}>Generating skill suggestions...</span>
            </div>
          )}
          {readOnly ? (
            <div className={styles.embeddedReadOnly}>{existingSkills || '-'}</div>
          ) : (
            <>
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
                isDisabled={isLoadingAI}
              />
              {hasDescription && (
                <OutlineButton
                  type='info'
                  text='AI Suggest'
                  onClick={handleAISuggest}
                  disabled={isLoadingAI}
                  className={styles.aiSuggestButton}
                />
              )}
            </>
          )}
        </div>
        {showRequiredError && (
          <div className={styles.embeddedError}>Select at least one skill</div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='keywords'>Skills {!readOnly && skillsRequired && (<span>*</span>)} :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <input type='hidden' />
          <div className={styles.skillsFieldWrapper}>
            {isLoadingAI && (
              <div className={styles.loadingOverlay}>
                <Loader />
                <span className={styles.loadingText}>Generating skill suggestions...</span>
              </div>
            )}
            {readOnly ? (
              <span>{existingSkills}</span>
            ) : (
              <>
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
                  isDisabled={isLoadingAI}
                />
                {hasDescription && (
                  <OutlineButton
                    type='info'
                    text='AI Suggest'
                    onClick={handleAISuggest}
                    disabled={isLoadingAI}
                    className={styles.aiSuggestButton}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showRequiredError && (
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)} />
          <div className={cn(styles.field, styles.col2, styles.error)}>
            Select at least one skill
          </div>
        </div>
      )}
    </>
  )
}

SkillsField.defaultProps = {
  readOnly: false,
  onUpdateSkills: () => { },
  embedded: false
}

SkillsField.propTypes = {
  readOnly: PropTypes.bool,
  challenge: PropTypes.shape().isRequired,
  onUpdateSkills: PropTypes.func,
  embedded: PropTypes.bool
}

export default SkillsField
