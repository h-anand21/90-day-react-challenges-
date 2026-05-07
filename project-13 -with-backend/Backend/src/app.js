import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(helmet());

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.get('/', (req, res) => {
  res.send('API Running');
});

export default app;
