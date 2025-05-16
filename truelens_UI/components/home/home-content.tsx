"use client";

import { Github } from "@/components/shared/icons";
import { nFormatter } from "@/lib/utils";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HomeContentProps {
  stars: number;
  deployUrl: string;
}

export default function HomeContent({ stars, deployUrl }: HomeContentProps) {
  const [mounted, setMounted] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Show description after a delay
    const timer = setTimeout(() => {
      setShowDescription(true);
    }, 3200); // Slightly longer than title animation
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-96px)] w-full">
      <div className="z-10 w-full max-w-3xl px-5 xl:px-0 text-center transform -translate-y-8">
        <h1 
          className={`
            font-display font-bold tracking-[-0.02em] text-gray-900 leading-tight mb-6
            text-5xl md:text-7xl
            ${mounted ? 'animate-title-slow' : 'opacity-0'}
          `}
        >
          Authentic News
          <br className="hidden sm:inline" />
          With Stellar UX
          <span className="text-gray-900 animate-cursor">|</span>
        </h1>
        
        <p 
          className={`
            mt-6 text-gray-600 md:text-xl mb-10 leading-relaxed max-w-xl mx-auto
            transition-all duration-1000 ease-in-out
            ${showDescription ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}
          `}
        >
          A platform for verifying news from multiple sources using Stellar's smart contracts and passkeys for a seamless web3 experience.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link
            className="flex items-center justify-center rounded-full border border-black bg-black px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white hover:text-black shadow-sm hover:shadow-md"
            href="/about"
          >
            <svg
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            About TrueLens
          </Link>
          <Link
            className="flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-gray-800 hover:shadow-md"
            href="/feed"
          >
            <svg
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 5H18M6 9H18M6 13H12M6 17H10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Your Feed
          </Link>
        </div>
      </div>
    </div>
  );
} 