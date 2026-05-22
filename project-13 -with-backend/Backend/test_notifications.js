import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trip from './src/models/Trip.js';
import User from './src/models/User.js';
import Notification from './src/models/Notification.js';

dotenv.config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected to', mongoUri);

    // Find the first trip to use its data
    const trip = await Trip.findOne().populate('owner');
    if (!trip) {
      console.log('No trips found. Please create a trip first.');
      process.exit(0);
    }

    const userId = trip.owner._id;

    // Create Dummy Notifications
    const dummyNotifications = [
      {
        user: userId,
        trip: trip._id,
        title: "Your trip to " + trip.destination + " begins tomorrow! 🧳",
        message: "Pack your bags and get ready for an amazing journey.",
        type: 'TRIP_START_24H',
        isRead: false
      },
      {
        user: userId,
        trip: trip._id,
        title: "Departure starts in 1 hour! ✈️",
        message: "Your journey to " + trip.destination + " is about to begin. Safe travels!",
        type: 'TRIP_START_1H',
        isRead: true
      },
      {
        user: userId,
        trip: trip._id,
        title: "Day 2 completed in " + trip.destination + ". 🌴",
        message: "Another beautiful day in paradise. Ready for tomorrow?",
        type: 'TRIP_ONGOING_DAILY',
        isRead: false
      }
    ];

    await Notification.insertMany(dummyNotifications);
    console.log('✅ Successfully inserted 3 test notifications!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
