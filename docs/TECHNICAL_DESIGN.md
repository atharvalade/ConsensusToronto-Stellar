# TrueLens-Stellar Technical Design

## Overview

TrueLens is a decentralized news verification platform that allows users to verify or flag news items, stake tokens, and earn rewards for accurate verification. The system leverages Stellar's passkey authentication and Soroban smart contracts to provide a seamless user experience while maintaining the benefits of blockchain technology.

## System Architecture

![TrueLens Architecture](https://i.imgur.com/Ys8V2jA.png)

The TrueLens platform consists of several key components:

1. **Frontend Application**: A Next.js-based web application that provides the user interface
2. **Passkey Authentication**: Integration with Stellar's passkey-kit for biometric authentication
3. **Smart Contracts**: Soroban-based contracts for news verification, token management, and rewards
4. **IPFS Integration**: For storing and retrieving news content with immutable proofs

## Contract Design

The smart contract system consists of three main contracts:

### Factory Contract

The factory contract serves as the entry point for the system and manages the creation of verification contracts for each news item.

```
┌─────────────────────────┐
│   Factory Contract      │
├─────────────────────────┤
│ - Initialize()          │
│ - SubmitNews()          │
│ - GetNewsInfo()         │
│ - GetAllNews()          │
│ - VerifyNews()          │
│ - GetConsensus()        │
│ - DistributeRewards()   │
└─────────────────────────┘
```

### Token Contract

The token contract implements the TRUE token, which is used for staking and rewards.

```
┌─────────────────────────┐
│     Token Contract      │
├─────────────────────────┤
│ - Initialize()          │
│ - Mint()                │
│ - MintReward()          │
│ - Transfer()            │
│ - TransferFrom()        │
│ - Approve()             │
│ - Balance()             │
│ - Burn()                │
└─────────────────────────┘
```

### Verification Contract

The verification contract manages the verification process for a specific news item, tracking votes and stakes.

```
┌─────────────────────────┐
│ Verification Contract   │
├─────────────────────────┤
│ - Initialize()          │
│ - SubmitVerification()  │
│ - GetNewsItem()         │
│ - GetVerifications()    │
│ - CalculateConsensus()  │
│ - CloseVerification()   │
│ - GetVerificationStatus()│
│ - AddToRewardPool()     │
└─────────────────────────┘
```

## Storage Design

### Contract State

The contract state is stored using the following data structures:

1. **NewsItem**: Stores information about a news item
   - ID (hash)
   - Title
   - Content hash (IPFS CID)
   - Source
   - Timestamp
   - Verification counts
   - Total stake

2. **Verification**: Stores information about a user's verification
   - Verifier address
   - News ID
   - Status (Verified/Flagged)
   - Stake amount
   - Timestamp

The state is stored using Soroban's persistent storage with appropriate keys to enable efficient lookups:

- News items are stored in a vector for efficient listing
- Verifications are stored using composite keys (news ID + verifier address)
- Global counters and settings are stored as simple key-value pairs

## Event Emissions

The contracts emit events to notify clients of important state changes:

1. **NewsSubmitted**: When a new news item is submitted
2. **VerificationSubmitted**: When a user verifies or flags a news item
3. **VerificationClosed**: When verification for a news item is closed
4. **RewardsDistributed**: When rewards are distributed to users

## User Flow

1. **Authentication**: User authenticates using Stellar passkeys
2. **Browse News**: User browses the news feed and selects an item
3. **Verification**: User verifies or flags a news item, staking tokens
4. **Rewards**: User receives rewards if their verification matches consensus

## Passkey Integration

The integration with Stellar passkeys is implemented in the frontend using the Passkey Kit:

1. **User Registration**: New users create a wallet using biometric authentication
2. **Wallet Funding**: New wallets are automatically funded on testnet
3. **Transaction Signing**: Users sign transactions using passkeys instead of seed phrases

## Design Choices

### Why we used specific storage types:

- **Vector for news items**: Provides efficient iteration for displaying news feeds
- **Composite keys for verifications**: Enables O(1) lookup of a user's verification status
- **Instance storage**: Used for contract-specific data that should persist across invocations

### Contract state storage:

- News items are stored in a structured format to enable efficient querying
- Verification status is tracked per user to prevent double-voting
- Stake amounts are stored to enable weighted consensus calculation

### Event emissions:

- Events are emitted for key state changes to enable frontend updates
- Event data is minimal to reduce gas costs while providing necessary information

### Passkey implementation:

- Passkeys are used for authentication and transaction signing
- The implementation abstracts away the complexity of key management
- Users can use familiar biometric authentication (Face ID, Touch ID) instead of seed phrases

## Security Considerations

1. **Authorization**: All sensitive operations require authorization from the appropriate user
2. **Stake Protection**: Stake amounts must be positive to prevent economic attacks
3. **Double-voting Prevention**: Users can only verify a news item once
4. **Admin Controls**: Admin functions are protected by authorization checks

## Implementation Challenges

During implementation, we encountered and overcame several challenges:

1. **Integrating Passkeys**: Ensuring seamless passkey authentication with frontend components
2. **Consensus Calculation**: Implementing weighted consensus based on stake amounts
3. **Cross-Contract Communication**: Ensuring proper communication between factory and verification contracts
4. **UX Design**: Creating a web2-like experience that hides blockchain complexity

## Future Enhancements

Future enhancements to consider:

1. **Reputation System**: Implementing a reputation system based on verification history
2. **AI Integration**: Using AI for preliminary verification suggestions
3. **Cross-chain Integration**: Enabling verification and token bridges to other chains
4. **Mobile App**: Developing a mobile application for on-the-go verification

## Diagrams

### Contract Interaction Flow

```
User -> Frontend -> Factory Contract -> Verification Contract
                  -> Token Contract
```

### Verification Workflow

```
1. User submits verification
2. User stakes tokens
3. System tracks consensus
4. When threshold reached, verification closes
5. Rewards distributed to accurate verifiers
```

### Data Flow

```
News Feed -> User Selection -> Verification -> Stake -> Reward
``` 