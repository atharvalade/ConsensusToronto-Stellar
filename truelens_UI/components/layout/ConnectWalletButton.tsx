"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { connectWallet, isWalletConnected, disconnectWallet } from '@/lib/wallet-utils';

const ConnectWalletButton = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if wallet is already connected on load
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        console.log("Checking for existing wallet connection...");
        const connected = await isWalletConnected();
        
        if (connected) {
          console.log("Found existing wallet connection");
          setWalletConnected(true);
          
          // Try to get the account address if connected
          try {
            const address = await connectWallet(true); // Just check for existing connection
            if (address) {
              setWalletAddress(address);
              console.log("Restored wallet connection with address:", address);
            } else {
              console.log("No wallet address found despite being connected");
            }
          } catch (error) {
            console.error("Error getting wallet address:", error);
            // Clear localStorage if there's an issue with the stored data
            localStorage.removeItem('stellar_account');
            setWalletConnected(false);
          }
        } else {
          console.log("No existing wallet connection found");
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    checkWalletConnection();
  }, []);

  const clearWalletState = () => {
    localStorage.removeItem('stellar_account');
    setWalletConnected(false);
    setWalletAddress(null);
    setShowDropdown(false);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    
    try {
      console.log("Starting wallet connection process");
      const address = await connectWallet();
      
      if (address) {
        console.log("Successfully connected wallet:", address);
        setWalletConnected(true);
        setWalletAddress(address);
      } else {
        setErrorMessage("Failed to connect wallet - no address returned");
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      
      if (error?.message?.includes("XDR Write Error") || error?.message?.includes("XDR encoding error")) {
        console.log("XDR error detected - clearing localStorage");
        clearWalletState();
        setErrorMessage("Connection failed due to an encoding error. Please check your contract address configuration and try again.");
      } else if (error?.message?.includes("obtain contract wasm")) {
        console.log("Contract WASM error detected - clearing localStorage");
        clearWalletState();
        setErrorMessage("Could not find wallet contract. Please check that the contract address is correct and the contract is deployed to the network.");
      } else if (error?.message?.includes("NotAllowedError")) {
        setErrorMessage("Browser denied permission. Please allow the passkey request.");
      } else if (error?.message?.includes("contract address") || error?.message?.includes("contract not found")) {
        setErrorMessage("Invalid or missing contract address. Please check your configuration and try again.");
      } else {
        setErrorMessage(error?.message || "Error connecting wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log("Disconnecting wallet");
      const success = await disconnectWallet();
      
      if (success) {
        clearWalletState();
        setErrorMessage(null);
        console.log("Wallet disconnected successfully");
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  // Format wallet address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="relative">
      {walletConnected ? (
        <div className="flex items-center gap-3">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-full transition-all duration-200 flex items-center gap-2 shadow-md"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="hidden sm:inline">Connected:</span> {formatAddress(walletAddress)}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700">
              <div className="p-2">
                <Link href="/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  Profile
                </Link>
                <button 
                  onClick={handleDisconnect}
                  className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-end">
          <button
            className="bg-white hover:bg-gray-100 text-purple-600 font-medium py-2 px-5 rounded-full border-2 border-purple-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Connect with Passkey
              </>
            )}
          </button>
          
          {errorMessage && (
            <div className="mt-2 px-3 py-2 bg-red-100 border border-red-300 text-red-600 text-sm rounded-md">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectWalletButton; 