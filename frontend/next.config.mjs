/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
  
  },
  // Optional if proxying
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://https://invoice-backend-g5q0.onrender.com/api/:path*',
      },
    ]
  },
}
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
