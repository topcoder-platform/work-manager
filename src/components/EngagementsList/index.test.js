/* eslint-disable react/prop-types */
/* global describe, it, expect, beforeEach, afterEach, jest */

import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'
import EngagementsList from './index'

jest.mock('../Buttons', () => {
  const React = require('react')

  const renderButton = (text, onClick, disabled) => React.createElement(
    'button',
    { type: 'button', onClick, disabled },
    text
  )

  return {
    PrimaryButton: ({ text, onClick, disabled }) => renderButton(text, onClick, disabled),
    OutlineButton: ({ text, onClick, disabled }) => renderButton(text, onClick, disabled)
  }
})

jest.mock('../Tooltip', () => {
  const React = require('react')

  return ({ children }) => React.createElement('span', null, children)
})

jest.mock('../Loader', () => {
  const React = require('react')

  return () => React.createElement('div', null, 'Loading')
})

jest.mock('../Modal/ConfirmationModal', () => null)

jest.mock('../Select', () => {
  const React = require('react')

  return function MockSelect ({ inputId, options, value, onChange }) {
    return React.createElement(
      'select',
      {
        'data-testid': inputId,
        value: value && value.value ? value.value : '',
        onChange: (event) => {
          const selectedOption = options.find((option) => option.value === event.target.value)
          onChange(selectedOption || null)
        }
      },
      options.map((option) => React.createElement(
        'option',
        { key: option.value, value: option.value },
        option.label
      ))
    )
  }
})

describe('EngagementsList', () => {
  let container

  const defaultProps = {
    engagements: [],
    projectId: null,
    projectDetail: null,
    allEngagements: true,
    isLoading: false,
    canManage: false,
    isAdmin: false,
    deleteEngagement: () => Promise.resolve()
  }

  const renderComponent = (props = {}) => {
    act(() => {
      ReactDOM.render(
        <MemoryRouter>
          <EngagementsList {...defaultProps} {...props} />
        </MemoryRouter>,
        container
      )
    })
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

  it('assigns the On Hold badge class when engagement status is On Hold', () => {
    renderComponent({
      engagements: [
        {
          id: 'on-hold-id',
          projectId: 'project-id',
          projectName: 'Project Alpha',
          title: 'On Hold Engagement',
          status: 'On Hold',
          isPrivate: false
        }
      ]
    })

    const statusBadge = container.querySelector('span.status.statusOnHold')

    expect(statusBadge).not.toBeNull()
    expect(statusBadge.textContent).toBe('On Hold')
  })

  it('filters engagement rows when selecting On Hold status', () => {
    renderComponent({
      engagements: [
        {
          id: 'open-id',
          projectId: 'project-id',
          projectName: 'Project Alpha',
          title: 'Open Engagement',
          status: 'Open',
          isPrivate: false
        },
        {
          id: 'on-hold-id',
          projectId: 'project-id',
          projectName: 'Project Alpha',
          title: 'On Hold Engagement',
          status: 'On Hold',
          isPrivate: false
        }
      ]
    })

    expect(container.textContent).toContain('Open Engagement')
    expect(container.textContent).toContain('On Hold Engagement')

    const statusFilterSelect = container.querySelector('select[data-testid="engagement-status-filter"]')

    act(() => {
      statusFilterSelect.value = 'On Hold'
      statusFilterSelect.dispatchEvent(new window.Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain('On Hold Engagement')
    expect(container.textContent).not.toContain('Open Engagement')
  })
})
