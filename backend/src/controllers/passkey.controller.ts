import { Request, Response } from 'express';
import {
  generateRegistrationOptions as generateRegOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions as generateAuthOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { config } from '../config/env';

// Define user interface
interface User {
  id: string;
  username: string;
  publicKey?: string;
  currentChallenge?: string;
  credentials: Array<{
    id: string;
    publicKey: string;
    counter: number;
  }>;
}

// In-memory storage for user credentials (replace with database in production)
const users = new Map<string, User>();

// Environment variables
const rpName = config.rpName;
const rpID = config.rpId;
const rpIcon = config.rpIcon;

// Simple Base64URL encoding/decoding functions
const base64url = {
  encode: (buffer: Buffer | Uint8Array): string => {
    if (buffer instanceof Uint8Array) {
      buffer = Buffer.from(buffer);
    }
    return buffer.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  },
  decode: (base64url: string): Buffer => {
    // Add padding if needed
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;
    return Buffer.from(paddedBase64, 'base64');
  }
};

// Generate registration options
export const generateRegistrationOptions = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Check if user already exists
    if (users.has(username)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a new user
    const userId = base64url.encode(Buffer.from(username));
    const user: User = {
      id: userId,
      username,
      credentials: []
    };

    // Generate registration options
    const options = await generateRegOptions({
      rpName,
      rpID,
      userID: userId,
      userName: username,
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'required',
      },
      supportedAlgorithmIDs: [-7, -257] // ES256 and RS256
    });

    // Store the current challenge
    user.currentChallenge = options.challenge;
    users.set(username, user);

    return res.status(200).json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    return res.status(500).json({ error: 'Failed to generate registration options' });
  }
};

// Verify registration
export const verifyRegistration = async (req: Request, res: Response) => {
  try {
    const { username, registrationResponse } = req.body;

    if (!username || !registrationResponse) {
      return res.status(400).json({ error: 'Username and registration response are required' });
    }

    // Get the user
    const user = users.get(username);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Verify the registration response
    const expectedChallenge = user.currentChallenge;
    if (!expectedChallenge) {
      return res.status(400).json({ error: 'No challenge found for user' });
    }

    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge,
      expectedOrigin: `https://${rpID}`,
      expectedRPID: rpID
    });

    if (!verification.verified) {
      return res.status(400).json({ error: 'Registration verification failed' });
    }

    // Extract credential info
    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo!;

    // Store the credential
    user.credentials.push({
      id: base64url.encode(credentialID),
      publicKey: base64url.encode(credentialPublicKey),
      counter
    });

    // Store the public key for Stellar account generation
    user.publicKey = base64url.encode(credentialPublicKey);

    // Clear the challenge
    user.currentChallenge = undefined;

    // Save the user
    users.set(username, user);

    return res.status(200).json({
      status: 'success',
      message: 'Registration successful',
      publicKey: user.publicKey
    });
  } catch (error) {
    console.error('Error verifying registration:', error);
    return res.status(500).json({ error: 'Failed to verify registration' });
  }
};

// Generate authentication options
export const generateAuthenticationOptions = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Get the user
    const user = users.get(username);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Get credential IDs
    const allowCredentials = user.credentials.map(cred => ({
      id: base64url.decode(cred.id),
      type: 'public-key' as const,
    }));

    // Generate options
    const options = await generateAuthOptions({
      rpID,
      allowCredentials,
      userVerification: 'preferred',
    });

    // Store the current challenge
    user.currentChallenge = options.challenge;
    users.set(username, user);

    return res.status(200).json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    return res.status(500).json({ error: 'Failed to generate authentication options' });
  }
};

// Verify authentication
export const verifyAuthentication = async (req: Request, res: Response) => {
  try {
    const { username, authenticationResponse } = req.body;

    if (!username || !authenticationResponse) {
      return res.status(400).json({ error: 'Username and authentication response are required' });
    }

    // Get the user
    const user = users.get(username);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Verify the authentication response
    const expectedChallenge = user.currentChallenge;
    if (!expectedChallenge) {
      return res.status(400).json({ error: 'No challenge found for user' });
    }

    // Find the credential
    const credentialID = base64url.encode(authenticationResponse.rawId);
    const credential = user.credentials.find(c => c.id === credentialID);
    if (!credential) {
      return res.status(400).json({ error: 'Credential not found' });
    }

    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge,
      expectedOrigin: `https://${rpID}`,
      expectedRPID: rpID,
      authenticator: {
        credentialID: base64url.decode(credential.id),
        credentialPublicKey: base64url.decode(credential.publicKey),
        counter: credential.counter,
      }
    });

    if (!verification.verified) {
      return res.status(400).json({ error: 'Authentication verification failed' });
    }

    // Update the credential counter
    credential.counter = verification.authenticationInfo.newCounter;
    user.currentChallenge = undefined;

    // Save the user
    users.set(username, user);

    return res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      user: {
        username: user.username,
        publicKey: user.publicKey
      }
    });
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return res.status(500).json({ error: 'Failed to verify authentication' });
  }
}; 