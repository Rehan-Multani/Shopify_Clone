import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import masterAdminRouter from './Routers/masterAdminRouter.js';
import planRouter from './Routers/planRouter.js';
import merchantRouter from './Routers/merchantRouter.js';
import categoryRouter from './Routers/categoryRouter.js';
import productRouter from './Routers/productRouter.js';
import couponRouter from './Routers/couponRouter.js';
import path from 'path';

const app = express();

// Global Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // update with your frontend domains
    credentials: true,
}));
app.use(helmet({
    crossOriginResourcePolicy: false // Allow loading local assets in frontend
})); // Security headers
app.use(morgan('dev')); // Request logging
app.use(express.json({ limit: '50mb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent NoSQL injection

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Rate Limiting
const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Routes
app.use('/api/master-admin', masterAdminRouter);
app.use('/api/plans', planRouter);
app.use('/api/merchants', merchantRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/coupons', couponRouter);

// Basic health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running' });
});

// 404 Handler
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

export default app;
