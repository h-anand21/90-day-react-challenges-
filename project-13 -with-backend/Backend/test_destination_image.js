import { fetchDestinationImage } from './src/utils/imageSearch.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testDestinations = [
  'Goa, India',
  'darjeeling hills',
  'Kolkata Victoria Memorial',
  'Trip to Paris, France',
  'Bali resort and spa',
  'A trip to Manali mountains',
  'Kashmir Valley',
  'New York City Central Park',
  'Awesome beach vacation',
  'Hiking in high mountains',
  'Historical palace tour',
  'Some random place'
];

async function runTest() {
  console.log('--- Testing Intelligent Destination-Based Image System ---');
  for (const dest of testDestinations) {
    const imageUrl = await fetchDestinationImage(dest);
    console.log(`\nDestination: "${dest}"`);
    console.log(`Resolved Cover Image URL: ${imageUrl}`);
  }
}

runTest().catch(console.error);
