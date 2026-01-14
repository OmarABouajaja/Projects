import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

export default defineConfig({
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Game Store Zarzis',
        short_name: 'GS Zarzis',
        description: 'Game Store Zarzis - Réparation Tech & Zone Gaming',
        theme_color: '#b91c1c',
        background_color: '#0a0e1a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Simplified runtime caching to avoid configuration issues
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
        // Cache navigation requests
        navigateFallback: '/index.html',
      },
    }),
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
        manualChunks: (id) => {
          // Split vendors more aggressively for better caching
          if (id.includes('node_modules')) {
            // Core React - rarely changes, cache long-term
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            // Router - separate chunk
            if (id.includes('react-router')) {
              return 'router';
            }
            // Radix UI components - split by usage pattern
            if (id.includes('@radix-ui')) {
              // Split frequently used components
              if (id.includes('tooltip') || id.includes('dialog') || id.includes('popover')) {
                return 'ui-core';
              }
              return 'ui-vendor';
            }
            // Icons - large library, separate chunk
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Utils - small, cache together
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'utils';
            }
            // Large unused libraries - separate to avoid loading
            if (id.includes('@tanstack/react-query') || id.includes('recharts') || id.includes('date-fns') ||
              id.includes('react-hook-form') || id.includes('react-day-picker') || id.includes('embla-carousel') ||
              id.includes('cmdk') || id.includes('vaul') || id.includes('input-otp') || id.includes('sonner') ||
              id.includes('next-themes')) {
              return 'unused-vendor'; // These won't be loaded if not used
            }
            // Other vendors
            return 'vendor';
          }
        },
        // Optimize chunk names for better caching
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          // Use shorter hashes for better caching
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(assetInfo.name || '')) {
            return `assets/images/[name]-[hash:8].[ext]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
            return `assets/fonts/[name]-[hash:8].[ext]`;
          }
          return `assets/[name]-[hash:8].[ext]`;
        },
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
  // Optimize dependencies - only pre-bundle what's needed
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'recharts', 'lodash'],
    exclude: [
      '@tanstack/react-query',
      'date-fns',
      'react-hook-form',
      'react-day-picker',
      'embla-carousel-react',
      'cmdk',
      'vaul',
      'input-otp',
      'sonner',
      'next-themes'
    ],
    esbuildOptions: {
      target: 'es2020',
      // Tree shake more aggressively
      treeShaking: true,
    },
  },
  // Improve build performance and tree shaking
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    // Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  // Define build timestamp for cache busting
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
