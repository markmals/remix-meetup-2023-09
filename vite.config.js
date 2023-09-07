import { defineConfig } from "vite"

export default defineConfig({
    build: {
        rollupOptions: {
            external: /^.*\.(mov|gif|png|svg|jpg)$/
        }
    }
})
