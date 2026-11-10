// The k-paths the app computes (matsci-parse's getExplicitKPath, with the
// app's options) against Python seekpath's, on one structure per space group
// and the app's examples, with and without time reversal. Python seekpath
// runs first, on the structures it makes (reference/seekpath_reference.py,
// in its uv environment).

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fromJSON, getExplicitKPath } from "matsci-parse";

const reference = JSON.parse(
  execFileSync("uv", ["run", "--quiet", "python", "seekpath_reference.py"], {
    cwd: fileURLToPath(new URL("./reference", import.meta.url)),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "inherit"],
  }),
);

const TOLERANCE = 1e-6; // coordinates and cells (Å, 1/Å, reciprocal crystal)

/** Largest difference between two numbers or nested arrays of numbers. */
function maxDiff(a, b) {
  if (typeof a === "number") return Math.abs(a - b);
  expect(a.length).toBe(b.length);
  return Math.max(0, ...Array.from(a, (x, i) => maxDiff(x, b[i])));
}

const cases = reference.entries.flatMap(({ name, structure, reference }) =>
  [true, false].map((withTimeReversal) => ({
    name: `${name}, ${withTimeReversal ? "with" : "without"} time reversal`,
    structure,
    withTimeReversal,
    expected: reference[String(withTimeReversal)],
  })),
);

describe(`getExplicitKPath vs Python seekpath ${reference.meta.seekpath}`, () => {
  it.each(cases)("$name", async ({ structure, withTimeReversal, expected }) => {
    const r = await getExplicitKPath(fromJSON(structure), {
      withTimeReversal,
      referenceDistance: reference.meta.reference_distance,
    });

    expect(r.spacegroup_number).toBe(expected.spacegroup_number);
    // moyo writes the symbol with spaces ("P 6_3/m m c")
    expect(r.spacegroup_international.replaceAll(" ", "")).toBe(
      expected.spacegroup_international.replaceAll(" ", ""),
    );
    expect(r.has_inversion_symmetry).toBe(expected.has_inversion_symmetry);
    // Near a boundary between Bravais variants seekpath warns (several
    // answers are valid): only the symmetry is compared there
    if (expected.edge_case_warnings.length > 0) return;

    expect(r.bravais_lattice).toBe(expected.bravais_lattice);
    expect(r.bravais_lattice_extended).toBe(expected.bravais_lattice_extended);
    expect(r.augmented_path).toBe(expected.augmented_path);
    expect(r.path).toEqual(expected.path);

    expect(Object.keys(r.point_coords).sort()).toEqual(
      Object.keys(expected.point_coords).sort(),
    );
    for (const [label, coords] of Object.entries(expected.point_coords)) {
      expect(maxDiff(r.point_coords[label], coords), label).toBeLessThan(
        TOLERANCE,
      );
    }

    expect(
      maxDiff(r.primitive_lattice, expected.primitive_lattice),
    ).toBeLessThan(TOLERANCE);
    expect(
      maxDiff(
        r.reciprocal_primitive_lattice,
        expected.reciprocal_primitive_lattice,
      ),
    ).toBeLessThan(TOLERANCE);
    expect(r.volume_original_wrt_prim).toBeCloseTo(
      expected.volume_original_wrt_prim,
      6,
    );
    // The atoms themselves are not compared: moyo may order them, or pick the
    // origin, differently (an equivalent primitive cell)
    expect(r.primitive_types.length).toBe(expected.primitive_natoms);

    expect(r.explicit_kpoints_rel.length).toBe(expected.explicit_kpoints_count);
    expect(r.explicit_kpoints_labels.filter(Boolean)).toEqual(
      expected.explicit_kpoints_labels,
    );
  });
});
