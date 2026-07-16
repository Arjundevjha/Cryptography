/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isVercel = process.env.VERCEL === '1';
    const backendUrl = process.env.BACKEND_URL || (isVercel ? '/api/main' : 'http://localhost:8000');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

