import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import { env, isProd } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || env.corsOrigin.includes(origin) || env.corsOrigin.includes('*')) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression());

if (!isProd) app.use(morgan('dev'));
else app.use(morgan('combined'));

app.use(env.apiPrefix, apiLimiter, routes);

app.get('/', (req, res) => {
  res.json({
    name: 'Storify API',
    version: '1.0.0',
    docs: `${env.apiPrefix}/health`,
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
