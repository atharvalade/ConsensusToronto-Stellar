import React from 'react';

type SentimentType = 'positive' | 'negative' | 'neutral' | 'mixed' | string;

interface SentimentBadgeProps {
  sentiment: SentimentType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ 
  sentiment, 
  showLabel = true,
  size = 'md'
}) => {
  // Normalize the sentiment value
  const normalizedSentiment = (typeof sentiment === 'string' ? sentiment : 'neutral').toLowerCase();
  
  // Determine colors and icon based on sentiment
  const getConfig = () => {
    switch (normalizedSentiment) {
      case 'positive':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: (
            <svg className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Positive'
        };
      case 'negative':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: (
            <svg className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Negative'
        };
      case 'mixed':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          icon: (
            <svg className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          ),
          label: 'Mixed'
        };
      case 'neutral':
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: (
            <svg className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Neutral'
        };
    }
  };
  
  const config = getConfig();
  
  return (
    <div className={`inline-flex items-center ${config.bg} ${config.text} rounded-full ${
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 
      size === 'lg' ? 'px-3 py-1 text-sm' : 
      'px-2.5 py-0.5 text-xs'
    }`}>
      {config.icon}
      {showLabel && <span className={`${size === 'sm' ? 'ml-1' : size === 'lg' ? 'ml-2 font-medium' : 'ml-1.5'}`}>{config.label}</span>}
    </div>
  );
};

export default SentimentBadge; 