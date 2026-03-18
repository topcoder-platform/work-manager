/* global describe, it, expect, beforeEach, jest */

import { decodeToken } from 'tc-auth-lib'
import { PROJECT_ROLES } from '../config/constants'
import { checkCanManageProjectBillingAccount } from './tc'

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
