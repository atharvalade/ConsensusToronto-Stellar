"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stellar_controller_1 = require("../controllers/stellar.controller");
const router = (0, express_1.Router)();
// Account routes
router.get('/account/:publicKey', stellar_controller_1.getAccountInfo);
// Transaction routes
router.post('/transaction/create', stellar_controller_1.createTransaction);
router.post('/transaction/submit', stellar_controller_1.submitTransaction);
// News verification routes
router.post('/verify-news', stellar_controller_1.verifyNews);
// Staking routes
router.post('/stake', stellar_controller_1.stakeXLM);
exports.default = router;
