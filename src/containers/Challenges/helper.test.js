/* global describe, it, expect */

import { getActiveProject } from './helper'

describe('getActiveProject', () => {
  it('returns the project detail when the route project id matches a string project id', () => {
    const projectDetail = {
      id: '100566',
      name: 'Project Phoenix'
    }

    expect(getActiveProject(projectDetail, 100566, 100566)).toEqual(projectDetail)
  })

  it('returns an empty object when the loaded project does not match the current project context', () => {
    const projectDetail = {
      id: '100566',
      name: 'Project Phoenix'
    }

    expect(getActiveProject(projectDetail, 100567, 100567)).toEqual({})
  })
})
