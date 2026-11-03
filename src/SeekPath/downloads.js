// The k-path of a structure as the app computes it, and its downloads
// (VASP KPOINTS, line mode and for hybrids/GW, Quantum ESPRESSO pw.x input,
// CRYSTAL D3 BAND, raw JSON). Plain
// JavaScript, outside the component: test-suite runs it on MC3D and compares
// the files with those of the legacy tools-seekpath app.

import {
  cartesian,
  getBrillouinZoneData,
  getExplicitKPath,
  primitiveStructure,
  toCrystalD3,
  toKPOINTS,
  toPW,
} from "matsci-parse";

/**
 * seekpath on `structure` with `options` ({ withTimeReversal,
 * referenceDistance }): `data`, the Brillouin zone and k-path
 * (getBrillouinZoneData), and `primitive`, seekpath's primitive cell as a
 * Structure (which getBrillouinZoneData drops).
 */
export async function computeKPath(structure, options) {
  const [data, path] = await Promise.all([
    getBrillouinZoneData(structure, options),
    getExplicitKPath(structure, options),
  ]);
  return { data, primitive: primitiveStructure(path, structure) };
}

/** The downloads of a computed k-path, with `pointsPerLine` per segment. */
export function downloads({ data, primitive }, pointsPerLine) {
  return {
    kpoints: toKPOINTS(data.kpath, pointsPerLine),
    kpointsHybrid: vaspHybridKPOINTS(data.explicit_kpoints_rel),
    // The k-points are in the reciprocal crystal coordinates of seekpath's
    // primitive cell, so the input is that cell
    pw: toPW(primitive, {
      control: { calculation: "bands" },
      kpoints: { ...data.kpath, density: pointsPerLine },
    }),
    crystalD3: toCrystalD3(data.kpath, "SeeK-path band path", pointsPerLine),
    json: JSON.stringify(rawData({ data, primitive }), null, 2),
  };
}

const fmt = (x) => x.toFixed(10).padStart(16);

/**
 * The legacy app's KPOINTS for hybrids and GW: the k-points of the
 * self-consistent run (IBZKPT, pasted by the user) followed by the explicit
 * path with zero weight.
 */
function vaspHybridKPOINTS(explicitPoints) {
  const kpointsLength = explicitPoints.length;

  // set all points to zero Weight
  const zeroWeightKpoints = explicitPoints.map(
    (k) => `${k.map(fmt).join(" ")} 0`,
  );

  return [
    "Explicit k-points list for band structure",
    `<...>  !Total number of k-points = ${kpointsLength} + No. of k-points from IBZKPT file`,
    "reciprocal",
    "<...Copy the kpoints coordinates block from IBZKPT here...>",
    "",
    "",
    ...zeroWeightKpoints,
  ].join("\n");
}

/**
 * The legacy app's "Raw data (JSON)": the reciprocal vectors, the k-points
 * (absolute and relative) and the path, with seekpath's primitive cell.
 */
function rawData({ data, primitive }) {
  const basis = primitive.lattice.basis.data;
  return {
    b1: data.b1,
    b2: data.b2,
    b3: data.b3,
    kpoints: data.kpoints,
    kpoints_rel: data.kpoints_rel,
    path: data.path,
    primitive_lattice: [0, 1, 2].map((i) =>
      Array.from(basis.slice(3 * i, 3 * i + 3)),
    ),
    primitive_positions: primitive.sites.map((site) => [...site.frac]),
    primitive_positions_cartesian: primitive.sites.map((site) => [
      ...cartesian(primitive.lattice, site),
    ]),
    primitive_symbols: primitive.sites.map((site) => site.species.symbol),
  };
}
