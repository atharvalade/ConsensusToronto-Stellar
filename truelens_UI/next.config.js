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
};

module.exports = nextConfig;
