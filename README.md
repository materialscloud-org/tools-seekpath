# SeeK-path web

Materials Cloud tool that finds the high-symmetry k-path of a crystal
structure and shows it in the Brillouin zone, using
[matsci-parse](https://www.npmjs.com/package/matsci-parse) in the browser.

## Development

```sh
pnpm install
pnpm dev     # http://localhost:5173
pnpm build   # static site in dist/
pnpm lint
pnpm test    # k-paths vs Python seekpath (tests/)
```

## Tests

`tests/seekpath.test.js` compares the k-paths the app computes (matsci-parse's
`getExplicitKPath`, with the app's options) with those of Python seekpath, on
one structure per space group (1-230) and the app's examples (one per
extended Bravais lattice), with and without time reversal: space group,
Bravais lattice, path, high-symmetry points, primitive and reciprocal cells,
and the explicit k-points (labels and count).

Python seekpath runs at the start of the test, on the structures it makes
(`tests/reference/seekpath_reference.py`), so `pnpm test` needs
[uv](https://docs.astral.sh/uv/); the first run installs its environment
(the seekpath version is pinned in `tests/reference/pyproject.toml`).
