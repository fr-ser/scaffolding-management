import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

// <https://vitejs.dev/config/>
export default defineConfig((env) => {
  const envVariables = loadEnv(env.mode, "./");

  const serverURL = new URL(envVariables.VITE_SERVER_URL ?? "<http://localhost:3001>");
  const serverAPIPath = envVariables.VITE_SERVER_API_PATH ?? "/api";

  return {
    envDir: "./",
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    server: {
      port: 5173,
      proxy: {
        // proxy requests with the API path to the server
        [serverAPIPath]: serverURL.origin,
      },
    },
  };
});
