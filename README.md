# Stellar Consensus News - Authentic News for Better Trades

## Overview

Stellar Consensus News is a decentralized platform that solves the authenticity crisis in news media, helping users make informed trading decisions based on verified information. In today's market, especially during periods of high volatility, news drives significant market movements. Our application uses Stellar's blockchain technology, AI agents, and community verification to ensure only authentic news reaches traders, all with a seamless web2-like UX experience.

## Problem Statement

Under the current political climate, news has become a driving force for market movements:
- The VIX has skyrocketed to COVID-era levels
- Fake news leads to misled trading decisions and potential financial losses
- Lack of verification mechanisms for news from multiple sources
- Traditional blockchain solutions have poor UX with complicated wallet integrations

## Solution

Stellar Consensus News provides a three-pronged approach:

1. **AI-Powered News Aggregation**: AI agents scrape data from multiple sources (TruthSocial, X, YouTube, etc.) to collect and analyze news items.

2. **Decentralized Verification with Seamless UX**: 
   - Community members stake XLM to participate in news verification
   - No wallet integration required - use passkeys for authentication
   - Verified news (90%+ consensus) appears in users' feeds
   - Community flagging system to remove later-identified fake news
   - XLM rewards for accurate verifiers, with a level-based reward system

3. **Trading Insights**:
   - AI summarization of verified news
   - Trading suggestions based on verified information
   - Market sentiment analysis
   - Personalized feeds tailored to user interests

## Architecture

### Blockchain Infrastructure

- **Stellar Blockchain**: Primary chain for verification and XLM rewards
  - VerificationContract: Smart contract for news verification
  - NewsRegistry: Smart contract for storing verified news hashes
  - RewardsDistribution: Smart contract for distributing XLM rewards

### Authentication

- **Stellar Passkeys**: Web3 authentication without wallet complexity
  - Face ID/fingerprint authentication
  - No seed phrases to remember
  - Transaction signing with biometrics

### Storage

- Content stored on IPFS with hash-key verification
- Similar to archive.org but built for Web3

### Front-End

- Modern, clean UI built with Next.js and Tailwind CSS
- Feed page displaying verified news with sources
- Profile page showing user level, benefits, and token balance
- Verification marketplace for staking and earning
- Leverages Stellar Passkey Kit for wallet creation and management

## Token Economics

- **XLM**: Native utility token of the Stellar network used in the platform
- **Staking**: XLM tokens required to participate in verification
- **Reward Distribution**:
  - Tokens distributed to accurate verifiers
  - Higher rewards for higher-level users
  - Launchtube integration for seamless fee payment

## Getting Started

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-org/stellar-consensus-news.git

# Navigate to backend directory
cd stellar-consensus-news/backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Deploy contracts
npm run deploy:stellar-testnet
```

### Frontend Setup
```bash
# Navigate to UI directory
cd ../truelens_UI

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Status

Stellar Consensus News is currently in development, with the following components in progress:
- Stellar smart contracts
- Passkey authentication system
- AI agents for news verification
- UI implementation with web2-like UX

## Contributing

We welcome contributions to the Stellar Consensus News project. Please see our contributing guidelines for more information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Stellar Consensus News is being developed for the Stellar Consensus Hackathon 2025, targeting the "Web3 UX doesn't have to suck" challenge.