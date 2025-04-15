/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://placeholder:placeholder@localhost:27017/placeholder",
    IS_DEMO: "true"
  }
};

module.exports = nextConfig; 