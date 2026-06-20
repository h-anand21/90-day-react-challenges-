/**
 * locationService.js — Mobile Side
 *
 * Mobile SIRF backend ko call karta hai.
 * Backend khud Google → Hardcoded fallback handle karta hai.
 *
 * Usage:
 *   import { searchPlaces } from '../utils/locationService';
 *   const results = await searchPlaces('Goa', 'IN');
 */

import client from '../api/client';

/**
 * Search places via backend API.
 * Backend → Google Places (primary) → Hardcoded fallback (secondary)
 *
 * @param {string} query - User typed text e.g. "Goa"
 * @param {string|null} countryCode - ISO2 e.g. "IN", "US" (optional)
 * @returns {Promise<Array<{label: string, latitude: number|null, longitude: number|null}>>}
 */
export const searchPlaces = async (query, countryCode = null) => {
  if (!query || query.trim().length < 2) return [];

  try {
    const params = { q: query.trim() };
    if (countryCode) params.countryCode = countryCode;

    const res = await client.get('/places/search', { params });

    if (res.data.success && Array.isArray(res.data.results)) {
      return res.data.results;
    }
    return [];
  } catch (err) {
    console.warn('[LocationService] Backend call failed:', err.message);
    return [];
  }
};
