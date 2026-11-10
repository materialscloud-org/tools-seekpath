// Content of the information accordions of the landing page.

import { useState } from "react";
import { DoiBadge, McInfoAccordion } from "mc-react-library";

import { BRAVAIS_HASH } from "./BravaisModal";

/** "What SeeK-path does" accordion. */
function WhatSeekPathDoesContent() {
  return (
    <>
      <div>
        <p>
          This tool takes in <strong>input a crystal structure</strong> (in a
          number of different formats), and
        </p>
        <ul className="list-disc pl-10">
          <li>
            finds its <strong>spacegroup</strong>;
          </li>
          <li>
            computes the <strong>crystallographic primitive cell</strong> (i.e.,
            always oriented according to crystallographic standard definitions);
          </li>
          <li>
            computes the <strong>Brillouin zone</strong>;
          </li>
          <li>
            provides <strong>interactive visualization</strong> of primitive
            cell and Brillouin zone;
          </li>
          <li>
            computes all <strong>high-symmetry k-points coordinates</strong>;
          </li>
          <li>
            for band structure plotting, provides a{" "}
            <strong>complete list of high-symmetry paths</strong> in the
            Brillouin zone going between the high-symmetry k-points;
          </li>
          <li>
            provides <strong>copy-paste content</strong> to input the kpoints in
            an external code or input file.
          </li>
        </ul>
        <p className="italic pt-4 text-center">
          Alternatively, you can calculate and visualize an example. (There is
          one example for each possible{" "}
          <a href={BRAVAIS_HASH} className="text-blue-600 hover:underline">
            extended Bravais symbol
          </a>
          , both for systems with and without inversion symmetry.)
        </p>
      </div>
    </>
  );
}

/** "SeeK-path definitions and advantages" accordion. */
function DefinitionsContent() {
  return (
    <>
      <p>
        This tool follows the definitions of the HPKOT paper{" "}
        <span className="inline-block align-middle">
          <DoiBadge
            doi="10.1016/j.commatsci.2016.10.015"
            label="Comp. Mat. Sci"
            color="#a2e5b7"
          />
        </span>
      </p>
      <p className="py-2">The main advantages of this work are:</p>
      <ul className="list-disc pl-10">
        <li>
          <strong>
            use of the <em>crystallographic</em> cells
          </strong>
          : The conventional cell is standardized according to the definitions
          that are standard in the field in crystallography: the{" "}
          <em>International Tables of Crystallography</em> (the Tables, from
          here on), and <em>Parthé, Gelato, Acta Cryst. A40, 169 (1984)</em>.
          Just a couple of examples:
          <ul className="list-[circle] pl-10">
            <li>
              orientation of the axes follows the standards mentioned above,
              e.g., monoclinic cells are always <em>b</em>-axis unique.
            </li>
            <li>
              order of axes is imposed only when not already imposed by
              symmetry, (following the prescriptions of Parthé and Gelato).
              E.g., for spacegroup Pmm2 (orthorhombic), the third axis is fixed
              by symmetry (the one with 180° rotation but no mirror plane).
              Therefore, we only impose <em>a&lt;b</em>, with no ordering
              imposed on <em>c</em>.
            </li>
          </ul>
        </li>
        <li>
          <strong>Unambiguous high-symmetry k-point labels</strong>. For
          rational k-points, we use the same labels as the ones defined in the
          Tables. For irrational k-points (not defined in the Tables), letters
          are chosen so as to never collide with existing letters in the Tables.
        </li>
        <li>
          <strong>
            Complete set of high-symmetry paths (band lines), using also
            spacegroup symmetry when needed
          </strong>
          . For instance, spacegroup Pm-3 (cubic primitive, extended Bravais
          lattice cP1) does not have 90° rotation symmetries, so both the lines
          M–X and M–X<sub>1</sub> must be considered.
        </li>
      </ul>
      <p></p>
    </>
  );
}

/** "How to cite" accordion. */
function HowToCiteContent() {
  return (
    <>
      <p>If you use this tool, please cite the following work:</p>
      <ul className="list-disc pl-10 space-y-2 pt-2">
        <li>
          Y. Hinuma, G. Pizzi, Y. Kumagai, F. Oba, I. Tanaka, Band structure
          diagram paths based on crystallography.{" "}
          <span className="inline-block align-middle">
            <DoiBadge
              doi="10.1016/j.commatsci.2016.10.015"
              label="Comp. Mat. Sci"
              color="#a2e5b7"
            />
          </span>{" "}
          and the "HPKOT" paper; arXiv version:{" "}
          <span className="inline-block align-middle">
            <DoiBadge
              doi="10.48550/arXiv.1602.06402"
              label="ArXiv"
              color="#a2e5b7"
            />
          </span>
        </li>
        <li>
          You should also cite Spglib that is an essential library used in the
          implementation: A. Togo, I. Tanaka, "Spglib: a software library for
          crystal symmetry search", arXiv:1808.01590 (2018){" "}
          <span className="inline-block align-middle">
            <DoiBadge
              doi="10.48550/arXiv.1808.01590"
              label="ArXiv"
              color="#a2e5b7"
            />
          </span>
        </li>
      </ul>
    </>
  );
}

const ACCORDIONS = [
  { title: "What SeeK-path does", content: <WhatSeekPathDoesContent /> },
  {
    title: "SeeK-path definitions and advantages",
    content: <DefinitionsContent />,
  },
  { title: "How to cite", content: <HowToCiteContent /> },
];

/** The information accordions at the top of the page, one open at a time. */
export default function InfoAccordions() {
  const [open, setOpen] = useState(null);
  return ACCORDIONS.map(({ title, content }, i) => (
    <McInfoAccordion
      key={title}
      title={title}
      open={open === i}
      onToggle={() => setOpen(open === i ? null : i)}
    >
      {content}
    </McInfoAccordion>
  ));
}
