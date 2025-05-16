/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["lh3.googleusercontent.com", "vercel.com", "s.yimg.com","media.zenfs.com", "images.unsplash.com", "i.abcnewsfe.com"],
    contentDispositionType: 'attachment',
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [];
  },
  transpilePackages: ['passkey-kit', 'passkey-kit-sdk', 'sac-sdk'],
  webpack: (config) => {
    // Add support for importing .wasm files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    };
    
    // Handle native node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      process: require.resolve('process/browser'),
    };
    
    // Handle imports
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    // Add TypeScript handling rule
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules\/(?!sac-sdk|passkey-kit).*|app\/fonts\/.*/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            'next/babel',
            ['@babel/preset-typescript', { allowDeclareFields: true }]
          ],
          plugins: [
            ['@babel/plugin-transform-typescript', { allowDeclareFields: true }]
          ]
        }
      }
    });
    
    return config;
  },
};

module.exports = nextConfig;
