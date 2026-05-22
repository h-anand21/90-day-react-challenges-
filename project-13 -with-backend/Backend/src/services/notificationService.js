import { Expo } from 'expo-server-sdk';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const expo = new Expo();

export const checkAndSendNotifications = async () => {
  try {
    const now = new Date();
    // Fetch all trips that are not cancelled or completed yet (if we were strictly doing end of trips, we might need completed)
    // But since trips don't automatically complete, we check by date
    const trips = await Trip.find({ status: { $ne: 'cancelled' } }).populate('owner');

    const notificationsToSave = [];
    const messages = [];

    for (const trip of trips) {
      if (!trip.owner || !trip.owner.expoPushToken) continue;

      const pushToken = trip.owner.expoPushToken;
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const timeToStart = start.getTime() - now.getTime();
      const hoursToStart = timeToStart / (1000 * 60 * 60);

      // Initialize state if not present
      if (!trip.notificationState) {
        trip.notificationState = { notified24h: false, notified1h: false, notifiedDays: [] };
      }

      let saveTrip = false;

      // 24H Before
      if (hoursToStart > 0 && hoursToStart <= 24 && !trip.notificationState.notified24h) {
        const title = "Trip starts tomorrow! 🧳";
        const body = `Your trip to ${trip.destination} begins in 24 hours. Are you packed?`;
        
        messages.push({ to: pushToken, sound: 'default', title, body, data: { tripId: trip._id } });
        notificationsToSave.push({ user: trip.owner._id, trip: trip._id, title, message: body, type: 'TRIP_START_24H' });
        
        trip.notificationState.notified24h = true;
        saveTrip = true;
      }

      // 1H Before
      if (hoursToStart > 0 && hoursToStart <= 1 && !trip.notificationState.notified1h) {
        const title = "Almost time! ✈️";
        const body = `Your trip to ${trip.destination} begins in just 1 hour!`;
        
        messages.push({ to: pushToken, sound: 'default', title, body, data: { tripId: trip._id } });
        notificationsToSave.push({ user: trip.owner._id, trip: trip._id, title, message: body, type: 'TRIP_START_1H' });
        
        trip.notificationState.notified1h = true;
        saveTrip = true;
      }

      // Exact Start Date Notification
      if (hoursToStart <= 0 && start.toDateString() === now.toDateString() && !trip.notificationState.notifiedDays.includes('START')) {
        const title = "Trip started! 🎉";
        const body = `Your adventure to ${trip.destination} has officially begun!`;
        
        messages.push({ to: pushToken, sound: 'default', title, body, data: { tripId: trip._id } });
        notificationsToSave.push({ user: trip.owner._id, trip: trip._id, title, message: body, type: 'TRIP_ONGOING_DAILY' });
        
        trip.notificationState.notifiedDays.push('START');
        saveTrip = true;
      }

      // Daily Ongoing Notification
      // If today is after start and before or equal to end date
      if (now.getTime() >= start.getTime() && now.getTime() <= end.getTime() + (24 * 60 * 60 * 1000)) {
        const todayStr = now.toDateString();
        // Send around 8 PM local or just check if it's past 8 PM UTC/Local
        const currentHour = now.getHours();
        
        // Let's say we trigger this if current hour is >= 18 (6 PM) and not notified today
        // Or if we run cron hourly, it will trigger at 6 PM.
        if (currentHour >= 18 && !trip.notificationState.notifiedDays.includes(todayStr) && todayStr !== start.toDateString()) {
          const isLastDay = todayStr === end.toDateString();
          const title = isLastDay ? "Trip ending today! 🌅" : "Day complete! 🌙";
          const body = isLastDay 
            ? `Hope you enjoyed ${trip.destination}. Time to head back!` 
            : `Another day done in ${trip.destination}. Ready for tomorrow?`;

          messages.push({ to: pushToken, sound: 'default', title, body, data: { tripId: trip._id } });
          notificationsToSave.push({ user: trip.owner._id, trip: trip._id, title, message: body, type: 'TRIP_ONGOING_DAILY' });
          
          trip.notificationState.notifiedDays.push(todayStr);
          saveTrip = true;
        }
      }

      if (saveTrip) {
        await trip.save();
      }
    }

    // Save Notifications to DB
    if (notificationsToSave.length > 0) {
      await Notification.insertMany(notificationsToSave);
    }

    // Send Push Notifications
    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending push chunk', error);
      }
    }

  } catch (error) {
    console.error('Error in checkAndSendNotifications:', error);
  }
};
