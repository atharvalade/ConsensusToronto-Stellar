# TrueLens - Authentic News with Stellar

## Overview

TrueLens is a decentralized platform that solves the authenticity crisis in news media, helping users make informed decisions based on verified information. Using Stellar's smart contracts, passkeys for authentication, and a seamless web3 user experience, TrueLens demonstrates that web3 UX doesn't have to suck.

## Problem Statement

News has become a driving force for market movements and public opinion:
- Fake news leads to misled decisions and potential financial losses
- Traditional web3 authentication is complicated and user-unfriendly
- Current news verification lacks transparent and accessible mechanisms

## Solution

TrueLens provides a three-pronged approach:

1. **AI-Powered News Aggregation**: AI agents scrape data from multiple sources to collect and analyze news items.

2. **Decentralized Verification with Stellar Smart Contracts**: 
   - Community members use passkeys to participate in news verification
   - Verified news (90%+ consensus) appears in users' feeds
   - Community flagging system to remove later-identified fake news
   - XLM rewards for accurate verifiers, with a level-based reward system

3. **Stellar Passkeys for Seamless Web3 UX**:
   - No wallet integration required - use passkeys for authentication
   - Transaction signing using familiar device biometrics (Face ID, fingerprint)
   - Frictionless onboarding process with minimal steps

## Architecture

### Stellar Blockchain Infrastructure

- **Stellar Smart Contracts**: Primary mechanism for verification and rewards
  - TrueLensVerification: Smart contract for news verification
  - TrueLensRewards: Smart contract for distributing XLM rewards

- **Passkeys Integration**: Seamless authentication using device biometrics
  - Leverages Stellar Passkey Kit for wallet creation and management
  - No seed phrases or private keys for users to manage

- **Launchtube**: Used for transaction fee sponsorship to improve UX

### Storage

- Content stored on IPFS with hash-key verification
- Similar to archive.org but built for Web3

### Front-End

- Modern, clean UI built with Next.js and Tailwind CSS
- Feed page displaying verified news with sources
- Profile page showing user level, benefits, and token balance
- Verification marketplace for earning XLM rewards

## Token Economics

- **XLM**: Native utility token of the Stellar network used in the platform
- **Staking**: XLM tokens required to participate in verification
- **Reward Distribution**:
  - Tokens distributed to accurate verifiers
  - Higher rewards for higher-level users
  - Pool system for fair distribution
- **Level System**:
  - Users level up based on verification accuracy
  - Higher levels unlock additional benefits

## Getting Started

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-org/truelens.git

# Navigate to backend directory
cd truelens_backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Deploy contracts to Stellar Testnet
npm run deploy:stellar
```

### Frontend Setup
```bash
# Navigate to UI directory
cd truelens_UI

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Status

TrueLens is currently in development, with the following components in progress:
- Stellar smart contracts deployment
- Passkeys integration for authentication
- AI agents for news verification
- UI implementation with web2-like UX

## Contributing

We welcome contributions to the TrueLens project. Please see our contributing guidelines for more information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

TrueLens is being developed as part of the Stellar Consensus Hackathon 2025, targeting the "Web3 UX doesn't have to suck" track.

This project leverages the following Stellar technologies:
- Stellar SDK
- Passkey Kit for authentication
- Launchtube for transaction sponsorship