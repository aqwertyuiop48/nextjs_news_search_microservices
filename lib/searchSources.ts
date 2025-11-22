// lib/searchSources.ts

// Import individual source search functions
import { searchGuardian } from './guardian'
import { searchNYT } from './nyt'

// Define an array of news sources with their names and corresponding search functions
// This makes it easy to loop over and query multiple sources in parallel
export const searchSources = [
  { name: 'Guardian', fn: searchGuardian },
  { name: 'NYT', fn: searchNYT }
]
