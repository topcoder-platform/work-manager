/* global describe, it, expect, beforeEach, jest */

import { decodeToken } from 'tc-auth-lib'
import { PROJECT_ROLES } from '../config/constants'
import { checkCanCreateProject, checkCanManageProject, checkCanManageProjectBillingAccount } from './tc'

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
