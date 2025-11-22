// ✅ Function to search articles from the Guardian Open Platform API
// Takes a keyword and page number, returns a list of articles with title, url, and description

export async function searchGuardian(keyword: string, page: number) {
  const apiKey = process.env.GUARDIAN_API_KEY  // Load API key from environment variable
  const pageSize = 50  // max allowed by Guardian

  try {
    // Build the API URL with query params: keyword, api key, pagination, and show trail text
    const url = `https://content.guardianapis.com/search` +
                `?q=${encodeURIComponent(keyword)}` +
                `&api-key=${apiKey}` +
                `&page=${page}` +
                `&page-size=${pageSize}` +
                `&show-fields=trailText`

    const res = await fetch(url)  // Make the HTTP request
    if (!res.ok) throw new Error(`Guardian API error: ${res.status}`)  // Handle HTTP errors
    const data = await res.json()  // Parse JSON response

    // Map API response into simplified article objects
    return (data.response.results || []).map((item: any) => ({
      source: 'Guardian',
      title: item.webTitle,
      url: item.webUrl,
      description: item.fields?.trailText || ''
    }))
  } catch (err) {
    console.error('Failed to fetch Guardian articles', err)  // Log any errors
    return []  // Return empty list on failure
  }
}
