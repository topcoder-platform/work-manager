/* global describe, it, expect, beforeEach, jest */

import { decodeToken } from 'tc-auth-lib'
import { PROJECT_MEMBER_INVITE_STATUS_PENDING, PROJECT_ROLES } from '../config/constants'
import {
  checkCanViewProjectAssets,
  checkIsProjectMember,
  checkManager,
  checkTalentManager,
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

describe('checkTalentManager', () => {
  beforeEach(() => {
    decodeToken.mockReset()
  })

  it('treats talent-manager tokens as talent-manager access', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['talent manager']
    })

    expect(checkTalentManager('token')).toBe(true)
  })

  it('treats topcoder-talent-manager tokens as talent-manager access', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['topcoder talent manager']
    })

    expect(checkTalentManager('token')).toBe(true)
  })

  it('does not treat project-manager tokens as talent-manager access', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['project manager']
    })

    expect(checkTalentManager('token')).toBe(false)
  })
})

describe('checkIsProjectMember', () => {
  beforeEach(() => {
    decodeToken.mockReset()
  })

  it('returns true when the authenticated user is on the project member list', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['topcoder user']
    })

    expect(checkIsProjectMember('token', {
      members: [{
        userId: '1001',
        role: PROJECT_ROLES.WRITE
      }]
    })).toBe(true)
  })

  it('returns false when the authenticated user is not on the project member list', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['topcoder user']
    })

    expect(checkIsProjectMember('token', {
      members: [{
        userId: '1002',
        role: PROJECT_ROLES.WRITE
      }]
    })).toBe(false)
  })
})

describe('checkCanViewProjectAssets', () => {
  beforeEach(() => {
    decodeToken.mockReset()
  })

  it('allows administrators to view project assets', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['administrator']
    })

    expect(checkCanViewProjectAssets('token', {
      members: []
    })).toBe(true)
  })

  it('allows project members to view project assets even without elevated global roles', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['topcoder user']
    })

    expect(checkCanViewProjectAssets('token', {
      members: [{
        userId: '1001',
        role: PROJECT_ROLES.READ
      }]
    })).toBe(true)
  })

  it('blocks non-members without admin or copilot access from viewing project assets', () => {
    decodeToken.mockReturnValue({
      userId: '1001',
      roles: ['topcoder user']
    })

    expect(checkCanViewProjectAssets('token', {
      members: [{
        userId: '1002',
        role: PROJECT_ROLES.READ
      }]
    })).toBe(false)
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
