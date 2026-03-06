import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'
import bundleAnalyzer from '@next/bundle-analyzer'
import { codeInspectorPlugin } from 'code-inspector-plugin'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
})

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vdkyjmlalrspsebjhkya.supabase.co',
      },
    ],
  },
  turbopack: {
    rules: codeInspectorPlugin({
      bundler: 'turbopack',
      editor: 'trae',
    }),
  },
}

export default withBundleAnalyzer(withPWA(nextConfig))
