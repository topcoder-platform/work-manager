/* eslint-disable react/prop-types */
/* global describe, it, expect, beforeEach, afterEach, jest */

import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import ProjectMembers from './index'

jest.mock('../../../util/tc', () => ({
  getProjectMemberByUserId: (projectMembers, userId) => (
    (projectMembers || []).find(member => `${member.userId}` === `${userId}`) || null
  )
}))

jest.mock('../ProjectMember', () => {
  const React = require('react')

  return function MockProjectMember ({ memberInfo }) {
    return React.createElement(
      'span',
      { className: 'project-member' },
      memberInfo.handle || memberInfo.userId
    )
  }
})

describe('ProjectMembers', () => {
  let container

  const renderComponent = (props = {}) => {
    act(() => {
      ReactDOM.render(
        <ProjectMembers {...props} />,
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

  it('matches shared users even when allowed user ids are strings', () => {
    renderComponent({
      members: [
        { userId: 305384, handle: 'bopowfamo' }
      ],
      allowedUsers: ['305384']
    })

    expect(container.textContent).toContain('bopowfamo')
  })
})
