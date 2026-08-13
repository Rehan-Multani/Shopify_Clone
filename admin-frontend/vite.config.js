import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({ jsxRuntime: 'automatic' })
  ],
  server: {
    port: 5174,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep builder/theme-admin tools out of the default public path when dynamically imported
          if (id.includes('website-builder') || id.includes('ThemesTab') || id.includes('ThemePreviewPage')) {
            return 'theme-builder';
          }
          if (id.includes('/pages/Dashboard') || id.includes('\\pages\\Dashboard')) {
            return 'merchant-dashboard';
          }
          if (id.includes('node_modules/@dnd-kit')) {
            return 'theme-builder-dnd';
          }
          return undefined;
        },
      },
    },
  },
})
