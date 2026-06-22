import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Prefix router paths
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/auth/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Auth service is running' });
});

// 404 handler
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on auth service!`
    });
});

export default app;
