import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import readline from 'readline';
import pool from './db';
import { assetsRouter } from './routes/assets';
import { authRouter } from './routes/auth';
import { portfolioRouter } from './routes/portfolio';
import { adminRouter } from './routes/admin';
import { ordersRouter } from './routes/orders';
import { transactionsRouter } from './routes/transactions';
import { userRouter } from './routes/user';
import { verificationRouter } from './routes/verification';
import { watchlistRouter } from './routes/watchlist';
import { startPeriodicFetching } from './services/priceUpdateService';
import PriceAlertService from './services/priceAlertService';

dotenv.config();

const app: Express = express();
const port: number = 3000;

// First set up CORS with a more robust configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  
  next();
});

// Then use the standard cors middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Debug logging configuration
const isDevMode = process.env.NODE_ENV === 'development';
let debugLoggingEnabled = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Custom logging function that respects the debug setting
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logDebug(...args: any[]) {
  if (debugLoggingEnabled) {
    console.log('[DEBUG]', ...args);
  }
}

// Initialize server with debug enabled by default in dev mode
async function initializeServer() {
  debugLoggingEnabled = isDevMode; // Enable debug logs by default in development mode
  if (isDevMode) {
    console.log('Starting TradeBlazer Backend in development mode...');
    console.log('Debug logging is enabled by default');
  }
  logDebug('Debug logging initialized');
  
  // Start database connection test after debug setup
  await testConnection();
  
  // Start periodic price fetching
  startPeriodicFetching();
  logDebug('Periodic price fetching started');
  
  // Start price alert service
  const priceAlertService = new PriceAlertService(pool);
  await priceAlertService.start();
  logDebug('Price alert service started');
  
  // Start listening on port after all initialization
  startServer();
}

function startServer() {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    logDebug(`Server started with CORS policy for origin: http://localhost:5173`);
  }).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${port} is already in use. Please stop the process using this port or use a different port.`);
      console.error(`You can kill the process using port ${port} with the command: 'lsof -i :${port} | grep LISTEN | awk \'{print $2}\' | xargs kill -9'`);
      logDebug('Detailed error information:', err);
    } else {
      console.error('Server error:', err.message);
      logDebug('Detailed server error:', err);
    }
    process.exit(1);
  });
}

initializeServer().catch(err => console.error('Failed to initialize server:', err));

// Test database connection on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    logDebug('Successfully connected to the database');
    console.log('Connected to the database!');
    connection.release();
  } catch (err: unknown) {
    console.error('Database connection error:', (err as Error).message);
    logDebug('Detailed database connection error:', err);
  }
}

// Routes
app.use('/api/assets', assetsRouter);
app.use('/api/auth', authRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/admin', adminRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/user', userRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/watchlist', watchlistRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('TradeBlazer Backend is running');
});

// testConnection(); 