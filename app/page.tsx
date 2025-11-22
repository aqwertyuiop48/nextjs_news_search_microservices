// ✅ This is a client-side React component for a simple paginated news search page.
// It fetches results from /api/search based on a keyword and page number,
// shows loading/error states, and displays articles with pagination controls.

'use client' // ✅ Marks this file as a client component in Next.js so we can use hooks like useState, useEffect

import { useState, useEffect } from 'react'

export default function Page() {
  // State variables
  const [keyword, setKeyword] = useState('apple')        // Search keyword, default is 'apple'
  const [results, setResults] = useState<any>(null)      // API search results
  const [loading, setLoading] = useState(false)          // Whether a search is currently in progress
  const [error, setError] = useState<string | null>(null) // Error message if something goes wrong
  const [page, setPage] = useState(1)                    // Current page number for pagination

  // Function to perform the search request
  /*
  async/await are language keywords used to work with asynchronous code in a way that looks synchronous — 
  making code easier to read and write.
  They are built on top of Promises.
 */
  async function search() {
    setLoading(true)        // Start loading
    setError(null)         // Reset error state
    try {
      // Make API request to /api/search with keyword and page
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}&page=${page}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setResults(data)     // Save results to state
    } catch (err) {
      setError('Something went wrong. Please try again.') // Show error
      setResults(null)     // Clear previous results
    }
    setLoading(false)      // Stop loading
  }

  // Automatically call search() whenever page number changes
  useEffect(() => {
    search()
  }, [page])

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        {/* Page title */}
        <h1 className="text-2xl font-bold mb-4 text-center">📰 News Search</h1>

        {/* Input and search button */}
        <div className="flex items-center space-x-2 mb-6">
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)} // Update keyword when typing
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring"
            placeholder="Enter keyword..."
          />
          <button
            onClick={() => { setPage(1); search() }}  // Reset to first page and start search
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading} // Disable when loading
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Show error message if any */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Show results if present */}
        {results && (
          <div>
            {/* Summary of current search */}
            <h2 className="text-xl font-semibold mb-2">
              Results for:: <span className="text-blue-600">{results.searchKeyword}</span>
            </h2>
            <p className="text-gray-500 mb-4">
              Page {results.pageNo} of {results.totalPages} • Time taken: {results.timeTakenMs} ms
            </p>

            {/* Show message if no articles found */}
            {results.articles.length === 0 ? (
              <p className="text-center text-gray-500">No articles found.</p>
            ) : (
              <>
                {/* List of article items */}
                <ul className="space-y-4 mb-4">
                  {results.articles.map((item: any, idx: number) => (
                    <li key={idx} className="border p-3 rounded hover:bg-gray-50">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 font-medium hover:underline"
                      >
                        {item.title}
                      </a>{' '}
                      <span className="text-xs text-gray-500">({item.source})</span>
                      {item.description && (
                        <p
                          className="text-gray-600 text-sm mt-1"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                    </li>
                  ))}
                </ul>

                {/* Pagination buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))} // Go to previous page
                    disabled={page <= 1 || loading}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(prev => prev + 1)} // Go to next page
                    disabled={results.nextPage === null || loading}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
