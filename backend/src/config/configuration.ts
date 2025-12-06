export default function configuration() {
  return {
    port: Number.parseInt(process.env.PORT || process.env.API_PORT || '3000', 10),
    mongodb: {
      uri:
        process.env.MONGODB_URI ||
        'mongodb://localhost:27017/weather-dashboard',
    },
    jwt: {
      secret:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    defaultUser: {
      email: process.env.DEFAULT_USER_EMAIL || 'admin@root.com',
      password: process.env.DEFAULT_USER_PASSWORD || 'root123',
    },
    admin: {
      email: process.env.ADMIN_EMAIL || process.env.DEFAULT_USER_EMAIL || 'admin@root.com',
      password: process.env.ADMIN_PASSWORD || process.env.DEFAULT_USER_PASSWORD || 'root123',
    },
    frontend: {
      url: process.env.FRONTEND_URL || 'http://localhost:5173',
    },
    geonames: {
      username: process.env.GEONAMES_USERNAME || 'demo',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || 'your-gemini-api-key',
    },
  };
}
