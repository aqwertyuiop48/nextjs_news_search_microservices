// pages/api/search.ts

// Import Next.js API types
import type { NextApiRequest, NextApiResponse } from 'next'
// Import filesystem and path modules for reading offline data
import fs from 'fs/promises'
import path from 'path'
// Import the list of search source functions (Guardian, NYT)
import { searchSources } from '../../lib/searchSources'

// Define the Article type returned by sources
type Article = {
  source: string
  title: string
  url: string
  description: string
}

// Define the full API response shape, including metadata and links
type ApiResponse = {
  newsWebsite: string
  articles: Article[]
  totalPages: number
  currentPage: number
  searchKeyword: string
  city: string
  pageNo: number
  prevPage: number | null
  nextPage: number | null
  totalResults: number
  timeTakenMs: number
  _links: {
    self: string
    prev: string | null
    next: string | null
  }
  error?: string | null
}

// Number of articles per page
const PAGE_SIZE = 10

// Helper to load fallback data from a local JSON file if APIs fail
async function loadOfflineData(): Promise<{ guardian: Article[]; nyt: Article[] }> {
  try {
    const file = await fs.readFile(path.join(process.cwd(), 'public', 'offline.json'), 'utf-8')
    return JSON.parse(file)
  } catch (error) {
    console.error('Failed to load offline data:', error)
    return { guardian: [], nyt: [] }
  }
}

// Default API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const start = Date.now()  // Track time taken for request

  // ✅ Validate & sanitize keyword
  let keyword = (req.query.keyword as string)?.trim() || 'apple'
  if (keyword.length > 50) keyword = keyword.slice(0, 50)
  keyword = keyword.replace(/[^a-zA-Z0-9 ]/g, '')
  if (!keyword) {
    return res.status(400).json({
      newsWebsite: 'My News Aggregator',
      articles: [],
      totalPages: 0,
      currentPage: 0,
      searchKeyword: '',
      city: '',
      pageNo: 0,
      prevPage: null,
      nextPage: null,
      totalResults: 0,
      timeTakenMs: Date.now() - start,
      _links: { self: '', prev: null, next: null },
      error: 'Invalid keyword after sanitization'
    })
  }

  // ✅ Validate page number
  const requestedPage = parseInt((req.query.page as string) || '1', 10)
  const page = isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage

  // ✅ Validate & sanitize city
  let city = (req.query.city as string)?.trim() || 'New York'
  if (city.length > 50) city = city.slice(0, 50)
  city = city.replace(/[^a-zA-Z0-9 ]/g, '')

  // Check if running in offline mode (using local file)
  const offlineMode = process.env.OFFLINE_MODE === 'true'

  let allResults: Article[] = []  // Will collect articles here
  let errorMsg: string | null = null  // Collect error messages if needed

  try {
    if (!offlineMode) {
      // ✅ Fetch from dynamic sources (Guardian, NYT)
      for (const source of searchSources) {
        const results = await source.fn(keyword, page)
        allResults = allResults.concat(results)
      }
    } else {
      // ✅ Fallback to offline data
      const offlineData = await loadOfflineData()
      allResults = [...offlineData.guardian, ...offlineData.nyt]
    }
  } catch (error) {
    console.error('API fetch failed, falling back to offline data:', error)
    try {
      const offlineData = await loadOfflineData()
      allResults = [...offlineData.guardian, ...offlineData.nyt]
      if (allResults.length === 0) {
        errorMsg = 'Offline data empty; no articles available'
      }
    } catch (offlineError) {
      console.error('Offline data load failed too:', offlineError)
      errorMsg = 'API & offline data both failed'
      allResults = []
    }
  }

  // ✅ Remove duplicate articles by URL
  const deduped = Array.from(new Map(allResults.map(item => [item.url, item])).values())

  // ✅ Handle pagination logic
  const totalResults = deduped.length
  const totalPages = totalResults > 0 ? Math.ceil(totalResults / PAGE_SIZE) : 0
  const currentPage = totalPages === 0 ? 0 : Math.min(page, totalPages)
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const paginatedArticles = totalResults === 0 ? [] : deduped.slice(startIdx, startIdx + PAGE_SIZE)

  // ✅ Build HATEOAS links for navigation
  const baseUrl = `/api/search?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`
  const links = {
    self: `${baseUrl}&page=${currentPage}`,
    prev: currentPage > 1 ? `${baseUrl}&page=${currentPage - 1}` : null,
    next: currentPage < totalPages ? `${baseUrl}&page=${currentPage + 1}` : null
  }

  const timeTakenMs = Date.now() - start  // Calculate total request time

  // ✅ Send JSON response
  return res.status(200).json({
    newsWebsite: 'My News Aggregator',
    articles: paginatedArticles,
    totalPages,
    currentPage,
    searchKeyword: keyword,
    city,
    pageNo: currentPage,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    totalResults,
    timeTakenMs,
    _links: links,
    error: errorMsg
  })
}
