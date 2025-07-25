import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    !process.env.VITEST && remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
      ignoredRouteFiles: ["**/.*", "**/*.test.tsx", "**/*.test.ts", "**/*.spec.tsx", "**/*.spec.ts"],
    }),
    tsconfigPaths(),
  ].filter(Boolean),
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
});
