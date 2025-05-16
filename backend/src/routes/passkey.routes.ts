import { Router } from 'express';
import { 
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication
} from '../controllers/passkey.controller';

const router = Router();

// Registration routes
router.post('/register/options', generateRegistrationOptions);
router.post('/register/verify', verifyRegistration);

// Authentication routes
router.post('/login/options', generateAuthenticationOptions);
router.post('/login/verify', verifyAuthentication);

export default router; 