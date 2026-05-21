/**
 * Intelligent Destination-Based Image System
 * Automatically matches destinations with high-quality, dark-friendly, travel-style illustrations or scenic wallpapers.
 * Integrates an optional Unsplash API search fallback if UNSPLASH_ACCESS_KEY is configured.
 */

// A curated library of premium, dark-friendly travel photography and illustrations for popular destinations.
// All URLs are pre-configured to be high-quality, cinematic, and dark-mode compatible.
const CURATED_DESTINATIONS = {
  goa: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', // Golden sunset beach
  darjeeling: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa', // Misty green hills/tea gardens
  kolkata: 'https://images.unsplash.com/photo-1558431382-27e303142255', // Howrah Bridge at twilight (deep blue/amber lights)
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5', // Lotus Temple, twilight skyline
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', // Indian palace warm amber glowing arches
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', // Eiffel Tower at night with warm streetlights
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', // Tropical Balinese gate sunset
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8', // Premium overwater bungalows sunset
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd', // Gardens by the Bay / skyline laser lights
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26', // Shibuya / Tokyo Tower glowing night skyline
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad', // Tower Bridge illuminated at twilight
  newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', // New York skyline sunset / Times Square at night
  manali: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606', // Snowy Himalayan peak & misty valley
  shimla: 'https://images.unsplash.com/photo-1562979314-bee7453e911c', // Snowy Shimla hills under warm streetlights
  kerala: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2', // Kerala houseboat at sunset on scenic backwaters
  kashmir: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7', // Majestic Dal lake reflecting snowy mountains
  ladakh: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2', // High altitude mountain pass with prayer flags
  switzerland: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e', // Swiss alpine chalet under a beautiful starry sky
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', // Burj Khalifa and futuristic Dubai skyline twilight lights
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', // Historic Roman ruins glowing under deep twilight sky
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9', // Sydney Opera House under a dark sunset
  agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523', // Majestic silhouette of Taj Mahal at twilight
  mumbai: 'https://images.unsplash.com/photo-1562157873-818bc0726f68', // Gateway of India / Marine Drive skyline at night
  chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220', // Marina beach sunset
  bangalore: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2', // Nandi Hills misty valley sunrise
  hyderabad: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659'  // Charminar historic monument illuminated at night
};

// CURATED THEMATIC CATEGORIES
const THEME_IMAGES = {
  beach: 'https://images.unsplash.com/photo-1519046904884-53103b34b206', // Cozy beach bonfire/palm trees at night
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', // Misty peak forests & rugged mountains
  nature: 'https://images.unsplash.com/photo-1511497584788-876760111969', // Mystic pine forests under beautiful sunlight rays
  city: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df', // Cyberpunk/sleek city skyline glowing in dark water
  heritage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', // Indian temple/fort glowing sunset arches
  default: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4' // Cozy camper campfire under starry dark sky
};

// Country names set to exclude from Wikipedia landmark search
const COUNTRIES = new Set([
  'india', 'usa', 'uk', 'united kingdom', 'united states', 'canada', 
  'australia', 'france', 'germany', 'italy', 'spain', 'japan', 
  'china', 'brazil', 'mexico', 'russia', 'nepal', 'bangladesh', 
  'sri lanka', 'pakistan'
]);

// Helper to clean, optimize, and append image dimension parameters to Unsplash images
const optimizeImageUrl = (url) => {
  if (!url) return '';
  // Remove existing query params to ensure correct width control
  const baseUrl = url.split('?')[0];
  return `${baseUrl}?auto=format&fit=crop&w=800&q=80`;
};

/**
 * Automatically resolves a gorgeous, highly optimized, dark-friendly travel card cover image based on the destination name.
 * 
 * @param {string} destination - The name of the destination (e.g. "Goa, India", "Darjeeling", "Trip to Paris")
 * @returns {Promise<string>} The high-quality image URL
 */
const fetchWikiImage = async (place) => {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(place)}&redirects=true`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.query || !data.query.pages) return null;
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId && pageId !== '-1' && pages[pageId].original) {
      return pages[pageId].original.source;
    }
  } catch (err) {
    console.error(`[imageSearch] [Wiki] Error fetching image for ${place}:`, err.message);
  }
  return null;
};

/**
 * Determines whether a Pixabay illustration is actually relatable to the place queried,
 * avoiding generic keyword matching (e.g. matching pills/viruses for a medical institute).
 */
const isRelatableIllustration = (hit, place) => {
  if (!hit || !hit.tags) return false;
  const tags = hit.tags.toLowerCase();
  const placeLower = place.toLowerCase();

  // Direct match first
  if (tags.includes(placeLower)) return true;

  // Key-word based matching, filtering out common stop words
  const stopWords = new Set([
    'of', 'and', 'in', 'the', 'for', 'at', 'with', 'on', 'by', 'an',
    'institute', 'medical', 'sciences', 'science', 'university', 'college', 'school',
    'hotel', 'resort', 'temple', 'station', 'airport', 'park', 'garden', 'museum',
    'bihar', 'india', 'bengal', 'delhi', 'mumbai', 'goa', 'pradesh', 'kerala', 'west'
  ]);

  const keywords = placeLower
    .split(/[^a-z0-9]+/i)
    .filter(w => w.length >= 3 && !stopWords.has(w));

  if (keywords.length === 0) return true; // Accept hit if query has no keywords left after filtering

  // Enforce that tags contain at least one unique keyword of the place name
  return keywords.some(kw => tags.includes(kw));
};

/**
 * Automatically resolves a gorgeous, highly optimized, dark-friendly travel card cover image based on the destination name.
 * 
 * @param {string} destination - The name of the destination (e.g. "Goa, India", "Darjeeling", "Trip to Paris")
 * @returns {Promise<string>} The high-quality image URL
 */
export const fetchDestinationImage = async (destination) => {
  if (!destination) {
    return optimizeImageUrl(THEME_IMAGES.default);
  }

  const pixabayKey = process.env.PIXABAY_API_KEY;

  // Parse the destination into parts
  let parts = destination.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    parts = [destination];
  }

  // If the user didn't write commas but wrote spaces (e.g. "kudra bihar"), extract individual words as fallbacks
  if (parts.length === 1 && destination.includes(' ')) {
    const words = destination.split(/\s+/).map(w => w.trim()).filter(w => w.length > 2);
    words.forEach(word => {
      if (word.toLowerCase() !== destination.toLowerCase() && !parts.includes(word)) {
        parts.push(word);
      }
    });
  }

  const place = parts[0];

  // 1. Check curated premium destination library first (e.g. "Kolkata", "Paris")
  const cleanPlace = place.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (CURATED_DESTINATIONS[cleanPlace]) {
    console.log(`[imageSearch] Found curated premium image for "${place}": ${CURATED_DESTINATIONS[cleanPlace]}`);
    return optimizeImageUrl(CURATED_DESTINATIONS[cleanPlace]);
  }

  // 2. Wikipedia Famous Landmark photo for the specific place (e.g., "Rajgir" -> Shanti Stupa, "Patna" -> Patna High Court)
  console.log(`[imageSearch] Checking Wikipedia famous landmark for: "${place}"`);
  const placeWikiImg = await fetchWikiImage(place);
  if (placeWikiImg) {
    console.log(`[imageSearch] Dynamically matched Wikipedia famous landmark image for "${place}": ${placeWikiImg}`);
    return placeWikiImg;
  }

  // 3. Try Pixabay specifically for a RELATABLE illustration of the place
  if (pixabayKey) {
    console.log(`[imageSearch] Checking Pixabay illustration for place: "${place}"`);
    const placeUrl = `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(place)}&image_type=illustration&safesearch=true&per_page=15`;
    try {
      const response = await fetch(placeUrl);
      if (response.ok) {
        const data = await response.json();
        const hits = data.hits || [];
        // Filter for relatable illustrations to avoid generic visual spam
        const relatableHits = hits.filter(hit => isRelatableIllustration(hit, place));
        if (relatableHits.length > 0) {
          let hash = 0;
          for (let i = 0; i < destination.length; i++) {
            hash = destination.charCodeAt(i) + ((hash << 5) - hash);
          }
          const index = Math.abs(hash) % relatableHits.length;
          const selectedHit = relatableHits[index];
          console.log(`[imageSearch] Dynamically matched relatable Pixabay illustration for "${place}" at index ${index}/${relatableHits.length}: ${selectedHit.webformatURL}`);
          return `${selectedHit.webformatURL}?pixabay_id=${selectedHit.id}`;
        } else {
          console.log(`[imageSearch] No relatable Pixabay illustration found for: "${place}" (total hits: ${hits.length})`);
        }
      }
    } catch (err) {
      console.error(`[imageSearch] Pixabay query failed for place:`, err.message);
    }
  }

  // 4. Fallback to Wikipedia famous landmark for the Region/State (e.g., "Nalanda" -> Ruins, "Bihar" -> Mahabodhi Temple)
  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      const region = parts[i];
      if (COUNTRIES.has(region.toLowerCase())) {
        continue;
      }
      console.log(`[imageSearch] Checking Wikipedia famous landmark for region: "${region}"`);
      const regionWikiImg = await fetchWikiImage(region);
      if (regionWikiImg) {
        console.log(`[imageSearch] Dynamically matched Wikipedia region famous landmark image for "${region}": ${regionWikiImg}`);
        return regionWikiImg;
      }
    }
  }

  // 5. Fallback to Pixabay illustration for Region/State
  if (pixabayKey && parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      const region = parts[i];
      if (COUNTRIES.has(region.toLowerCase())) {
        continue;
      }
      console.log(`[imageSearch] Checking Pixabay illustration for region: "${region}"`);
      const regionUrl = `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(region)}&image_type=illustration&safesearch=true&per_page=10`;
      try {
        const response = await fetch(regionUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.hits && data.hits.length > 0) {
            let hash = 0;
            for (let i = 0; i < destination.length; i++) {
              hash = destination.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash) % data.hits.length;
            const selectedHit = data.hits[index];
            console.log(`[imageSearch] Dynamically matched Pixabay region illustration for "${region}" at index ${index}/${data.hits.length}: ${selectedHit.webformatURL}`);
            return `${selectedHit.webformatURL}?pixabay_id=${selectedHit.id}`;
          }
        }
      } catch (err) {
        console.error(`[imageSearch] Pixabay query failed for region:`, err.message);
      }
    }
  }

  // 6. Fallback to Country illustration on Pixabay
  if (pixabayKey) {
    const country = parts[parts.length - 1];
    if (country && country.toLowerCase() !== place.toLowerCase()) {
      console.log(`[imageSearch] Checking Pixabay illustration for country: "${country}"`);
      const countryUrl = `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(country)}&image_type=illustration&safesearch=true&per_page=20`;
      try {
        const response = await fetch(countryUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.hits && data.hits.length > 0) {
            let hash = 0;
            for (let i = 0; i < destination.length; i++) {
              hash = destination.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash) % data.hits.length;
            const selectedHit = data.hits[index];
            console.log(`[imageSearch] Dynamically matched Pixabay country illustration for "${country}" at index ${index}/${data.hits.length}: ${selectedHit.webformatURL}`);
            return `${selectedHit.webformatURL}?pixabay_id=${selectedHit.id}`;
          }
        }
      } catch (err) {
        console.error(`[imageSearch] Pixabay query failed for country:`, err.message);
      }
    }
  }

  // 7. Ultimate Fallback to global adventure illustration
  if (pixabayKey) {
    console.log(`[imageSearch] Checking Pixabay default global fallback illustration`);
    const fallbackUrl = `https://pixabay.com/api/?key=${pixabayKey}&q=travel+adventure&image_type=illustration&safesearch=true&per_page=50`;
    try {
      const response = await fetch(fallbackUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
          let hash = 0;
          for (let i = 0; i < destination.length; i++) {
            hash = destination.charCodeAt(i) + ((hash << 5) - hash);
          }
          const index = Math.abs(hash) % data.hits.length;
          const selectedHit = data.hits[index];
          console.log(`[imageSearch] Dynamically matched Pixabay default fallback for "${destination}" at index ${index}/${data.hits.length}: ${selectedHit.webformatURL}`);
          return `${selectedHit.webformatURL}?pixabay_id=${selectedHit.id}`;
        }
      }
    } catch (err) {
      console.error(`[imageSearch] Pixabay default query failed:`, err.message);
    }
  }

  return optimizeImageUrl(THEME_IMAGES.default);
};
