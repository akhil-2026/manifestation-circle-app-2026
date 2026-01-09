import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    // Ensure environment variables are available
    define: {
      __SUPER_ADMIN_EMAIL__: JSON.stringify(env.VITE_SUPER_ADMIN_EMAIL),
    },
    // Make sure all VITE_ prefixed env vars are exposed
    envPrefix: ['VITE_'],
  }
})