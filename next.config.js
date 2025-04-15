/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  }
};

module.exports = nextConfig; 