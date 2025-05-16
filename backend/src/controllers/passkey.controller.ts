import { Request, Response } from 'express';
import {
  generateRegistrationOptions as generateRegOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions as generateAuthOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

// In-memory storage for user credentials (replace with database in production)
const users = new Map<string, {
  id: string,
  username: string,
  publicKey?: string,
  currentChallenge?: string,
  credentials: Array<{
    id: string,
    publicKey: string,
    counter: number
  }>
}>();

// Environment variables (should be loaded from .env)
const rpName = process.env.RP_NAME || 'Stellar Consensus News';
const rpID = process.env.RP_ID || 'localhost';
const rpIcon = process.env.RP_ICON || '';

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
    const userId = isoBase64URL.encode(Buffer.from(username));
    const user = {
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
      id: isoBase64URL.encode(credentialID),
      publicKey: isoBase64URL.encode(credentialPublicKey),
      counter
    });

    // Store the public key for Stellar account generation
    user.publicKey = isoBase64URL.encode(credentialPublicKey);

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
      id: isoBase64URL.decode(cred.id),
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
    const credentialID = isoBase64URL.encode(authenticationResponse.rawId);
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
        credentialID: isoBase64URL.decode(credential.id),
        credentialPublicKey: isoBase64URL.decode(credential.publicKey),
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