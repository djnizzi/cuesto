import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Load .env file if it exists (for local development)
// In CI, environment variables are already set in process.env
dotenv.config()

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Also fall back to process.env for CI environments where secrets are passed as env vars
  const env = loadEnv(mode, process.cwd(), '')
  const consumerKey = env.DISCOGS_CONSUMER_KEY || process.env.DISCOGS_CONSUMER_KEY || ''
  const consumerSecret = env.DISCOGS_CONSUMER_SECRET || process.env.DISCOGS_CONSUMER_SECRET || ''
  
  // Debug logging for CI troubleshooting
  console.log('[vite.config] Building with credentials:')
  console.log('[vite.config] Consumer Key (first 5 chars):', consumerKey ? consumerKey.substring(0, 5) + '...' : 'EMPTY')
  console.log('[vite.config] Consumer Secret (first 5 chars):', consumerSecret ? consumerSecret.substring(0, 5) + '...' : 'EMPTY')
  console.log('[vite.config] loadEnv result:', env.DISCOGS_CONSUMER_KEY ? 'found' : 'not found')
  console.log('[vite.config] process.env result:', process.env.DISCOGS_CONSUMER_KEY ? 'found' : 'not found')
  
  return {
    base: './',
    plugins: [
      react(),
      electron({
        main: {
          // Shortcut of `build.lib.entry`.
          entry: 'electron/main.ts',
          vite: {
            define: {
              // Embed environment variables at build time for Electron main process
              'process.env.DISCOGS_CONSUMER_KEY': JSON.stringify(consumerKey),
              'process.env.DISCOGS_CONSUMER_SECRET': JSON.stringify(consumerSecret),
            },
            build: {
              rollupOptions: {
                external: ['musicbrainz-api', 'ffmpeg-static'],
                output: {
                  format: 'es'
                }
              }
            }
          }
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: path.join(__dirname, 'electron/preload.ts'),
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: process.env.NODE_ENV === 'test'
          ? undefined
          : {},
      }),
    ],
  }
})