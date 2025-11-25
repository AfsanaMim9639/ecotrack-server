// CORS configuration for production
export const corsOptions = {
  origin: [
    'https://ecotrack-71dcf.web.app',
    'https://ecotrack-71dcf.firebaseapp.com',
    'http://localhost:5173', // For local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};