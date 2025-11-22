/**
 * ✅ tests/pages/api/search.test.ts
 * Tests the /api/search API route handler.
 * - Uses Vitest to mock external dependencies.
 * - Verifies correct default behavior, pagination, and response shape.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import handler from '../../pages/api/search'
import type { NextApiRequest, NextApiResponse } from 'next'

// ✅ Mock the searchSources array and its functions
vi.mock('../../lib/searchSources', () => {
  return {
    searchSources: [
      {
        name: 'mockSource1',
        fn: vi.fn(async (keyword: string, page: number) => [
          {
            source: 'mockSource1',
            title: `Title for ${keyword}`,
            url: `https://example.com/${keyword}`,
            description: 'Description here'
          }
        ])
      },
      {
        name: 'mockSource2',
        fn: vi.fn(async () => [])
      }
    ]
  }
})

// ✅ Helper to create mock Next.js req/res objects
function createMocks() {
  const req = {
    query: {}
  } as unknown as NextApiRequest

  let statusCode = 200
  const json = vi.fn()
  const status = vi.fn(() => {
    return { json }
  })

  const res = {
    status: (code: number) => {
      statusCode = code
      return { json }
    },
    json
  } as unknown as NextApiResponse

  return { req, res, statusCode, status, json }
}

// ✅ Group of tests for the /api/search handler
describe('/api/search handler', () => {
  it('returns paginated results with defaults', async () => {
    const { req, res, json } = createMocks()

    req.query = {}  // No query params, should fall back to defaults

    await handler(req, res)

    // ✅ Check if response JSON was called with correct data
    expect(json).toHaveBeenCalled()
    const data = json.mock.calls[0][0]

    expect(data).toHaveProperty('articles')
    expect(Array.isArray(data.articles)).toBe(true)
    expect(data).toHaveProperty('searchKeyword', 'apple') // default keyword
    expect(data).toHaveProperty('pageNo', 1)
    expect(data.totalPages).toBeGreaterThanOrEqual(0)
    expect(data.currentPage).toBe(data.pageNo)
    expect(data._links).toHaveProperty('self')
  })

  it('respects page param and pagination links', async () => {
    const { req, res, json } = createMocks()
    req.query = { keyword: 'test', page: '1', city: 'TestCity' }

    await handler(req, res)

    const data = json.mock.calls[0][0]
    expect(data.searchKeyword).toBe('test')
    expect(data.city).toBe('TestCity')
    expect(data.pageNo).toBe(1)
    expect(data._links.prev).toBeNull()
    expect(data._links.next).toBeDefined()
  })
})
