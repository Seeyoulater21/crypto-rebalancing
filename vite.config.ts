import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/crypto-rebalancing/' : '/', // Conditional base path
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'copy-price-data',
      // Copy the price data file to the dist folder during build
      writeBundle() {
        if (fs.existsSync('price_data_with_thb.json')) {
          if (!fs.existsSync('dist')) {
            fs.mkdirSync('dist', { recursive: true });
          }
          fs.copyFileSync('price_data_with_thb.json', 'dist/price_data_with_thb.json');
          console.log('✅ price_data_with_thb.json copied to dist folder');
        } else {
          console.error('❌ price_data_with_thb.json not found in root directory');
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
