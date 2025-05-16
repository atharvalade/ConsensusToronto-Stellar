"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passkey_controller_1 = require("../controllers/passkey.controller");
const router = (0, express_1.Router)();
// Registration routes
router.post('/register/options', passkey_controller_1.generateRegistrationOptions);
router.post('/register/verify', passkey_controller_1.verifyRegistration);
// Authentication routes
router.post('/login/options', passkey_controller_1.generateAuthenticationOptions);
router.post('/login/verify', passkey_controller_1.verifyAuthentication);
exports.default = router;
