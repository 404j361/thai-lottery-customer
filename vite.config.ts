import { defineConfig, loadEnv } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    resolve: { tsconfigPaths: true },
    // nitro() is required for Vercel (and other hosts) — without it, production often 404s.
    plugins: [devtools(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
    server: {
      proxy: {
        "/api": env.BACKEND_URL || "http://localhost:8000",
      },
    },
  }
})

export default config
