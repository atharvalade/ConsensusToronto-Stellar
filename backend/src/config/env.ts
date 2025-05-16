// Default environment variables when .env is not available

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  stellarNetwork: process.env.STELLAR_NETWORK || 'TESTNET',
  stellarHorizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  rpName: process.env.RP_NAME || 'Stellar Consensus News',
  rpId: process.env.RP_ID || 'localhost',
  rpIcon: process.env.RP_ICON || 'https://stellarconsensus.news/logo.png',
  jwtSecret: process.env.JWT_SECRET || 'stellar_consensus_jwt_secret_dev',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}; 