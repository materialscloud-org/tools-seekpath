import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    // matsci-parse is inlined so that its moyo loader can be pointed at the
    // real Node built-ins (tests/node-builtins.js)
    server: { deps: { inline: [/matsci-parse/] } },
    alias: [
      {
        find: /^\.\/__vite-browser-external-.*\.js$/,
        replacement: fileURLToPath(new URL("./tests/node-builtins.js", import.meta.url)),
      },
    ],
  },
});
