"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { connectWallet, isWalletConnected } from '@/lib/wallet-utils';

const ConnectWalletButton = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on load
  useEffect(() => {
    const checkWalletConnection = async () => {
      const connected = await isWalletConnected();
      
      if (connected) {
        setWalletConnected(true);
        
        // Try to get the account address if connected
        try {
          const address = await connectWallet(true); // Pass true to just check for address
          if (address) {
            const formattedAddress = formatAddress(address);
            setWalletAddress(formattedAddress);
          }
        } catch (error) {
          console.error("Error getting Stellar account address:", error);
        }
      }
    };
    
    checkWalletConnection();
  }, []);

  // Format the address to show only start and end parts
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle connect wallet button click
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const address = await connectWallet();
      
      if (address) {
        setWalletConnected(true);
        setWalletAddress(formatAddress(address));
      }
    } catch (error) {
      console.error("Error connecting with Stellar Passkeys:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (walletConnected && walletAddress) {
    return (
      <Link
        href="/profile"
        className="inline-flex items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 h-[40px]"
      >
        <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 10.5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="flex items-center">
          <span className="mr-1.5">Profile</span>
          <span className="text-xs py-0.5 px-2 bg-gray-100 rounded-full text-gray-600 border border-gray-200">{walletAddress}</span>
        </span>
      </Link>
    );
  }

  return (
    <button
      onClick={handleConnectWallet}
      disabled={isConnecting}
      className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 h-[40px] ${
        isConnecting
          ? 'bg-gray-100 text-gray-500 border border-gray-200'
          : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 border border-transparent'
      }`}
    >
      {isConnecting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Connect with Passkey
        </>
      )}
    </button>
  );
};

export default ConnectWalletButton; 