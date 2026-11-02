import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  // Expose .env / .env.local to server code in dev. Variables already set in the environment win,
  // so a run can be pointed at a local database without editing .env.local.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [k, v] of Object.entries(env)) process.env[k] ??= v;

  return {
    server: { port: 3000 },
    plugins: [
      tsconfigPaths({ projects: ["./tsconfig.json"] }),
      tailwindcss(),
      tanstackStart(),
      nitro({
        routeRules: {
          "/icon.svg": { headers: { "cache-control": "public, max-age=604800" } },
        },
      }),
      // React's plugin must come after Start's.
      viteReact(),
    ],
  };
});
