import { Router } from 'express';
import {
  getAccountInfo,
  createTransaction,
  submitTransaction,
  verifyNews,
  stakeXLM
} from '../controllers/stellar.controller';

const router = Router();

// Account routes
router.get('/account/:publicKey', getAccountInfo);

// Transaction routes
router.post('/transaction/create', createTransaction);
router.post('/transaction/submit', submitTransaction);

// News verification routes
router.post('/verify-news', verifyNews);

// Staking routes
router.post('/stake', stakeXLM);

export default router; 