/* global describe, it, expect */

import moment from 'moment-timezone'
import {
  deserializeTentativeAssignmentDate,
  serializeTentativeAssignmentDate
} from './assignmentDates'

describe('assignment date helpers', () => {
  it('serializes assignment dates using the canonical noon UTC timestamp', () => {
    const result = serializeTentativeAssignmentDate(moment('2026-03-01', 'YYYY-MM-DD'))

    expect(result).toBe('2026-03-01T12:00:00.000Z')
  })

  it('deserializes canonical assignment timestamps into local date objects', () => {
    const result = deserializeTentativeAssignmentDate('2026-03-01T12:00:00.000Z')

    expect(result).toBeInstanceOf(Date)
    expect(moment(result).format('MM/DD/YYYY')).toBe('03/01/2026')
  })
})
