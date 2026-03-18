/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 允许从外部 API 获取数据
  async rewrites() {
    return [
      {
        source: '/api/eastmoney/:path*',
        destination: 'https://push2.eastmoney.com/:path*',
      },
      {
        source: '/api/yahoo/:path*',
        destination: 'https://query1.finance.yahoo.com/:path*',
      },
    ];
  },
}

module.exports = nextConfig
