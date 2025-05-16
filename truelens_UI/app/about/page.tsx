"use client";

import React, { useEffect, useState } from "react";
import FeatureCard from "../../components/marketplace/feature-card";
import HowItWorks from "../../components/marketplace/how-it-works";
import CtaSection from "../../components/marketplace/cta-section";
import ScrollToTop from "../../components/marketplace/scroll-to-top";
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import Image from "next/image";

export default function AboutPage() {
  // This will contain visibility states for different sections
  const [sectionsReady, setSectionsReady] = useState(false);
  
  useEffect(() => {
    // Wait until page has loaded before triggering animations
    const timer = setTimeout(() => {
      setSectionsReady(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Sections that will animate when they come into view
  const { ref: featuresRef, inView: featuresInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const { ref: newsRef, inView: newsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const { ref: providersRef, inView: providersInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <div className="min-h-screen w-full bg-white">
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About TrueLens</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A platform for verifying news from multiple sources to help you make better trading decisions.
            </p>
          </div>
        </div>
      </section>
      
      {/* What is TrueLens - Minimalist grid */}
      <section ref={featuresRef} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className={`
            text-center mb-16
            ${sectionsReady && featuresInView ? 'animate-smooth-appear' : 'opacity-0'}
          `}>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-gray-900">What is TrueLens?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform aggregates news from multiple trusted sources and uses AI to verify authenticity, helping traders make more informed decisions.
            </p>
          </div>
          
          {/* Clean, minimalist grid layout */}
          <div className="grid grid-cols-6 grid-rows-2 gap-4 auto-rows-fr">
            {/* News Verification */}
            <div className="col-span-6 md:col-span-3 row-span-1">
              <FeatureCard
                title="News Verification"
                description="Our AI agent scrapes data from various sources and uses a sophisticated algorithm to verify news authenticity and eliminate fake news that could lead to poor trading decisions."
                colorAccent="bg-gradient-to-r from-indigo-600 to-blue-600"
                icon={
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                delay={0}
              />
            </div>
            
            {/* Voting System */}
            <div className="col-span-6 md:col-span-3 row-span-1">
              <FeatureCard
                title="Trusted Verification System"
                description="Users and trusted nodes can vote on news verification. When a majority is achieved, the news is deemed verified with incentives for accurate verification."
                colorAccent="bg-gradient-to-r from-emerald-600 to-cyan-600"
                icon={
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M15.5 9L11.5 13L9.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 17C7 17 8.5 16 12 16C15.5 16 17 17 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 5.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5.5 12H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M19 12H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                }
                delay={1}
              />
            </div>
            
            {/* Smart Contracts */}
            <div className="col-span-6 md:col-span-2 row-span-1">
              <FeatureCard
                title="Smart Contract Rewards"
                description="Verifiers are incentivized using smart contracts, with higher levels and increased incentives for consistent accurate verification."
                colorAccent="bg-gradient-to-r from-amber-500 to-orange-500"
                icon={
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M15.5 9.5H10.5C9.67157 9.5 9 10.1716 9 11V11C9 11.8284 9.67157 12.5 10.5 12.5H13.5C14.3284 12.5 15 13.1716 15 14V14C15 14.8284 14.3284 15.5 13.5 15.5H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 7.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 15.5V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                }
                delay={2}
              />
            </div>
            
            {/* IPFS Storage */}
            <div className="col-span-6 md:col-span-2 row-span-1">
              <FeatureCard
                title="IPFS Content Storage"
                description="All verified content is stored on IPFS with hash-key verification, creating a permanent and trustworthy archive of news."
                colorAccent="bg-gradient-to-r from-purple-600 to-pink-600"
                icon={
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 19C4.58172 19 1 15.4183 1 11C1 6.58172 4.58172 3 9 3C13.4183 3 17 6.58172 17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M17.1207 10.1207C17.6464 9.59489 18.5 9.97467 18.5 10.7071V19.2929C18.5 20.0253 17.6464 20.4051 17.1207 19.8793L15.9999 18.7585C15.4477 18.2063 14.5523 18.2063 14.0001 18.7585L12.9999 19.7587C12.4477 20.3109 11.5523 20.3109 11.0001 19.7587L9.99987 18.7585C9.44765 18.2063 8.55235 18.2063 8.00013 18.7585L6.87939 19.8793C6.35372 20.4051 5.5 20.0253 5.5 19.2929V4.70711C5.5 3.97467 6.35372 3.59489 6.87939 4.12056L8.00013 5.24138C8.55235 5.79361 9.44765 5.79361 9.99987 5.24138L11.0001 4.24124C11.5523 3.68902 12.4477 3.68902 12.9999 4.24124L14.0001 5.24138C14.5523 5.79361 15.4477 5.79361 15.9999 5.24138L17.1207 4.12056C17.6464 3.59489 18.5 3.97467 18.5 4.70711V5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                }
                delay={3}
              />
            </div>
            
            {/* Trading Insights */}
            <div className="col-span-6 md:col-span-2 row-span-1">
              <FeatureCard
                title="AI Trading Insights"
                description="Our AI agent summarizes verified news and provides trading suggestions to help you make informed investment decisions."
                colorAccent="from-blue-500 to-indigo-600"
                icon={
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 20L7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 4L17 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 8L7 4L11 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 16L17 20L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                delay={4}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Why TrueLens is needed */}
      <section ref={newsRef} className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className={`
            text-center mb-16 
            ${sectionsReady && newsInView ? 'animate-smooth-appear' : 'opacity-0'}
          `}>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-gray-900">Why TrueLens is Needed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              In the Trump administration era, news has become a major market driver, creating both opportunities and risks for traders.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={sectionsReady && newsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9M9 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H9M9 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 12H17M14 8H17M14 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 12C7 12.5523 6.55228 13 6 13C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11C6.55228 11 7 11.4477 7 12Z" fill="currentColor"/>
                    <path d="M7 8C7 8.55228 6.55228 9 6 9C5.44772 9 5 8.55228 5 8C5 7.44772 5.44772 7 6 7C6.55228 7 7 7.44772 7 8Z" fill="currentColor"/>
                    <path d="M7 16C7 16.5523 6.55228 17 6 17C5.44772 17 5 16.5523 5 16C5 15.4477 5.44772 15 6 15C6.55228 15 7 15.4477 7 16Z" fill="currentColor"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Market Volatility</h3>
                <p className="text-gray-600">News has driven the VIX to skyrocket to COVID levels, creating a highly volatile trading environment that requires reliable information.</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={sectionsReady && newsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Authenticity Crisis</h3>
                <p className="text-gray-600">The proliferation of fake news creates an authenticity crisis that can mislead traders into making poor investment decisions.</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={sectionsReady && newsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8L8 16M16 16L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Financial Losses</h3>
                <p className="text-gray-600">Trading based on unverified or fake news can lead to significant financial losses in both cryptocurrency and stock markets.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Technology Stack */}
      <section ref={providersRef} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className={`
            text-center mb-16
            ${sectionsReady && providersInView ? 'animate-smooth-appear' : 'opacity-0'}
          `}>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-gray-900">Our Technology Stack</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              TrueLens combines AI and blockchain technologies to provide a reliable news verification platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={sectionsReady && providersInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">AI Agents</h3>
              <p className="text-gray-600">Sophisticated AI agents scrape data from multiple sources, verify authenticity, and provide trading insights.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={sectionsReady && providersInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M3.6001 9H20.4001" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3.6001 15H20.4001" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 20.4C14.6509 20.4 16.8 16.9706 16.8 12C16.8 7.02944 14.6509 3.6 12 3.6C9.34908 3.6 7.2 7.02944 7.2 12C7.2 16.9706 9.34908 20.4 12 20.4Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Blockchain Verification</h3>
              <p className="text-gray-600">Smart contracts ensure transparent and immutable verification of news sources and incentivize accurate verification.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={sectionsReady && providersInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 13V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 19C4 17.8954 4.89543 17 6 17H18C19.1046 17 20 17.8954 20 19V20H4V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17V13H8V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">IPFS Storage</h3>
              <p className="text-gray-600">Decentralized storage ensures all verified news is permanently archived and immutably accessible.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={sectionsReady && providersInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5V7M15 11V13M15 17V19M5 5C3.89543 5 3 5.89543 3 7V10C4.10457 10 5 10.8954 5 12C5 13.1046 4.10457 14 3 14V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10V7C21 5.89543 20.1046 5 19 5H5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Multi-Source Integration</h3>
              <p className="text-gray-600">Aggregates news from TruthSocial, X (Twitter), YouTube, and other trusted platforms for comprehensive verification.</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Making Better Trading Decisions Today</h2>
                <p className="text-lg text-gray-300 mb-8">
                  Join TrueLens and gain access to verified news that will help you navigate the markets with confidence.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a 
                    href="/feed" 
                    className="inline-flex items-center justify-center rounded-full bg-white text-black px-6 py-3 text-base font-medium transition-all hover:bg-gray-100 hover:shadow-lg"
                  >
                    Explore Your Feed
                    <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="inline-flex items-center justify-center rounded-full border border-white bg-transparent px-6 py-3 text-base font-medium text-white transition-all hover:bg-white/10"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
} 