import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trip from './src/models/Trip.js';
import User from './src/models/User.js';
import Notification from './src/models/Notification.js';

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/tripsync';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected to', mongoUri);

    const users = await User.find();
    if (!users.length) {
      console.log('No users found.');
      process.exit(0);
    }

    // Give every user some dummy notifications
    for (const user of users) {
      // Find a trip for this user, or use a dummy trip title
      let trip = await Trip.findOne({ owner: user._id });
      let destination = trip ? trip.destination : "Goa";
      let tripId = trip ? trip._id : null;

      const dummyNotifications = [
        {
          user: user._id,
          trip: tripId,
          title: "Your trip to " + destination + " begins tomorrow! 🧳",
          message: "Pack your bags and get ready for an amazing journey.",
          type: 'TRIP_START_24H',
          isRead: false
        },
        {
          user: user._id,
          trip: tripId,
          title: "Departure starts in 1 hour! ✈️",
          message: "Your journey to " + destination + " is about to begin. Safe travels!",
          type: 'TRIP_START_1H',
          isRead: true
        },
        {
          user: user._id,
          trip: tripId,
          title: "Day 2 completed in " + destination + ". 🌴",
          message: "Another beautiful day in paradise. Ready for tomorrow?",
          type: 'TRIP_ONGOING_DAILY',
          isRead: false
        }
      ];

      await Notification.insertMany(dummyNotifications);
      console.log(`✅ Inserted 3 test notifications for user: ${user.email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
