/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config) => {
    // Mock MongoDB modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      mongodb: false,
      mongoose: false
    };
    return config;
  }
};

module.exports = nextConfig; 