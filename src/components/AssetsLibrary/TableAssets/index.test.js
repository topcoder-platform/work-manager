/* eslint-disable react/prop-types */
/* global describe, it, expect, beforeEach, afterEach, jest */

import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import TableAssets from './index'

jest.mock('../../Icons/IconThreeDot', () => {
  const React = require('react')
  return function MockIconThreeDot () {
    return React.createElement('span', null, 'menu')
  }
})

jest.mock('../../DropdownMenu', () => {
  const React = require('react')
  return function MockDropdownMenu ({ children }) {
    return React.createElement('div', null, children)
  }
})

jest.mock('../DownloadFile', () => {
  const React = require('react')
  return function MockDownloadFile ({ file }) {
    return React.createElement('span', null, file.title)
  }
})

jest.mock('../../Icons/IconFile', () => {
  const React = require('react')
  return function MockIconFile () {
    return React.createElement('span', null, 'file')
  }
})

jest.mock('../ProjectMembers', () => {
  const React = require('react')
  return function MockProjectMembers ({ allowedUsers }) {
    return React.createElement('span', null, allowedUsers.join(','))
  }
})

jest.mock('../ProjectMember', () => {
  const React = require('react')
  return function MockProjectMember ({ memberInfo }) {
    return React.createElement('span', null, memberInfo.handle || memberInfo.userId)
  }
})

jest.mock('../../../util/tc', () => ({
  getProjectMemberByUserId: (projectMembers, userId) => (
    (projectMembers || []).find(member => `${member.userId}` === `${userId}`) || null
  )
}))

describe('TableAssets', () => {
  let container

  const renderComponent = (props = {}) => {
    act(() => {
      ReactDOM.render(
        <TableAssets
          datas={[]}
          loggedInUser={{ userId: '0', handle: 'viewer' }}
          members={[]}
          projectId='1000'
          {...props}
        />,
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

  it('shows all project members when allowedUsers is an empty array', () => {
    renderComponent({
      datas: [
        {
          id: 1,
          title: 'link',
          path: 'https://example.com',
          type: 'link',
          allowedUsers: [],
          createdBy: '123',
          updatedAt: '2026-03-09T00:00:00.000Z'
        }
      ],
      members: [
        { userId: '123', handle: 'owner' }
      ]
    })

    expect(container.textContent).toContain('All Project Members')
  })

  it('shows the logged-in user as creator when the creator is not in project members', () => {
    renderComponent({
      datas: [
        {
          id: 2,
          title: 'link',
          path: 'https://example.com',
          type: 'link',
          allowedUsers: [],
          createdBy: '456',
          updatedAt: '2026-03-09T00:00:00.000Z'
        }
      ],
      loggedInUser: {
        userId: '456',
        handle: 'current-user'
      }
    })

    expect(container.textContent).toContain('current-user')
    expect(container.textContent).not.toContain('Unknown')
  })
})
