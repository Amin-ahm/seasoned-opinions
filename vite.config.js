import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site from https://<user>.github.io/<REPO_NAME>/
// so the app must be built with a matching base path. Change this if you
// rename the repo. For a <user>.github.io root repo, set base to '/'.
const REPO_NAME = 'seasoned-opinions'

// https://vitejs.dev/config/
export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [react()],
  build: {
    // Three.js is large; split it into its own chunk so the core app
    // (list, detail, voting) loads fast and 3D is fetched lazily.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
})
