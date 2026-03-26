/* eslint-disable react/prop-types */
/* global describe, it, expect, beforeEach, afterEach, jest */

import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import UserCard from './index'
import { PROJECT_ROLES } from '../../config/constants'
import { updateProjectMemberRole } from '../../services/projects'

jest.mock('tc-auth-lib', () => ({
  decodeToken: jest.fn()
}))

jest.mock('../Buttons/PrimaryButton', () => {
  const React = require('react')

  return function MockPrimaryButton ({ text, onClick }) {
    return React.createElement('button', { onClick }, text)
  }
})

jest.mock('../Modal/AlertModal', () => {
  const React = require('react')

  return function MockAlertModal ({ title, message }) {
    return React.createElement(
      'div',
      null,
      [title, message].filter(Boolean).join(' ')
    )
  }
})

jest.mock('../../services/projects', () => ({
  updateProjectMemberRole: jest.fn()
}))

describe('UserCard', () => {
  let container

  const baseUser = {
    id: 'member-1',
    projectId: 123,
    userId: '1001',
    handle: 'pm-user',
    role: PROJECT_ROLES.WRITE
  }

  const renderComponent = (props = {}) => {
    let component

    act(() => {
      component = ReactDOM.render(
        <UserCard
          user={baseUser}
          currentUserId='1001'
          updateProjectMember={jest.fn()}
          onRemoveClick={jest.fn()}
          isEditable
          {...props}
        />,
        container
      )
    })

    return component
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    updateProjectMemberRole.mockReset()
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    container.remove()
    container = null
  })

  it('disables higher-privilege options for the current user and blocks the update call', async () => {
    const component = renderComponent()

    expect(container.querySelector('#full-access-member-1').disabled).toBe(true)
    expect(container.querySelector('#copilot-member-1').disabled).toBe(true)

    await act(async () => {
      await component.updatePermission(PROJECT_ROLES.MANAGER)
    })

    expect(updateProjectMemberRole).not.toHaveBeenCalled()
    expect(container.textContent).toContain('You cannot give yourself higher privileges in this project.')
  })

  it('still allows changing another member to a higher-privilege role', async () => {
    const updateProjectMember = jest.fn()
    const component = renderComponent({
      currentUserId: '2002',
      updateProjectMember
    })

    updateProjectMemberRole.mockResolvedValue({
      ...baseUser,
      role: PROJECT_ROLES.MANAGER
    })

    await act(async () => {
      await component.updatePermission(PROJECT_ROLES.MANAGER)
    })

    expect(updateProjectMemberRole).toHaveBeenCalledWith(123, 'member-1', PROJECT_ROLES.MANAGER)
    expect(updateProjectMember).toHaveBeenCalledWith({
      ...baseUser,
      role: PROJECT_ROLES.MANAGER
    })
  })
})
