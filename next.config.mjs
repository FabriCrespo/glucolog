import path from 'path';
import { fileURLToPath } from 'url';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(__dirname);

const isGithubPages = process.env.GITHUB_PAGES === 'true';

function resolveBasePath() {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') ?? '';
  if (fromEnv) return fromEnv;

  if (isGithubPages && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    if (repo) return `/${repo}`;
  }

  if (isGithubPages) return '/glucolog';

  return '';
}

const basePath = resolveBasePath();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? 'export' : 'standalone',
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  ...(isGithubPages ? { trailingSlash: true } : {}),
  images: {
    unoptimized: isGithubPages,
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_PREDICTOR_URL: process.env.NEXT_PUBLIC_PREDICTOR_URL,
  },

  turbopack: {
    resolveAlias: {
      '@tensorflow/tfjs-node': path.join(__dirname, 'lib/stubs/tfjs-node-stub.js'),
    },
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tensorflow/tfjs-node': false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  async headers() {
    if (isGithubPages) return [];
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
