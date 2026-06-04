/* eslint-disable no-undef */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      proxy: {
        "/api": {
          // In Docker, use 'backend' service name; locally use 'localhost'
          target:
            env.DOCKER_ENV === "true"
              ? "http://backend:5000"
              : "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log("Sending Request to the Target:", req.method, req.url);
            });
            proxy.on("proxyRes", (proxyRes, req) => {
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url,
              );
            });
          },
        },
      },
    },
    preview: {
      port: 3000,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
