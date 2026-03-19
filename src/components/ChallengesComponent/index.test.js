/* eslint-disable react/prop-types */
/* global describe, it, expect, beforeEach, afterEach, jest */

import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'
import { PROJECT_ROLES, PROJECT_STATUS } from '../../config/constants'
import ChallengesComponent from './index'

jest.mock('../Buttons', () => {
  const React = require('react')

  const renderButton = (text, disabled) => React.createElement(
    'button',
    { type: 'button', disabled },
    text
  )

  return {
    PrimaryButton: ({ text, disabled }) => renderButton(text, disabled),
    OutlineButton: ({ text, disabled }) => renderButton(text, disabled)
  }
})

jest.mock('./ChallengeList', () => () => null)
jest.mock('./ProjectStatus', () => () => null)
jest.mock('react-helmet', () => ({
  Helmet: () => null
}))

jest.mock('../../util/tc', () => ({
  checkAdmin: jest.fn(),
  checkReadOnlyRoles: jest.fn(),
  checkCanManageProject: jest.fn(),
  checkCanViewProjectAssets: jest.fn(),
  checkManager: jest.fn(),
  getProjectMemberRole: jest.fn((project, userId) => {
    const members = (project && project.members) || []
    const member = members.find(candidate => `${candidate.userId}` === `${userId}`) || null
    return member ? member.role : null
  })
}))

const tcUtils = require('../../util/tc')

describe('ChallengesComponent', () => {
  let container

  const defaultProps = {
    challenges: [],
    projects: [],
    fetchNextProjects: () => {},
    activeProject: {
      id: 100537,
      name: 'Work Manager - Topcoder',
      status: PROJECT_STATUS.ACTIVE,
      members: []
    },
    isLoading: false,
    warnMessage: '',
    filterChallengeName: '',
    filterChallengeType: null,
    filterProjectOption: null,
    filterDate: null,
    filterSortBy: '',
    filterSortOrder: '',
    status: 'all',
    activeProjectId: 100537,
    loadChallengesByPage: () => {},
    page: 1,
    perPage: 10,
    totalChallenges: 0,
    partiallyUpdateChallengeDetails: () => {},
    deleteChallenge: () => {},
    setActiveProject: () => {},
    isBillingAccountExpired: false,
    dashboard: false,
    billingStartDate: '',
    billingEndDate: '',
    billingAccounts: [],
    updateProject: () => {},
    isBillingAccountsLoading: false,
    currentBillingAccount: null,
    isBillingAccountLoadingFailed: false,
    isBillingAccountLoading: false,
    selfService: false,
    auth: {
      token: 'token',
      user: {
        userId: '12345',
        handle: 'member'
      }
    },
    challengeTypes: []
  }

  const renderComponent = (props = {}) => {
    act(() => {
      ReactDOM.render(
        <MemoryRouter>
          <ChallengesComponent {...defaultProps} {...props} />
        </MemoryRouter>,
        container
      )
    })
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)

    tcUtils.checkAdmin.mockReturnValue(false)
    tcUtils.checkReadOnlyRoles.mockReturnValue(false)
    tcUtils.checkCanManageProject.mockReturnValue(false)
    tcUtils.checkCanViewProjectAssets.mockReturnValue(true)
    tcUtils.checkManager.mockReturnValue(false)
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    container.remove()
    container = null
    jest.clearAllMocks()
  })

  it('shows the Asset Library button for non-admin project members', () => {
    renderComponent({
      activeProject: {
        ...defaultProps.activeProject,
        members: [
          {
            userId: '12345',
            role: PROJECT_ROLES.WRITE
          }
        ]
      }
    })

    expect(container.textContent).toContain('Users')
    expect(container.textContent).toContain('Assets Library')
  })

  it('shows only the Asset Library action for read-only project members', () => {
    renderComponent({
      activeProject: {
        ...defaultProps.activeProject,
        members: [
          {
            userId: '12345',
            role: PROJECT_ROLES.READ
          }
        ]
      }
    })

    expect(container.textContent).toContain('Assets Library')
    expect(container.textContent).not.toContain('Users')
    expect(container.textContent).not.toContain('Launch New')
  })
})
