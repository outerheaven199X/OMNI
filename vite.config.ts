import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
    open: true,
            proxy: {
              // /api/gdelt?query=... → https://api.gdeltproject.org/api/v2/doc/doc?query=...
              "/api/gdelt": {
                target: "https://api.gdeltproject.org",
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api\/gdelt/, "/api/v2/doc/doc"),
              },
              // /api/nhc → https://www.nhc.noaa.gov/CurrentStorms.json
              "/api/nhc": {
                target: "https://www.nhc.noaa.gov",
                changeOrigin: true,
                rewrite: () => "/CurrentStorms.json",
              },
              // /api/7timer → http://www.7timer.info
              "/api/7timer": {
                target: "http://www.7timer.info",
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api\/7timer/, ""),
              },
              // /api/openaq → https://api.openaq.org
              "/api/openaq": {
                target: "https://api.openaq.org",
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api\/openaq/, ""),
              },
              // /api/usgs → https://earthquake.usgs.gov
              "/api/usgs": {
                target: "https://earthquake.usgs.gov",
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api\/usgs/, ""),
              },
            },
  },
})
