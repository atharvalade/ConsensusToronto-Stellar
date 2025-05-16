import { Router, Request, Response } from 'express';

const router = Router();

// Import controllers (with dynamic import to avoid circular dependency)
router.get('/account/:publicKey', async (req: Request, res: Response) => {
  try {
    const { getAccountInfo } = require('../controllers/stellar.controller');
    return getAccountInfo(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/transaction/create', async (req: Request, res: Response) => {
  try {
    const { createTransaction } = require('../controllers/stellar.controller');
    return createTransaction(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/transaction/submit', async (req: Request, res: Response) => {
  try {
    const { submitTransaction } = require('../controllers/stellar.controller');
    return submitTransaction(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify-news', async (req: Request, res: Response) => {
  try {
    const { verifyNews } = require('../controllers/stellar.controller');
    return verifyNews(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/stake', async (req: Request, res: Response) => {
  try {
    const { stakeXLM } = require('../controllers/stellar.controller');
    return stakeXLM(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 