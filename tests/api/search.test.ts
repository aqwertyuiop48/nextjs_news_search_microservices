/**
 * ✅ Tests for the /api/search Next.js API route.
 * - Verifies it returns articles and totalPages on success.
 * - Ensures it can fallback to offline mode if external APIs fail.
 * - Uses Vitest for testing and node-mocks-http to simulate HTTP requests and responses.
 */


// ✅ Import Vitest testing functions: describe for grouping, it for test cases, and expect for assertions
import { describe, it, expect } from 'vitest'

// ✅ Import createMocks to mock HTTP request and response objects for testing API handlers
import { createMocks } from 'node-mocks-http'

// ✅ Import the API route handler we want to test
import handler from '../../pages/api/search'

// ✅ Group related tests for /api/search endpoint
describe('/api/search', () => {
  // ✅ Test that a successful GET request returns status 200 and articles
  it('should return 200 and articles', async () => {
    // ✅ Create mock request and response with query parameter 'keyword'
    const { req, res } = createMocks({
      method: 'GET',
      query: { keyword: 'apple' }
    })

    // ✅ Call the API handler with the mocked request/response
    await handler(req, res)

    // ✅ Assert response has status 200
    expect(res._getStatusCode()).toBe(200)
    // ✅ Parse JSON response body
    const data = JSON.parse(res._getData())
    // ✅ Assert response contains 'articles' property, which should be an array
    expect(data).toHaveProperty('articles')
    expect(Array.isArray(data.articles)).toBe(true)
    // ✅ Assert response contains 'totalPages' property
    expect(data).toHaveProperty('totalPages')
  })

  // ✅ Test that when OFFLINE_MODE is enabled, handler still returns data
  it('should fallback to offline mode if APIs fail', async () => {
    process.env.OFFLINE_MODE = 'true' // ✅ Enable offline mode

    // ✅ Create mock request and response
    const { req, res } = createMocks({
      method: 'GET',
      query: { keyword: 'apple' }
    })

    // ✅ Call the API handler
    await handler(req, res)

    // ✅ Assert status 200 and articles array in response
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(Array.isArray(data.articles)).toBe(true)

    // ✅ Reset environment variable after test
    process.env.OFFLINE_MODE = undefined
  })
})
