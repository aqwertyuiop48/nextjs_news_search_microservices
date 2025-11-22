// ✅ Function to search articles from the New York Times Article Search API
// Takes a keyword and page number, returns a list of simplified articles

export async function searchNYT(keyword: string, page: number) {
  const apiKey = process.env.NYT_API_KEY  // Load NYT API key from environment variable

  try {
    // Build the API URL with query params: keyword, api key, and pagination
    const url = `https://api.nytimes.com/svc/search/v2/articlesearch.json` +
                `?q=${encodeURIComponent(keyword)}` +
                `&api-key=${apiKey}` +
                `&page=${page}`

    const res = await fetch(url)  // Make the HTTP request
    if (!res.ok) throw new Error(`NYT API error: ${res.status}`)  // Handle HTTP errors
    const data = await res.json()  // Parse JSON response

    // Map API response into simplified article objects
    return (data.response.docs || []).map((item: any) => ({
      source: 'NYT',
      title: item.headline?.main,
      url: item.web_url,
      description: item.snippet || ''
    }))
  } catch (err) {
    console.error('Failed to fetch NYT articles', err)  // Log any errors
    return []  // Return empty list on failure
  }
}
