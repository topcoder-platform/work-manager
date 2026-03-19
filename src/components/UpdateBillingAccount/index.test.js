/* global describe, it, expect, beforeEach, afterEach, jest */

import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import UpdateBillingAccount from './index'

jest.mock('../Select', () => () => null)
jest.mock('../Buttons', () => {
  const React = require('react')

  const renderButton = (text) => React.createElement(
    'button',
    { type: 'button' },
    text
  )

  return {
    PrimaryButton: ({ text }) => renderButton(text),
    OutlineButton: ({ text }) => renderButton(text)
  }
})

describe('UpdateBillingAccount', () => {
  let container

  const defaultProps = {
    billingAccounts: [],
    isBillingAccountsLoading: false,
    isBillingAccountLoading: false,
    isBillingAccountLoadingFailed: false,
    billingStartDate: 'Jan 01, 2026',
    billingEndDate: 'Dec 31, 2026',
    isBillingAccountExpired: false,
    canManageBillingAccount: false,
    currentBillingAccount: null,
    projectId: 1001,
    updateProject: () => {}
  }

  const renderComponent = (props = {}) => {
    act(() => {
      ReactDOM.render(
        <UpdateBillingAccount {...defaultProps} {...props} />,
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

  it('shows the select action when the user can manage billing accounts and none is assigned', () => {
    renderComponent({
      canManageBillingAccount: true,
      isBillingAccountLoadingFailed: true
    })

    expect(container.textContent).toContain('No Billing Account set')
    expect(container.textContent).toContain('Select Billing Account')
  })

  it('shows the edit action when the user can manage an assigned billing account', () => {
    renderComponent({
      canManageBillingAccount: true,
      currentBillingAccount: 12345
    })

    expect(container.textContent).toContain('Billing Account:')
    expect(container.textContent).toContain('Edit Billing Account')
  })

  it('hides management actions when the user cannot manage billing accounts', () => {
    renderComponent({
      currentBillingAccount: 12345
    })

    expect(container.textContent).toContain('Billing Account:')
    expect(container.textContent).not.toContain('Edit Billing Account')
    expect(container.textContent).not.toContain('Select Billing Account')
  })
})
