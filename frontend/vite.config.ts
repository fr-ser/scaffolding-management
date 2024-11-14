import vue from "@vitejs/plugin-vue";
import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// <https://vitejs.dev/config/>
export default defineConfig(() => {
  return {
    envDir: "../",
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
        ["/api"]: new URL("http://localhost:3001").origin,
      },
    },
  };
});
