import dotenv from 'dotenv';
dotenv.config();

import { fetchDestinationImage } from './src/utils/imageSearch.js';

const testDestinations = [
  'Rajgir, Nalanda, Bihar, India',
  'Patna, Bihar, India',
  'Kolkata, West Bengal, India',
  'Darjeeling, West Bengal, India',
  'Agra, Uttar Pradesh, India',
  'Vardhman Institute of Medical Sciences, Nalanda, Bihar, India',
  'Kudra, Kaimur, Bihar, India',
  'Pawapuri, Nalanda, Bihar, India',
  'Kudra Bihar'
];

async function run() {
  console.log('--- Testing Refined Hybrid Wikipedia + Pixabay Cascading Image System ---');
  for (const dest of testDestinations) {
    const res = await fetchDestinationImage(dest);
    console.log(`Result for "${dest}":\n  -> ${res}\n`);
  }
}

run().catch(console.error);
