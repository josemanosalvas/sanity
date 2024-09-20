import {defineConfig} from '@repo/test-config/vitest'
import react from '@vitejs/plugin-react'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globalSetup: ['./test/setup/global.ts'],
    setupFiles: ['./test/setup/environment.ts'],
    exclude: [
      './playwright-ct',
      './src/_internal/cli', // the CLI has its own jest config
    ],
  },
  plugins: [react()],
})
