import { get, pick, camelCase } from 'lodash'

export function paginationHeaders (response) {
  const headers = pick(get(response, 'headers'), 'x-page', 'x-per-page', 'x-total', 'x-total-pages')
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [camelCase(key), +value]))
}
