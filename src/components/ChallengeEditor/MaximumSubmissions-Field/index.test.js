/* global describe, it, expect, beforeEach, afterEach, jest */

import React from 'react'
import ReactDOM from 'react-dom'
import { act, Simulate } from 'react-dom/test-utils'
import MaximumSubmissionsField from './index'

describe('MaximumSubmissionsField', () => {
  let container

  const renderComponent = (props = {}) => {
    act(() => {
      ReactDOM.render(
        <MaximumSubmissionsField
          challenge={{ metadata: [] }}
          onUpdateMetadata={() => {}}
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
    jest.clearAllMocks()
  })

  it('does not render the unlimited option while editing', () => {
    renderComponent({
      challenge: {
        metadata: [
          {
            name: 'submissionLimit',
            value: '{"unlimited":"true","limit":"false","count":""}'
          }
        ]
      }
    })

    expect(container.querySelector('#unlimited')).toBeNull()
    expect(container.querySelector('#limit')).not.toBeNull()
    expect(container.textContent).not.toContain('Unlimited')
  })

  it('shows unlimited in read-only mode for legacy metadata', () => {
    renderComponent({
      readOnly: true,
      challenge: {
        metadata: [
          {
            name: 'submissionLimit',
            value: '{"unlimited":"true","limit":"false","count":""}'
          }
        ]
      }
    })

    expect(container.textContent).toContain('Unlimited')
  })

  it('sanitizes the count input before updating metadata', () => {
    const onUpdateMetadata = jest.fn()

    renderComponent({ onUpdateMetadata })

    const countInput = container.querySelector('#count')

    act(() => {
      Simulate.change(countInput, { target: { value: '12abc' } })
    })

    expect(onUpdateMetadata).toHaveBeenCalledWith('submissionLimit', '12', 'count')
  })
})
