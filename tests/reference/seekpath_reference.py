"""The reference of seekpath-web's tests: the k-paths of the Python seekpath
package (the implementation matsci-parse's getExplicitKPath follows), with
the app's options, on

- one structure per space group (1-230): two atoms of different elements on
  the general position (random, seeded by the space-group number) of a cell
  with generic parameters for its crystal system, so that the structure has
  exactly that space group (one element alone would add symmetry: one atom,
  or a pair, is its own inversion centre);
- the app's examples (public/examples), one per extended Bravais lattice
  (the variants depend on cell ratios a single cell per group cannot cover).

each with and without time reversal. Prints them, with the structures, as
JSON; tests/seekpath.test.js runs it (uv run python seekpath_reference.py).
"""

import json
import sys
import warnings
from importlib.metadata import version
from pathlib import Path

import numpy as np
import seekpath
from pymatgen.core import Lattice, Structure
from pymatgen.io.vasp import Poscar
from seekpath.hpkot import EdgeCaseWarning

HERE = Path(__file__).parent
EXAMPLES = HERE.parents[1] / "public" / "examples"
REFERENCE_DISTANCE = 0.025  # the app's default


def generic_lattice(number):
    """A cell of the crystal system of space group `number` (its standard
    setting), with no accidental higher symmetry."""
    if number <= 2:
        return Lattice.from_parameters(4.1, 5.3, 6.7, 78, 83, 71)
    if number <= 15:
        return Lattice.from_parameters(4.1, 5.3, 6.7, 90, 103, 90)
    if number <= 74:
        return Lattice.orthorhombic(4.1, 5.3, 6.7)
    if number <= 142:
        return Lattice.tetragonal(4.1, 6.7)
    if number <= 194:
        return Lattice.hexagonal(4.1, 6.7)
    return Lattice.cubic(5.3)


def space_group_structure(number):
    rng = np.random.default_rng(number)
    positions = rng.uniform(0.05, 0.95, (2, 3))
    return Structure.from_spacegroup(number, generic_lattice(number), ["C", "N"], positions)


def as_json(structure):
    """The structure as matsci-parse's fromJSON reads it."""
    return {
        "lattice": [round(x, 12) for x in structure.lattice.matrix.flatten()],
        "sites": [
            {
                "species": {"symbol": site.specie.symbol},
                "frac": [round(x, 12) for x in site.frac_coords],
            }
            for site in structure
        ],
    }


def rounded(value):
    if isinstance(value, float):
        return round(value, 10)
    if isinstance(value, dict):
        return {k: rounded(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, np.ndarray)):
        return [rounded(v) for v in value]
    if isinstance(value, np.generic):
        return rounded(value.item())
    return value


def reference(structure, with_time_reversal):
    cell = (structure.lattice.matrix, structure.frac_coords, [site.specie.Z for site in structure])
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always", EdgeCaseWarning)
        r = seekpath.get_explicit_k_path(
            cell, with_time_reversal=with_time_reversal, reference_distance=REFERENCE_DISTANCE
        )
    return rounded(
        {
            "spacegroup_number": r["spacegroup_number"],
            "spacegroup_international": r["spacegroup_international"],
            "bravais_lattice": r["bravais_lattice"],
            "bravais_lattice_extended": r["bravais_lattice_extended"],
            "has_inversion_symmetry": r["has_inversion_symmetry"],
            "augmented_path": r["augmented_path"],
            "path": r["path"],
            "point_coords": r["point_coords"],
            "primitive_lattice": r["primitive_lattice"],
            "reciprocal_primitive_lattice": r["reciprocal_primitive_lattice"],
            "volume_original_wrt_prim": r["volume_original_wrt_prim"],
            "primitive_natoms": len(r["primitive_types"]),
            "explicit_kpoints_count": len(r["explicit_kpoints_rel"]),
            "explicit_kpoints_labels": [label for label in r["explicit_kpoints_labels"] if label],
            "edge_case_warnings": [
                str(w.message) for w in caught if issubclass(w.category, EdgeCaseWarning)
            ],
        }
    )


def entry(name, structure):
    return {
        "name": name,
        "structure": as_json(structure),
        "reference": {str(tr).lower(): reference(structure, tr) for tr in (True, False)},
    }


def main():
    entries = []
    for number in range(1, 231):
        e = entry(f"space group {number}", space_group_structure(number))
        found = e["reference"]["true"]["spacegroup_number"]
        if found != number:
            raise SystemExit(f"space group {number}: the structure has space group {found}")
        entries.append(e)
    for poscar in sorted(EXAMPLES.glob("*/POSCAR")):
        entries.append(entry(f"example {poscar.parent.name}", Poscar.from_file(poscar).structure))

    meta = {
        "seekpath": version("seekpath"),
        "spglib": version("spglib"),
        "reference_distance": REFERENCE_DISTANCE,
    }
    json.dump({"meta": meta, "entries": entries}, sys.stdout, separators=(",", ":"))


if __name__ == "__main__":
    main()
