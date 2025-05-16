# TrueLens-Stellar

A decentralized news verification platform built on Stellar, leveraging passkeys for seamless authentication and transaction signing. This project aims to demonstrate that web3 UX doesn't have to suck by building a dapp with the seamlessness, intuition, and fluidity of web2 UX.

Website: [Stellar Developers](https://developers.stellar.org/)

## Features Implemented

- **Passkey-Based Authentication**: Users can create and connect wallets using device biometrics (Face ID, Touch ID, etc.)
- **Frictionless Onboarding**: New users can get started in seconds with a streamlined registration process
- **Smart Contract Interaction**: Verify news articles and stake XLM through smart contracts
- **Automated Funding**: New wallets are automatically funded on testnet for a seamless user experience
- **News Verification Platform**: Users can verify or flag news articles, helping combat misinformation
- **Token Staking**: Support verified news sources by staking XLM tokens
- **Automated Rewards**: Users earn rewards for correctly identifying true/fake news

## Technologies Used

### Stellar Technologies
- **[Passkey Kit](https://github.com/kalepail/passkey-kit)**: For seamless biometric authentication and wallet creation
- **[Stellar SDK](https://github.com/stellar/js-stellar-sdk)**: For interacting with the Stellar blockchain
- **[Launchtube](https://github.com/stellar/launchtube)**: For submitting transactions to the Stellar network
- **Soroban Smart Contracts**: Written in Rust to implement the verification and staking logic

### Frontend Technologies
- **Next.js**: React framework for the frontend application
- **TailwindCSS**: For styling the UI components
- **TypeScript**: For type-safe code
- **SvelteKit**: For server-side API routes

## Why TrueLens-Stellar?

In a world where misinformation spreads faster than ever, TrueLens-Stellar aims to create a decentralized system for news verification that leverages blockchain technology to incentivize truthful reporting. By making the verification process accessible through seamless UX, we lower the barrier to entry for participating in this important ecosystem.

The key insight is that web3 applications often fail not because of their underlying value proposition, but because of poor user experience. TrueLens-Stellar demonstrates that blockchain applications can be as intuitive and frictionless as traditional web2 applications while maintaining the benefits of decentralization.

### Problem Statement
Misinformation is a pervasive problem that affects financial markets, public health, and democratic processes. Traditional centralized fact-checkers face criticism for potential biases, while decentralized alternatives have suffered from poor user experience, limiting mass adoption.

### User Base
- Cryptocurrency and stock traders who need reliable information
- News consumers seeking verified information
- Journalists and content creators looking to establish credibility
- Fact-checkers who want to earn rewards for their work

### Impact
TrueLens creates a more transparent information ecosystem by:
- Incentivizing truth through token rewards
- Creating economic penalties for spreading misinformation
- Building a reputation system for news sources
- Providing traders with more reliable information for better investment decisions

### Why Stellar
Stellar's passkey-based authentication allows users to participate in web3 verification without the typical wallet complexities. The transaction speed and low fees make micro-staking and rewards economically viable, while smart contracts enable transparent and trustless verification processes.

## Technical Design

Our technical design focuses on three key elements:

1. **Seamless Authentication**: Using passkeys to eliminate the friction of traditional web3 authentication
2. **Smart Contract Integration**: Building Rust-based Soroban smart contracts for news verification and staking
3. **Intuitive UI**: Creating a familiar, web2-like interface that hides the complexity of blockchain interactions

[Link to Technical Design Document](docs/TECHNICAL_DESIGN.md)

## Deployed Contract IDs

- **News Verification Contract**: CAVKQCR4WAFPPHAXC24GFEKFADUJZQ6V22O3OPS4FSA3IYFEZM6YTRXY ([Stellar Expert Link](https://stellar.expert/explorer/testnet/contract/CAVKQCR4WAFPPHAXC24GFEKFADUJZQ6V22O3OPS4FSA3IYFEZM6YTRXY))
- **Token Contract**: CDEJSTARK5YTJAK2SKS6NQAAFZTDDXPTXSNVVIWCOXVPBMVCBTNKBUW ([Stellar Expert Link](https://stellar.expert/explorer/testnet/contract/CDEJSTARK5YTJAK2SKS6NQAAFZTDDXPTXSNVVIWCOXVPBMVCBTNKBUW))
- **Factory Contract**: GAJNKGZI23LFE5QXMWVZWHUOFUJV2ZOS3YT4U2T47X6A4QVMHX2SJQ7U ([Stellar Expert Link](https://stellar.expert/explorer/testnet/contract/GAJNKGZI23LFE5QXMWVZWHUOFUJV2ZOS3YT4U2T47X6A4QVMHX2SJQ7U))

## Deployment

- Frontend: [TrueLens-Stellar App](https://truelens-stellar.vercel.app) (Coming soon)
- Backend: Deployed on Stellar Testnet

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Access to Stellar Testnet

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/TrueLens-Stellar.git
cd TrueLens-Stellar
```

2. Install dependencies
```bash
npm install --legacy-peer-deps
```

3. Create a `.env.local` file based on the `PASSKEY_SETUP.md` template

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
TrueLens-Stellar/
├── truelens_UI/           # Frontend Next.js application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/               # Utility functions and hooks
│   └── public/            # Static assets
├── factory-contract/      # Soroban smart contracts
│   ├── src/               # Contract source code
│   │   ├── lib.rs         # Main factory contract
│   │   ├── token.rs       # Token contract
│   │   └── verification.rs # News verification contract
│   └── Cargo.toml         # Rust dependencies
├── docs/                  # Documentation
└── README.md              # Project overview
```

## Experience Building on Stellar

Building on Stellar has been a transformative experience. The passkey implementation significantly streamlines user onboarding compared to traditional web3 experiences. The developer tooling, particularly the Soroban CLI and SDK, made smart contract development accessible even for developers newer to Rust.

The most exciting aspect was seeing users interact with blockchain functionality without requiring complex wallet setup or seed phrase management. This truly demonstrates that web3 UX doesn't have to suck when built on Stellar.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- The Stellar Development Foundation for their amazing tools and documentation
- The Consensus Toronto 2025 Hackathon for the opportunity to build this project