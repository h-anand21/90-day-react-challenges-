import { Router } from 'express';
import {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripMembers,
  updateMemberRole,
  removeMember,
  addMemberByEmail,
} from '../controllers/trip.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireTripRole } from '../middleware/tripRole.middleware.js';
import Trip from '../models/Trip.js';
import { fetchDestinationImage } from '../utils/imageSearch.js';

const router = Router();

// Public Image proxy for hotlink-protected CDNs (like Pixabay)
router.get('/image-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send('URL query parameter is required');
    }

    // SSRF Protection: Only allow proxying from trusted image hosting platforms
    const allowedPrefixes = [
      'https://images.unsplash.com/',
      'https://pixabay.com/',
      'https://cdn.pixabay.com/',
      'https://upload.wikimedia.org/'
    ];

    const isAllowed = allowedPrefixes.some(prefix => url.startsWith(prefix));
    if (!isAllowed) {
      console.warn(`[image-proxy block] Blocked unauthorized SSRF target URL: "${url}"`);
      return res.status(403).send('Forbidden: Unauthorized image proxy target');
    }

    console.log(`[image-proxy] Proxying image request for: "${url}"`);
    let response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      console.warn(`[image-proxy] Target image fetch failed with status: ${response.status}`);

      // Auto-Healing System: If it's a Pixabay URL and it fails (e.g. 400 Expired), we try to heal it!
      if (url.includes('pixabay.com')) {
        console.log(`[image-proxy] Attempting to auto-heal Pixabay URL: "${url}"`);
        try {
          let newUrl = null;
          const parsedUrl = new URL(url);
          const pixabayId = parsedUrl.searchParams.get('pixabay_id');

          if (pixabayId && process.env.PIXABAY_API_KEY) {
            console.log(`[image-proxy] Healing via Pixabay ID: ${pixabayId}`);
            const queryByIdUrl = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&id=${pixabayId}`;
            const idRes = await fetch(queryByIdUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });
            if (idRes.ok) {
              const idData = await idRes.json();
              if (idData.hits && idData.hits.length > 0) {
                newUrl = `${idData.hits[0].webformatURL}?pixabay_id=${pixabayId}`;
                console.log(`[image-proxy] Successfully fetched new URL by ID: ${newUrl}`);
              }
            }
          }

          // If no ID found or ID query failed, fallback to database lookup by old URL
          if (!newUrl) {
            console.log(`[image-proxy] Looking up Trip by coverImage: "${url}"`);
            const trip = await Trip.findOne({ coverImage: url });
            if (trip) {
              console.log(`[image-proxy] Found Trip "${trip.title}" (${trip._id}). Regenerating cover image...`);
              newUrl = await fetchDestinationImage(trip.destination);
              console.log(`[image-proxy] Regenerated cover image: ${newUrl}`);
            }
          }

          // If we successfully resolved a new URL, update the database and fetch the new image
          if (newUrl) {
            console.log(`[image-proxy] Updating database coverImage from "${url}" to "${newUrl}"`);
            await Trip.updateMany({ coverImage: url }, { coverImage: newUrl });

            // Fetch the new image URL
            response = await fetch(newUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });
            if (response.ok) {
              console.log(`[image-proxy] Fetch succeeded with the healed URL!`);
            }
          }
        } catch (healError) {
          console.error('[image-proxy] Auto-healing failed:', healError);
        }
      }

      if (!response.ok) {
        // Fallback to default Unsplash image
        const fallbackUrl = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80';
        console.log(`[image-proxy] Proxy failed completely. Serving fallback image: ${fallbackUrl}`);
        response = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (!response.ok) {
          return res.status(response.status).send('Failed to fetch target image');
        }
      }
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (error) {
    console.error('[image-proxy error]', error);
    return res.status(500).send('Image proxy error');
  }
});

// All trip routes require authentication
router.use(protect);

// Trip CRUD
router.post('/', createTrip);
router.get('/', getMyTrips);
router.get('/:tripId', requireTripRole(), getTripById);
router.put('/:tripId', requireTripRole(['owner', 'editor']), updateTrip);
router.delete('/:tripId', requireTripRole(['owner', 'editor']), deleteTrip);

// Member management (owner only for role changes / removal)
router.get('/:tripId/members', requireTripRole(), getTripMembers);
router.patch('/:tripId/members/:userId/role', requireTripRole(['owner']), updateMemberRole);
router.delete('/:tripId/members/:userId', requireTripRole(['owner']), removeMember);
router.post('/:tripId/members', requireTripRole(['owner']), addMemberByEmail);

export default router;
