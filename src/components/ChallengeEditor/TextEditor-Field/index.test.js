/* global describe, it, expect, beforeEach, afterEach, jest */

import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import TextEditorField from './index'
import { CHALLENGE_TRACKS } from '../../../config/constants'

jest.mock('../SpecialChallengeField', () => () => null)
jest.mock('../TagsField', () => () => null)
jest.mock('../SkillsField', () => () => null)
jest.mock('../FinalDeliverables-Field', () => () => null)
jest.mock('../StockArts-Field', () => () => null)
jest.mock('../SubmissionVisibility-Field', () => () => null)
jest.mock('../Description-Field', () => () => null)
jest.mock('../ChallengeReviewer-Field', () => () => null)
jest.mock('../../Buttons', () => ({
  PrimaryButton: () => null
}))

describe('TextEditorField', () => {
  let container

  const renderComponent = (props = {}) => {
    act(() => {
      ReactDOM.render(
        <TextEditorField
          challenge={{ trackId: CHALLENGE_TRACKS.DESIGN, metadata: [] }}
          shouldShowPrivateDescription={false}
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

  it('does not render submission limit controls for design challenges while editing', () => {
    renderComponent()

    expect(container.textContent).not.toContain('Maximum Number of Submissions')
    expect(container.textContent).not.toContain('Unlimited')
    expect(container.querySelector('#limit')).toBeNull()
    expect(container.querySelector('#count')).toBeNull()
  })

  it('does not render a submission limit summary for design challenges in read-only mode', () => {
    renderComponent({
      readOnly: true,
      challenge: {
        trackId: CHALLENGE_TRACKS.DESIGN,
        metadata: [
          {
            name: 'submissionLimit',
            value: '{"unlimited":"true","limit":"false","count":""}'
          }
        ]
      }
    })

    expect(container.textContent).not.toContain('Maximum Number of Submissions')
    expect(container.textContent).not.toContain('Unlimited')
  })
})
