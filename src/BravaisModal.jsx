// Explanation of the extended Bravais symbol, in a modal opened by the
// #bravais hash (links: href={BRAVAIS_HASH}).

import { HashModal } from "mc-react-library";

export const BRAVAIS_HASH = "#bravais";

const FAMILIES = [
  ["c", "cubic"],
  ["h", "hexagonal"],
  ["t", "tetragonal"],
  ["o", "orthorhombic"],
  ["m", "monoclinic"],
  ["a", "triclinic"],
];

const CENTERINGS = [
  ["P", "primitive"],
  ["F", "face-centered"],
  ["I", "body-centered"],
  ["A", "base-centered (A face)"],
  ["C", "base-centered (C face)"],
  ["R", "rhombohedrally-centered"],
];

function SymbolList({ items }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 pl-4">
      {items.map(([symbol, meaning]) => (
        <div key={symbol} className="contents">
          <dt className="font-mono">{symbol}:</dt>
          <dd>{meaning}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function BravaisModal() {
  return (
    <HashModal
      hash={BRAVAIS_HASH.slice(1)}
      title="An explanation of extended Bravais symbols"
      maxWidth="80rem"
      classes={{ body: "!max-h-[80vh]" }}
    >
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          In the input example selector of this web-app and as well as in the
          output of SeeK-path, you will find a short string called the{" "}
          <strong>extended Bravais symbol</strong> (e.g.{" "}
          <span className="font-mono">cP1</span>,{" "}
          <span className="font-mono">tI2</span>). This symbol identifies the
          crystal lattice type and its symmetry for your input structure.
        </p>
        <p>An explanation of these symbols is given below:</p>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">
            First two characters: the Bravais lattice
          </h3>
          <p>
            The first letter denotes the <strong>crystal family</strong> and can
            have the following values:
          </p>
          <SymbolList items={FAMILIES} />
          <p>
            The second letter describes the centering of the lattice (after
            standardization):
          </p>
          <SymbolList items={CENTERINGS} />
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Third character:</h3>
          <p>
            For a given crystal family and centering, many cases may must be
            considered. These are indexed by an integer (1, 2 or 3). This symbol
            can depend on the spacegroup of the crystal, and/or the values of
            hte lattice parameters (a, b, c, α, β, γ). The algorithm to
            establish this index is explained in Table 94 in the SeeK-path
            publication.
          </p>
          <p>In particular, the following cases need distinction:</p>
          <ul className="list-disc space-y-1 pl-8">
            <li>
              Depending on the space group needs additional lines may be needed,
              e.g. cP (cubic primitive);
            </li>
            <li>
              The topology of the Brillouin zone, (and therefore the coordinates
              of the corners of the Brillioun zone), depends on the ratios of
              the lattice parameters, e.g. tI (tetragonal body-centered), where
              it differs for a &gt; c and a &lt; c.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Inversion symmetry</h3>
          <p>
            For systems that do not have inversion symmetry, the band energies
            typically differ at k and -k if the Hamiltonian does not have
            time-reversal symmetry. In this case, an additional set of lines is
            taken by inverting the path about the origin (Γ point). This is the
            reason why we provide examples both for systems with and without
            inversion symmetry. In the python code, you should specify if your
            Hamiltonian has time-reversal symmetry as an input flag to the
            SeeK-path functions.
          </p>
        </section>
      </div>
    </HashModal>
  );
}
