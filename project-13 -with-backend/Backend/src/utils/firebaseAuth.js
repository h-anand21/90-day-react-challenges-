import jwt from 'jsonwebtoken';
import dns from 'dns';

// Force Node.js inside Docker to resolve external DNS lookups via IPv4 first
dns.setDefaultResultOrder('ipv4first');

let cachedPublicKeys = null;
let cacheExpiry = 0;

/**
 * Fetches Google's public certificates used to sign Firebase ID tokens.
 * Caches keys locally to prevent excessive API requests.
 */
const fetchGooglePublicKeys = async () => {
  const now = Date.now();
  if (cachedPublicKeys && now < cacheExpiry) {
    return cachedPublicKeys;
  }

  console.log('[Firebase Auth] Fetching fresh public certificates from Google...');
  try {
    const response = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
    );
    if (!response.ok) {
      console.error(`[Firebase Auth] Google API returned non-OK status: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch Firebase public keys from Google (HTTP ${response.status})`);
    }

    const keys = await response.json();
    
    // Cache public keys for 6 hours
    cachedPublicKeys = keys;
    cacheExpiry = now + 6 * 60 * 60 * 1000;
    return keys;
  } catch (err) {
    console.error('[Firebase Auth] Network/Fetch Error:', err);
    throw err;
  }
};

/**
 * Cryptographically verifies the Firebase ID Token sent by the client.
 * Validates signature, expiration, audience (project ID), and issuer.
 * 
 * @param {string} token - The Firebase ID Token (JWT)
 * @returns {Promise<object>} The decoded token payload containing email, uid, etc.
 */
export const verifyFirebaseToken = async (token) => {
  try {
    // 1. Secure Dev/Testing Mock Token Handler (Only active in local dev, strictly blocked in production)
    if (token.startsWith('mock-google-token-')) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Mock authentication tokens are strictly forbidden in production');
      }
      
      const parts = token.split('-');
      const email = parts[3];
      const name = parts[4] ? decodeURIComponent(parts[4]) : email.split('@')[0];
      
      console.log(`[Firebase Auth Mock] Securely bypassed signature check for local testing email: "${email}"`);
      return {
        email,
        name,
        uid: `mock-google-uid-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
      };
    }

    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header.kid) {
      throw new Error('Invalid token structure');
    }

    const kid = decodedHeader.header.kid;
    const publicKeys = await fetchGooglePublicKeys();
    const publicKey = publicKeys[kid];

    if (!publicKey) {
      throw new Error('Certificate matching token key ID (kid) not found');
    }

    // Your Firebase Project ID
    const projectId = process.env.FIREBASE_PROJECT_ID || 'tripsync-e8f1e';
    
    // Perform standard JWT signature verification
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });

    return decoded;
  } catch (error) {
    console.error('[Firebase Verify Error]', error.message);
    throw new Error(`Firebase token verification failed: ${error.message}`);
  }
};
