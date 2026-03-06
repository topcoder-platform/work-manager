/* global describe, it, expect */

import {
  fromEngagementStatusApi,
  toEngagementStatusApi
} from './engagements'

describe('engagement status normalization', () => {
  it('converts ON_HOLD API values to On Hold labels', () => {
    expect(fromEngagementStatusApi('ON_HOLD')).toBe('On Hold')
    expect(fromEngagementStatusApi(' on_hold ')).toBe('On Hold')
  })

  it('converts On Hold labels to ON_HOLD API values', () => {
    expect(toEngagementStatusApi('On Hold')).toBe('ON_HOLD')
    expect(toEngagementStatusApi('on hold')).toBe('ON_HOLD')
  })
})
