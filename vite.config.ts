import { defineConfig, loadEnv } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    resolve: { tsconfigPaths: true },
    plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
    server: {
      proxy: {
        "/api": env.BACKEND_URL || "http://localhost:8000",
      },
    },
  }
})

export default config
