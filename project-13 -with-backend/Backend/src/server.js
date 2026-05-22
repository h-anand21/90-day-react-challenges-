import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { initCronJobs } from './jobs/cronJobs.js';

const PORT = process.env.PORT || 5000;

connectDB();
initCronJobs();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
