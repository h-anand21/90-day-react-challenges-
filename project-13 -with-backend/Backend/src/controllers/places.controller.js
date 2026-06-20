import { searchHardcoded } from '../data/destinations.js';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

/**
 * GET /api/places/search?q=Goa&countryCode=IN
 *
 * 2-tier strategy:
 *   1. Google Places API (New) — places.googleapis.com/v1
 *   2. Hardcoded destinations fallback
 */
export const searchPlaces = async (req, res) => {
  const query = (req.query.q || '').trim();
  const countryCode = (req.query.countryCode || '').trim().toLowerCase();

  if (!query || query.length < 2) {
    return res.json({ success: true, source: 'none', results: [] });
  }

  // ── Tier 1: Google Places API (New) ──────────────────────────────────────
  if (GOOGLE_API_KEY) {
    try {
      // Step 1 — Autocomplete to get place IDs + names
      const acBody = {
        input: query,
        ...(countryCode && {
          includedRegionCodes: [countryCode],
        }),
      };

      const acRes = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
        },
        body: JSON.stringify(acBody),
      });

      const acData = await acRes.json();

      if (acData.suggestions && acData.suggestions.length > 0) {
        // Step 2 — Get coordinates for each place via Place Details
        const results = await Promise.all(
          acData.suggestions.slice(0, 6).map(async (s) => {
            const prediction = s.placePrediction;
            if (!prediction) return null;

            try {
              const detailRes = await fetch(
                `https://places.googleapis.com/v1/${prediction.place}`,
                {
                  headers: {
                    'X-Goog-Api-Key': GOOGLE_API_KEY,
                    'X-Goog-FieldMask': 'location,displayName,formattedAddress',
                  },
                }
              );
              const detail = await detailRes.json();
              return {
                label: detail.formattedAddress || prediction.text?.text || '',
                latitude: detail.location?.latitude ?? null,
                longitude: detail.location?.longitude ?? null,
              };
            } catch {
              return {
                label: prediction.text?.text || '',
                latitude: null,
                longitude: null,
              };
            }
          })
        );

        const filtered = results.filter(r => r && r.label);
        if (filtered.length > 0) {
          console.log(`[PlacesController] ✅ Google Places (New) — "${query}" → ${filtered.length} results`);
          return res.json({ success: true, source: 'google', results: filtered });
        }
      }

      console.warn(`[PlacesController] Google returned no suggestions for "${query}" — using hardcoded`);
    } catch (err) {
      console.warn(`[PlacesController] Google error: ${err.message} — using hardcoded`);
    }
  } else {
    console.warn('[PlacesController] No GOOGLE_PLACES_API_KEY set — using hardcoded fallback');
  }

  // ── Tier 2: Hardcoded fallback ────────────────────────────────────────────
  const results = searchHardcoded(query);
  console.log(`[PlacesController] ✅ Hardcoded — "${query}" → ${results.length} results`);
  return res.json({ success: true, source: 'hardcoded', results });
};

