export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    apiPrefix: process.env.API_PREFIX || 'api/v1',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'],
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
  },

  cosmosDb: {
    endpoint: process.env.COSMOS_DB_ENDPOINT,
    key: process.env.COSMOS_DB_KEY,
    database: process.env.COSMOS_DB_DATABASE || 'petfinder',
  },

  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  azureStorage: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName:
      process.env.AZURE_STORAGE_CONTAINER ||
      process.env.AZURE_STORAGE_CONTAINER_NAME ||
      'pet-images',
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
    useSignedUrls: (process.env.AZURE_STORAGE_USE_SIGNED_URLS || 'true') === 'true',
    sasExpiryMinutes: parseInt(process.env.AZURE_STORAGE_SAS_EXPIRY_MINUTES || '60', 10),
    maxFileSizeMb: parseInt(process.env.AZURE_STORAGE_MAX_FILE_SIZE_MB || '5', 10),
  },

  location: {
    geocodingBaseUrl: process.env.GEOCODING_BASE_URL || 'https://nominatim.openstreetmap.org',
    defaultCountryCode: process.env.GEOCODING_DEFAULT_COUNTRY || 'co',
    userAgent: process.env.GEOCODING_USER_AGENT || 'PetFinderBackend/1.0 (petfinder@local.dev)',
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'PetFinder <noreply@petfinder.app>',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
});
