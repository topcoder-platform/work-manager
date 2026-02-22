/* global beforeEach, afterEach, describe, it, expect, jest */
/* eslint-disable react/prop-types */

import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { REVIEW_TYPES } from '../../../config/constants'
import ReviewTypeField from './index'

jest.mock('../../Select', () => {
  const MockSelect = ({
    name,
    onChange,
    options,
    value
  }) => (
    <select
      data-testid='reviewer-select'
      name={name}
      onChange={event => onChange({ value: event.target.value })}
      value={(value && value.value) || ''}
    >
      <option value=''>Select Reviewer</option>
      {(options || []).map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  return MockSelect
})

jest.mock('../../Tooltip', () => {
  const ReactLocal = require('react')

  const MockTooltip = ({ children }) => (
    <ReactLocal.Fragment>{children}</ReactLocal.Fragment>
  )

  return MockTooltip
})

describe('ReviewTypeField', () => {
  let container

  const reviewers = [
    { handle: 'jcori' },
    { handle: 'tasintake800' }
  ]

  const baseChallenge = {
    reviewType: REVIEW_TYPES.INTERNAL,
    reviewer: '',
    submitTriggered: false,
    task: {
      isTask: true
    },
    trackId: '8b995af6-9f6d-4f98-af1c-9b2d9186ba73'
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    container.remove()
    container = null
  })

  it('renders the mandatory reviewer control for task challenges', () => {
    const onUpdateOthers = jest.fn()
    const onUpdateSelect = jest.fn()

    act(() => {
      ReactDOM.render(
        <ReviewTypeField
          challenge={{
            ...baseChallenge,
            reviewer: 'jcori'
          }}
          onUpdateOthers={onUpdateOthers}
          onUpdateSelect={onUpdateSelect}
          reviewers={reviewers}
        />,
        container
      )
    })

    const internalRadio = container.querySelector('input#internal')
    const communityRadio = container.querySelector('input#community')
    const reviewerSelect = container.querySelector('select[data-testid="reviewer-select"]')

    expect(container.textContent).toContain('Reviewer')
    expect(internalRadio).not.toBeNull()
    expect(internalRadio.checked).toBe(true)
    expect(communityRadio).toBeNull()
    expect(reviewerSelect).not.toBeNull()

    act(() => {
      reviewerSelect.value = 'tasintake800'
      reviewerSelect.dispatchEvent(new window.Event('change', { bubbles: true }))
    })

    expect(onUpdateSelect).toHaveBeenCalledWith('tasintake800', false, 'reviewer')
  })

  it('shows a validation message when no reviewer is selected for internal review', () => {
    act(() => {
      ReactDOM.render(
        <ReviewTypeField
          challenge={{
            ...baseChallenge,
            submitTriggered: true
          }}
          onUpdateOthers={jest.fn()}
          onUpdateSelect={jest.fn()}
          reviewers={reviewers}
        />,
        container
      )
    })

    expect(container.textContent).toContain('Select a reviewer')
  })
})
