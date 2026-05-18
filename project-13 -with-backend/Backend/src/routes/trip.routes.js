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
      'https://cdn.pixabay.com/'
    ];

    const isAllowed = allowedPrefixes.some(prefix => url.startsWith(prefix));
    if (!isAllowed) {
      console.warn(`[image-proxy block] Blocked unauthorized SSRF target URL: "${url}"`);
      return res.status(403).send('Forbidden: Unauthorized image proxy target');
    }

    console.log(`[image-proxy] Proxying image request for: "${url}"`);
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[image-proxy] Target image fetch failed with status: ${response.status}`);
      return res.status(response.status).send('Failed to fetch target image');
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
