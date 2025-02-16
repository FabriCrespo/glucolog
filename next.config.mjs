const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config) => {
    config.output.clean = true;
    return config;
  },
  async headers() {
    return [
      {
        source: '/secure-route/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
