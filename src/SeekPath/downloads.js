// The k-path of a structure as the app computes it, and its downloads
// (VASP KPOINTS, Quantum ESPRESSO pw.x input, CRYSTAL D3 BAND). Plain
// JavaScript, outside the component: test-suite runs it on MC3D and compares
// the files with those of the legacy tools-seekpath app.

import {
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
    // The k-points are in the reciprocal crystal coordinates of seekpath's
    // primitive cell, so the input is that cell
    pw: toPW(primitive, {
      control: { calculation: "bands" },
      kpoints: { ...data.kpath, density: pointsPerLine },
    }),
    crystalD3: toCrystalD3(data.kpath, "SeeK-path band path", pointsPerLine),
  };
}
