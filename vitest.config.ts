import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // `import "server-only"` is a runtime hint for Next.js to block client
    // bundling. Under vitest (Node), there's no client boundary, so we stub
    // it out to keep DB-glue files (src/lib/events.ts, src/lib/account.ts,
    // src/lib/tournament-live.ts) testable.
    server: {
      deps: {
        inline: ["server-only"],
      },
    },
    alias: {
      "server-only": new URL("./src/test/server-only-stub.ts", import.meta.url).pathname,
    },
  },
});
