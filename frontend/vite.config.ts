import { defineConfig } from "vite";
//import react from "@vitejs/plugin-react-swc";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  appType: "spa",
  build: {
    //sourcemap: true,
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "src") + "/",
      "@": path.resolve(__dirname, "src"),
    },
  },
});
