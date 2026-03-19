/* global describe, it, expect, beforeEach, jest */

import { decodeToken } from 'tc-auth-lib'
import { PROJECT_MEMBER_INVITE_STATUS_PENDING, PROJECT_ROLES } from '../config/constants'
import {
  checkCanCreateProject,
  checkCanManageProject,
  checkCanManageProjectBillingAccount,
  checkManager,
  checkIsUserInvitedToProject,
  getProjectMemberByUserId
} from './tc'

jest.mock('tc-auth-lib', () => ({
  decodeToken: jest.fn()
}))

jest.mock('../services/challenges', () => ({
  fetchResources: jest.fn(),
  fetchResourceRoles: jest.fn()
}))

jest.mock('../config/store', () => ({
  getState: jest.fn()
}))

describe('checkCanManageProjectBillingAccount', () => {
  beforeEach(() => {
    decodeToken.mockReset()
  })

  it('allows administrators to manage project billing accounts', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['administrator']
    })

    expect(
      checkCanManageProjectBillingAccount('token', {
        members: []
      })
    ).toBe(true)
  })

  it('allows full-access project members to manage project billing accounts', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['project manager']
    })

    expect(
      checkCanManageProjectBillingAccount('token', {
        members: [{
          userId: '1001',
          role: PROJECT_ROLES.MANAGER
        }]
      })
    ).toBe(true)
  })

  it('blocks project-manager roles without full-access project membership', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['project manager']
    })

    expect(
      checkCanManageProjectBillingAccount('token', {
        members: [{
          userId: '1001',
          role: PROJECT_ROLES.WRITE
        }]
      })
    ).toBe(false)
  })

  it('blocks talent-manager roles without full-access project membership', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['talent manager']
    })

    expect(
      checkCanManageProjectBillingAccount('token', {
        members: [{
          userId: '1001',
          role: PROJECT_ROLES.WRITE
        }]
      })
    ).toBe(false)
  })
})

describe('checkCanManageProject', () => {
  beforeEach(() => {
    decodeToken.mockReset()
  })

  it('allows project-manager roles to manage projects when they have full access', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['project manager']
    })

    expect(
      checkCanManageProject('token', {
        members: [{
          userId: '1001',
          role: PROJECT_ROLES.MANAGER
        }]
      })
    ).toBe(true)
  })

  it('blocks project-manager roles from managing projects without full access', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['project manager']
    })

    expect(
      checkCanManageProject('token', {
        members: [{
          userId: '1001',
          role: PROJECT_ROLES.WRITE
        }]
      })
    ).toBe(false)
  })

  it('allows talent-manager roles to manage projects when they have full access', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['talent manager']
    })

    expect(
      checkCanManageProject('token', {
        members: [{
          userId: '1001',
          role: PROJECT_ROLES.MANAGER
        }]
      })
    ).toBe(true)
  })
})

describe('checkManager', () => {
  beforeEach(() => {
    decodeToken.mockReset()
  })

  it('treats talent-manager tokens as manager-tier access', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['talent manager']
    })

    expect(checkManager('token')).toBe(true)
  })

  it('treats topcoder-talent-manager tokens as manager-tier access', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['topcoder talent manager']
    })

    expect(checkManager('token')).toBe(true)
  })
})

describe('checkCanCreateProject', () => {
  beforeEach(() => {
    decodeToken.mockReset()
  })

  it('allows project-manager roles to create projects', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['project manager']
    })

    expect(checkCanCreateProject('token')).toBe(true)
  })

  it('allows copilots to create projects', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['copilot']
    })

    expect(checkCanCreateProject('token')).toBe(true)
  })

  it('blocks read-only users from creating projects', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['topcoder user']
    })

    expect(checkCanCreateProject('token')).toBe(false)
  })
})

describe('getProjectMemberByUserId', () => {
  it('matches project members even when ids differ by string vs number types', () => {
    expect(getProjectMemberByUserId({
      members: [{
        userId: '1001',
        role: PROJECT_ROLES.WRITE
      }]
    }, 1001)).toEqual({
      userId: '1001',
      role: PROJECT_ROLES.WRITE
    })
  })
})

describe('checkIsUserInvitedToProject', () => {
  beforeEach(() => {
    decodeToken.mockReset()
  })

  it('returns the pending invite for the authenticated user', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      email: 'member@test.com'
    })

    expect(checkIsUserInvitedToProject('token', {
      invites: [{
        status: PROJECT_MEMBER_INVITE_STATUS_PENDING,
        userId: '1001',
        email: 'member@test.com'
      }]
    })).toEqual({
      status: PROJECT_MEMBER_INVITE_STATUS_PENDING,
      userId: '1001',
      email: 'member@test.com'
    })
  })

  it('ignores non-pending invites for the authenticated user', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      email: 'member@test.com'
    })

    expect(checkIsUserInvitedToProject('token', {
      invites: [{
        status: 'declined',
        userId: '1001',
        email: 'member@test.com'
      }]
    })).toBeUndefined()
  })
})
