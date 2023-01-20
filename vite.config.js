import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import sentryVitePlugin from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const config = {
    plugins: [
      react(),
    ],
  };

  if (process.env.NODE_ENV !== "development") {
    config["build"] = {
      sourcemap: true
    }
    config.plugins.push(sentryVitePlugin({
      org: "caosen",
      project: "genshin-artifact-builds",

      // Specify the directory containing build artifacts
      include: "./dist",

      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and needs the `project:releases` and `org:read` scopes
      authToken: process.env.SENTRY_AUTH_TOKEN,

      // Optionally uncomment the line below to override automatic release name detection
      // release: process.env.RELEASE,
    }));
  }
  return defineConfig(config);
}
