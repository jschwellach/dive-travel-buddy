/**
 * @license MIT
 * @author Janos Schwellach <jschwellach@gmail.com>
 * @copyright Copyright (c) 2024 Janos Schwellach
 *
 * This file is part of the diving recommendation engine that provides
 * personalized dive site suggestions based on user preferences.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
});
