"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stakeXLM = exports.verifyNews = exports.submitTransaction = exports.createTransaction = exports.getAccountInfo = void 0;
const stellar_sdk_1 = __importDefault(require("@stellar/stellar-sdk"));
const env_1 = require("../config/env");
// Setup Stellar connection based on environment
const isTestnet = env_1.config.stellarNetwork === 'TESTNET';
const server = new stellar_sdk_1.default.Server(env_1.config.stellarHorizonUrl ||
    (isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org'));
const networkPassphrase = isTestnet
    ? stellar_sdk_1.default.Networks.TESTNET
    : stellar_sdk_1.default.Networks.PUBLIC;
// Get account information
const getAccountInfo = async (req, res) => {
    try {
        const { publicKey } = req.params;
        if (!publicKey) {
            return res.status(400).json({ error: 'Public key is required' });
        }
        const account = await server.loadAccount(publicKey);
        // Extract balance information
        const balances = account.balances.map((balance) => {
            if (balance.asset_type === 'native') {
                return {
                    asset: 'XLM',
                    balance: balance.balance
                };
            }
            else {
                return {
                    asset: `${balance.asset_code}:${balance.asset_issuer}`,
                    balance: balance.balance
                };
            }
        });
        return res.status(200).json({
            publicKey: account.id,
            sequence: account.sequence,
            balances
        });
    }
    catch (error) {
        console.error('Error retrieving account info:', error);
        // Check if account doesn't exist
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Account not found' });
        }
        return res.status(500).json({ error: 'Failed to retrieve account information' });
    }
};
exports.getAccountInfo = getAccountInfo;
// Create transaction
const createTransaction = async (req, res) => {
    try {
        const { sourcePublicKey, operations } = req.body;
        if (!sourcePublicKey || !operations) {
            return res.status(400).json({ error: 'Source public key and operations are required' });
        }
        // Load the source account
        const sourceAccount = await server.loadAccount(sourcePublicKey);
        // Build the transaction
        let transaction = new stellar_sdk_1.default.TransactionBuilder(sourceAccount, {
            fee: stellar_sdk_1.default.BASE_FEE,
            networkPassphrase
        });
        // Add operations
        operations.forEach((op) => {
            switch (op.type) {
                case 'payment':
                    transaction = transaction.addOperation(stellar_sdk_1.default.Operation.payment({
                        destination: op.destination,
                        asset: stellar_sdk_1.default.Asset.native(),
                        amount: op.amount
                    }));
                    break;
                // Add more operation types as needed
                default:
                    throw new Error(`Unsupported operation type: ${op.type}`);
            }
        });
        // Set a timeout for the transaction (default: 30 seconds)
        transaction = transaction.setTimeout(30);
        // Build the transaction XDR
        const builtTransaction = transaction.build();
        const transactionXdr = builtTransaction.toXDR();
        return res.status(200).json({
            status: 'success',
            message: 'Transaction created successfully',
            transactionXdr
        });
    }
    catch (error) {
        console.error('Error creating transaction:', error);
        return res.status(500).json({ error: 'Failed to create transaction' });
    }
};
exports.createTransaction = createTransaction;
// Submit transaction
const submitTransaction = async (req, res) => {
    try {
        const { signedTransactionXdr } = req.body;
        if (!signedTransactionXdr) {
            return res.status(400).json({ error: 'Signed transaction XDR is required' });
        }
        // Submit the transaction
        const transaction = stellar_sdk_1.default.TransactionBuilder.fromXDR(signedTransactionXdr, networkPassphrase);
        const transactionResult = await server.submitTransaction(transaction);
        return res.status(200).json({
            status: 'success',
            message: 'Transaction submitted successfully',
            hash: transactionResult.hash,
            ledger: transactionResult.ledger,
            fee: transactionResult.fee_charged
        });
    }
    catch (error) {
        console.error('Error submitting transaction:', error);
        // Extract the detailed error from Stellar
        let stellarError = 'Unknown error';
        if (error.response?.data?.extras?.result_codes?.transaction) {
            stellarError = error.response.data.extras.result_codes.transaction;
        }
        return res.status(500).json({
            error: 'Failed to submit transaction',
            stellarError
        });
    }
};
exports.submitTransaction = submitTransaction;
// Verify news
const verifyNews = async (req, res) => {
    try {
        const { publicKey, newsId, choice, newsDetails } = req.body;
        if (!publicKey || !newsId || !choice) {
            return res.status(400).json({ error: 'Public key, news ID, and choice are required' });
        }
        // Load the source account
        const sourceAccount = await server.loadAccount(publicKey);
        // In a real implementation, this would call a smart contract or custom logic
        // For now, we'll simulate the verification by creating a memo transaction
        const transaction = new stellar_sdk_1.default.TransactionBuilder(sourceAccount, {
            fee: stellar_sdk_1.default.BASE_FEE,
            networkPassphrase
        })
            .addOperation(stellar_sdk_1.default.Operation.payment({
            destination: publicKey, // Self-payment of minimal amount
            asset: stellar_sdk_1.default.Asset.native(),
            amount: '0.0000001' // Minimal amount
        }))
            .addMemo(stellar_sdk_1.default.Memo.text(`Verify:${newsId}:${choice}`))
            .setTimeout(30)
            .build();
        // Convert to XDR for client-side signing
        const transactionXdr = transaction.toXDR();
        return res.status(200).json({
            status: 'success',
            message: 'News verification transaction created',
            transactionXdr
        });
    }
    catch (error) {
        console.error('Error creating news verification transaction:', error);
        return res.status(500).json({ error: 'Failed to create news verification transaction' });
    }
};
exports.verifyNews = verifyNews;
// Stake XLM
const stakeXLM = async (req, res) => {
    try {
        const { publicKey, amount } = req.body;
        if (!publicKey || !amount) {
            return res.status(400).json({ error: 'Public key and amount are required' });
        }
        // Load the source account
        const sourceAccount = await server.loadAccount(publicKey);
        // In a real implementation, this would call a staking contract
        // For now, we'll simulate staking by creating a memo transaction to a "staking pool"
        const stakingPoolAddress = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLM'; // Replace with real address
        const transaction = new stellar_sdk_1.default.TransactionBuilder(sourceAccount, {
            fee: stellar_sdk_1.default.BASE_FEE,
            networkPassphrase
        })
            .addOperation(stellar_sdk_1.default.Operation.payment({
            destination: stakingPoolAddress,
            asset: stellar_sdk_1.default.Asset.native(),
            amount: amount.toString()
        }))
            .addMemo(stellar_sdk_1.default.Memo.text('Stake XLM'))
            .setTimeout(30)
            .build();
        // Convert to XDR for client-side signing
        const transactionXdr = transaction.toXDR();
        return res.status(200).json({
            status: 'success',
            message: 'Staking transaction created',
            transactionXdr
        });
    }
    catch (error) {
        console.error('Error creating staking transaction:', error);
        return res.status(500).json({ error: 'Failed to create staking transaction' });
    }
};
exports.stakeXLM = stakeXLM;
