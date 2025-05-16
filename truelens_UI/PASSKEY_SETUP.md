# TrueLens Passkey Setup Guide

This guide will help you set up your environment to use passkeys with the TrueLens decentralized news verification platform.

## What are Passkeys?

Passkeys are a safer and easier replacement for passwords that are built on industry standards. They use cryptographic key pairs to protect your account and let you sign in with fingerprint, face recognition, or a device PIN.

With TrueLens, passkeys allow you to:

1. Create a Stellar wallet without seed phrases
2. Sign blockchain transactions using biometrics
3. Seamlessly verify news content without complex wallet management

## Prerequisites

- A modern browser that supports WebAuthn (Chrome, Firefox, Safari, Edge)
- A device with biometric capabilities (Touch ID, Face ID, fingerprint sensor)
- For mobile: iOS 16+ or Android 9+

## Environment Setup

To use TrueLens with passkeys, you need to configure the following environment variables:

1. Create a `.env.local` file in the root directory with the following content:

```
# Stellar RPC URL
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org

# Stellar Network Passphrase
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Smart Contract Addresses
NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS=GAJNKGZI23LFE5QXMWVZWHUOFUJV2ZOS3YT4U2T47X6A4QVMHX2SJQ7U
NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS=CDEJSTARK5YTJAK2SKS6NQAAFZTDDXPTXSNVVIWCOXVPBMVCBTNKBUW
NEXT_PUBLIC_VERIFICATION_CONTRACT_ADDRESS=CAVKQCR4WAFPPHAXC24GFEKFADUJZQ6V22O3OPS4FSA3IYFEZM6YTRXY
```

## Creating a Passkey

When you first visit TrueLens, you'll be prompted to create a passkey. Here's what happens:

1. Click "Connect with Passkey"
2. If this is your first time, you'll be prompted to "Create New Passkey"
3. Your device will ask you to authenticate using biometrics (face, fingerprint, etc.)
4. A new Stellar wallet will be created for you automatically
5. Your wallet will be funded with testnet XLM

No seed phrases to write down or private keys to worry about!

## Using Your Passkey

Once your passkey is set up, you can:

1. Verify news items using simple biometric authentication
2. Stake XLM tokens on verification with a simple prompt
3. Earn rewards when your verifications match consensus
4. Access your account from any supported device

## Troubleshooting

### My passkey isn't working

1. Make sure your browser and device support WebAuthn
2. Check that your biometric authentication (Touch ID, Face ID) is enabled
3. Try clearing your browser cache and reloading the page

### I'm getting an error about contract addresses

If you see errors about contract addresses:
1. Check that your `.env.local` file has the correct contract addresses
2. Make sure the addresses follow the Stellar format (starting with C or G)
3. Verify that the contracts exist on the Stellar testnet

### I can't create a new wallet

1. Ensure your internet connection is stable
2. Check that the Stellar testnet is operational
3. Make sure you've granted the necessary permissions to your browser for biometrics

## Security Considerations

Passkeys are more secure than traditional passwords because:

1. They're based on public key cryptography
2. They're resistant to phishing attacks
3. They require physical access to your device
4. They can't be reused across different sites

Your private keys never leave your device, making passkey authentication both more secure and more convenient.

## Further Resources

- [Stellar Developers Portal](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [WebAuthn Guide](https://webauthn.guide/)
- [Passkey Kit Documentation](https://github.com/kalepail/passkey-kit)

For any technical issues, please open an issue on our GitHub repository. 