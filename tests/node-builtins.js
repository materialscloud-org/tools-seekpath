// matsci-parse's build replaces the Node built-ins of its moyo (WASM) loader
// with Vite's browser stub, so symmetry analysis fails under Node; the vitest
// config aliases that stub back to the real modules (as test-suite does).
import fs from "node:fs";
import { createRequire } from "node:module";

export default { ...fs, createRequire };
