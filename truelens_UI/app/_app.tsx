import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // This helps with dynamic imports
    async function preloadModules() {
      try {
        await import('passkey-kit');
        console.log('Successfully preloaded passkey-kit');
      } catch (error) {
        console.error('Error preloading modules:', error);
      }
    }
    
    preloadModules();
  }, []);

  return <Component {...pageProps} />;
} 