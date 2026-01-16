import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

export default defineConfig({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    //   manifest: {
    //     name: 'Game Store Zarzis',
    //     short_name: 'GS Zarzis',
    //     description: 'Game Store Zarzis - Réparation Tech & Zone Gaming',
    //     theme_color: '#b91c1c',
    //     background_color: '#0a0e1a',
    //     display: 'standalone',
    //     orientation: 'portrait-primary',
    //     scope: '/',
    //     start_url: '/',
    //     icons: [
    //       {
    //         src: 'pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable',
    //       },
    //     ],
    //   },
    //   workbox: {
    //     cleanupOutdatedCaches: true,
    //     clientsClaim: true,
    //     skipWaiting: true,
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    //     // Simplified runtime caching to avoid configuration issues
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         },
    //       },
    //       {
    //         urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'gstatic-fonts-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         },
    //       },
    //       // {
    //       //   urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    //       //   handler: 'StaleWhileRevalidate',
    //       //   options: {
    //       //     cacheName: 'images-cache',
    //       //     expiration: {
    //       //       maxEntries: 100,
    //       //       maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    //       //     },
    //       //   },
    //       // },
    //       // {
    //       //   urlPattern: /^https:\/\/.*\/api\/.*/i,
    //       //   handler: 'NetworkFirst',
    //       //   options: {
    //       //     cacheName: 'api-cache',
    //       //     expiration: {
    //       //       maxEntries: 50,
    //       //       maxAgeSeconds: 60 * 60 * 24, // 1 day
    //       //     },
    //       //     networkTimeoutSeconds: 10,
    //       //   },
    //       // },
    //     ],
    //     // Cache navigation requests
    //     navigateFallback: '/index.html',
    //   },
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk splitting - more aggressive for better caching
    rollupOptions: {
      output: {
        // Use standard Vite chunking for better reliability
      },
    },
    // Minification (using esbuild, faster than terser)
    minify: 'esbuild',
    // Chunk size warnings - reduced threshold
    chunkSizeWarningLimit: 600,
    // Source maps for production (disabled for smaller builds)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize assets - inline smaller assets for faster initial load
    assetsInlineLimit: 4096, // Inline assets < 4kb to reduce HTTP requests
    // Target modern browsers for smaller bundle
    target: 'es2020', // More modern target = smaller output
    // Report compressed sizes
    reportCompressedSize: true,
  },
  // Use default dependency optimization
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    // Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
