import cron from 'node-cron';
import { checkAndSendNotifications } from '../services/notificationService.js';

export const initCronJobs = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    console.log('Running notification cron job...');
    checkAndSendNotifications();
  });
};
