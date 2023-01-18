import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sentryVitePlugin from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    // Put the Sentry vite plugin after all other plugins
    sentryVitePlugin({
      org: "caosen",
      project: "genshin-artifact-builds",

      // Specify the directory containing build artifacts
      include: "./dist",

      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and needs the `project:releases` and `org:read` scopes
      authToken: process.env.SENTRY_AUTH_TOKEN,

      // Optionally uncomment the line below to override automatic release name detection
      // release: process.env.RELEASE,
    }),
  ],
});
