/* eslint-disable react/prop-types */
/* global describe, it, expect, beforeEach, afterEach, jest */

import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import FieldUserAutoComplete from './index'

jest.mock('../../util/tc', () => ({
  getProjectMemberByUserId: (projectMembers, userId) => (
    (projectMembers || []).find(member => `${member.userId}` === `${userId}`) || null
  )
}))

jest.mock('../Select', () => {
  const React = require('react')

  return function MockSelect ({ options, value }) {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { className: 'selected-values' },
        (value || []).map(item => `${item.value}:${item.label}`).join('|')
      ),
      React.createElement(
        'div',
        { className: 'option-values' },
        (options || []).map(item => `${item.value}:${item.label}`).join('|')
      )
    )
  }
})

describe('FieldUserAutoComplete', () => {
  let container

  const defaultProps = {
    value: [],
    onChangeValue: () => {},
    id: 'user-select',
    projectMembers: []
  }

  const renderComponent = (props = {}) => {
    act(() => {
      ReactDOM.render(
        <FieldUserAutoComplete {...defaultProps} {...props} />,
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

  it('includes all project members using handle, email, or userId labels', () => {
    renderComponent({
      projectMembers: [
        { userId: 305384, handle: 'bopowfamo' },
        { userId: 101, email: 'tetal003@example.com' },
        { userId: '202' }
      ]
    })

    const optionValues = container.querySelector('.option-values').textContent

    expect(optionValues).toContain('305384:bopowfamo')
    expect(optionValues).toContain('101:tetal003@example.com')
    expect(optionValues).toContain('202:202')
  })

  it('resolves selected member labels when selected ids and member ids use different types', () => {
    renderComponent({
      value: ['305384'],
      projectMembers: [
        { userId: 305384, handle: 'bopowfamo' }
      ]
    })

    const selectedValues = container.querySelector('.selected-values').textContent

    expect(selectedValues).toContain('305384:bopowfamo')
  })
})
