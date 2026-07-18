import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split the animation libraries out of the app chunk. This does not
        // shrink the total payload -- it lets the browser fetch them in
        // parallel and keep them cached across deploys that only touch scene
        // code. Cutting actual bytes needs scene-level lazy loading.
        manualChunks: {
          react: ["react", "react-dom"],
          gsap: ["gsap"],
          motion: ["framer-motion"],
        },
      },
    },
  },
})
