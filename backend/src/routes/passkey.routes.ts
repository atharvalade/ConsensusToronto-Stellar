import { Router, Request, Response } from 'express';

const router = Router();

// Import controllers (with dynamic import to avoid circular dependency)
router.post('/register/options', async (req: Request, res: Response) => {
  try {
    const { generateRegistrationOptions } = require('../controllers/passkey.controller');
    return generateRegistrationOptions(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register/verify', async (req: Request, res: Response) => {
  try {
    const { verifyRegistration } = require('../controllers/passkey.controller');
    return verifyRegistration(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login/options', async (req: Request, res: Response) => {
  try {
    const { generateAuthenticationOptions } = require('../controllers/passkey.controller');
    return generateAuthenticationOptions(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login/verify', async (req: Request, res: Response) => {
  try {
    const { verifyAuthentication } = require('../controllers/passkey.controller');
    return verifyAuthentication(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 