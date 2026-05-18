import mongoose from 'mongoose';
import { fetchDestinationImage } from './imageSearch.js';
import dotenv from 'dotenv';
dotenv.config();

const tripSchema = new mongoose.Schema(
  {
    title: String,
    destination: String,
    coverImage: String,
  },
  { timestamps: true }
);

const Trip = mongoose.model('Trip', tripSchema);

async function run() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing!');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const trips = await Trip.find();
    console.log(`Found ${trips.length} trips to migrate.`);

    for (const trip of trips) {
      console.log(`Migrating trip: "${trip.title}" in "${trip.destination}"...`);
      const newImg = await fetchDestinationImage(trip.destination);
      trip.coverImage = newImg;
      await trip.save();
      console.log(` -> Saved coverImage: ${newImg}`);
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
