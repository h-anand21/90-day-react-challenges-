/**
 * HARDCODED_DESTINATIONS — fallback when Google Places API fails
 * Backend returns these directly so mobile gets a response always.
 */
export const HARDCODED_DESTINATIONS = [
  // India
  { label: 'Mumbai, Maharashtra, India',       latitude: 19.0760,  longitude: 72.8777 },
  { label: 'Delhi, India',                     latitude: 28.6139,  longitude: 77.2090 },
  { label: 'Bengaluru, Karnataka, India',      latitude: 12.9716,  longitude: 77.5946 },
  { label: 'Goa, India',                       latitude: 15.2993,  longitude: 74.1240 },
  { label: 'Jaipur, Rajasthan, India',         latitude: 26.9124,  longitude: 75.7873 },
  { label: 'Agra, Uttar Pradesh, India',       latitude: 27.1767,  longitude: 78.0081 },
  { label: 'Varanasi, Uttar Pradesh, India',   latitude: 25.3176,  longitude: 82.9739 },
  { label: 'Darjeeling, West Bengal, India',   latitude: 27.0360,  longitude: 88.2627 },
  { label: 'Kolkata, West Bengal, India',      latitude: 22.5726,  longitude: 88.3639 },
  { label: 'Manali, Himachal Pradesh, India',  latitude: 32.2432,  longitude: 77.1892 },
  { label: 'Shimla, Himachal Pradesh, India',  latitude: 31.1048,  longitude: 77.1734 },
  { label: 'Leh, Ladakh, India',               latitude: 34.1526,  longitude: 77.5771 },
  { label: 'Udaipur, Rajasthan, India',        latitude: 24.5854,  longitude: 73.7125 },
  { label: 'Rishikesh, Uttarakhand, India',    latitude: 30.0869,  longitude: 78.2676 },
  { label: 'Ooty, Tamil Nadu, India',          latitude: 11.4102,  longitude: 76.6950 },
  { label: 'Munnar, Kerala, India',            latitude: 10.0889,  longitude: 77.0595 },
  { label: 'Amritsar, Punjab, India',          latitude: 31.6340,  longitude: 74.8723 },
  { label: 'Mysuru, Karnataka, India',         latitude: 12.2958,  longitude: 76.6394 },
  { label: 'Pune, Maharashtra, India',         latitude: 18.5204,  longitude: 73.8567 },
  { label: 'Hyderabad, Telangana, India',      latitude: 17.3850,  longitude: 78.4867 },
  { label: 'Chennai, Tamil Nadu, India',       latitude: 13.0827,  longitude: 80.2707 },
  { label: 'Ranchi, Jharkhand, India',         latitude: 23.3441,  longitude: 85.3096 },
  { label: 'Coorg, Karnataka, India',          latitude: 12.3375,  longitude: 75.8069 },
  { label: 'Bhubaneswar, Odisha, India',       latitude: 20.2961,  longitude: 85.8245 },
  { label: 'Tirupati, Andhra Pradesh, India',  latitude: 13.6288,  longitude: 79.4192 },
  { label: 'Haridwar, Uttarakhand, India',     latitude: 29.9457,  longitude: 78.1642 },
  { label: 'Puri, Odisha, India',              latitude: 19.8135,  longitude: 85.8312 },
  { label: 'Jodhpur, Rajasthan, India',        latitude: 26.2389,  longitude: 73.0243 },
  { label: 'Pushkar, Rajasthan, India',        latitude: 26.4899,  longitude: 74.5515 },
  { label: 'Kochi, Kerala, India',             latitude: 9.9312,   longitude: 76.2673 },

  // International
  { label: 'Bali, Indonesia',                  latitude: -8.4095,  longitude: 115.1889 },
  { label: 'Bangkok, Thailand',                latitude: 13.7563,  longitude: 100.5018 },
  { label: 'Phuket, Thailand',                 latitude: 7.8804,   longitude: 98.3923  },
  { label: 'Singapore',                        latitude: 1.3521,   longitude: 103.8198 },
  { label: 'Dubai, UAE',                       latitude: 25.2048,  longitude: 55.2708  },
  { label: 'Paris, France',                    latitude: 48.8566,  longitude: 2.3522   },
  { label: 'London, UK',                       latitude: 51.5074,  longitude: -0.1276  },
  { label: 'Tokyo, Japan',                     latitude: 35.6895,  longitude: 139.6917 },
  { label: 'New York, USA',                    latitude: 40.7128,  longitude: -74.0060 },
  { label: 'Sydney, Australia',                latitude: -33.8688, longitude: 151.2093 },
  { label: 'Rome, Italy',                      latitude: 41.9028,  longitude: 12.4964  },
  { label: 'Barcelona, Spain',                 latitude: 41.3851,  longitude: 2.1734   },
  { label: 'Amsterdam, Netherlands',           latitude: 52.3676,  longitude: 4.9041   },
  { label: 'Zurich, Switzerland',              latitude: 47.3769,  longitude: 8.5417   },
  { label: 'Kathmandu, Nepal',                 latitude: 27.7172,  longitude: 85.3240  },
  { label: 'Colombo, Sri Lanka',               latitude: 6.9271,   longitude: 79.8612  },
  { label: 'Kuala Lumpur, Malaysia',           latitude: 3.1390,   longitude: 101.6869 },
  { label: 'Maldives',                         latitude: 3.2028,   longitude: 73.2207  },
  { label: 'Istanbul, Turkey',                 latitude: 41.0082,  longitude: 28.9784  },
  { label: 'Cairo, Egypt',                     latitude: 30.0444,  longitude: 31.2357  },
  { label: 'Cape Town, South Africa',          latitude: -33.9249, longitude: 18.4241  },
  { label: 'Toronto, Canada',                  latitude: 43.6532,  longitude: -79.3832 },
  { label: 'Beijing, China',                   latitude: 39.9042,  longitude: 116.4074 },
  { label: 'Seoul, South Korea',               latitude: 37.5665,  longitude: 126.9780 },
  { label: 'Ho Chi Minh City, Vietnam',        latitude: 10.8231,  longitude: 106.6297 },
  { label: 'Hanoi, Vietnam',                   latitude: 21.0285,  longitude: 105.8542 },
  { label: 'Siem Reap, Cambodia',              latitude: 13.3671,  longitude: 103.8448 },
  { label: 'Lisbon, Portugal',                 latitude: 38.7223,  longitude: -9.1393  },
  { label: 'Athens, Greece',                   latitude: 37.9838,  longitude: 23.7275  },
  { label: 'Vienna, Austria',                  latitude: 48.2082,  longitude: 16.3738  },
  { label: 'Prague, Czech Republic',           latitude: 50.0755,  longitude: 14.4378  },
  { label: 'Budapest, Hungary',                latitude: 47.4979,  longitude: 19.0402  },
];

/**
 * Search hardcoded list by query string
 * @param {string} query
 * @returns {Array<{label, latitude, longitude}>}
 */
export const searchHardcoded = (query) => {
  const q = (query || '').toLowerCase().trim();
  if (q.length < 2) return [];
  return HARDCODED_DESTINATIONS
    .filter(d => d.label.toLowerCase().includes(q))
    .slice(0, 6);
};
