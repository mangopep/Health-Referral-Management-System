import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true, // We will use globals like describe, it, expect
        setupFiles: ["./src/tests/setup.ts"],
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
