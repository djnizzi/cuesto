import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
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
              'process.env.DISCOGS_CONSUMER_KEY': JSON.stringify(env.DISCOGS_CONSUMER_KEY || ''),
              'process.env.DISCOGS_CONSUMER_SECRET': JSON.stringify(env.DISCOGS_CONSUMER_SECRET || ''),
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