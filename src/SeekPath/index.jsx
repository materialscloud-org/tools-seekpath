import { useCallback, useEffect, useRef, useState } from "react";
import { createBZVisualizer } from "brillouinzone-visualizer";
import StructureVisualizer from "mc-react-structure-visualizer";
import { CRYSTAL_MAX_BAND_LINES, cartesian } from "matsci-parse";

import { formatPath, formatSpaceGroupSymbol, prettify } from "../formatting";

import {
  McCopyAccordion,
  McInfoAccordion,
  McloudSpinner,
  McResults,
} from "mc-react-library";

import { BRAVAIS_HASH } from "../BravaisModal";
import CoordinatesTable from "./CoordinatesTable";
import { computeKPath, downloads } from "./downloads";

const DEFAULT_REFERENCE_DISTANCE = 0.025;
const MIN_POINTS_PER_LINE = 2;
const MAX_POINTS_PER_LINE = 100;
const DEFAULT_POINTS_PER_LINE = 40;

// Title laid over the top-left corner of a viewer; clicks pass through.
function ViewerTitle({ children }) {
  return (
    <div className="pointer-events-none absolute left-1 top-1 z-10  bg-white/80 px-2 py-1 text-xs font-semibold ">
      {children}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <>
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-slate-800">{children}</dd>
    </>
  );
}

export default function SeekPath({ structure, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [primitive, setPrimitive] = useState(null);
  const [withTimeReversal, setWithTimeReversal] = useState(true);
  const [referenceDistance] = useState(DEFAULT_REFERENCE_DISTANCE);
  const [pointsPerLine, setPointsPerLine] = useState(DEFAULT_POINTS_PER_LINE);
  const [outputsOpen, setOutputsOpen] = useState(null); // useState("vasp") // to open vasp on load
  // Closed at first; opened or closed, it stays so for the next structures
  const [infoOpen, setInfoOpen] = useState(false);

  const containerRef = useRef(null);

  const compute = useCallback(
    async (wtr, refDist) => {
      if (!structure) return;
      setLoading(true);
      setError(null);
      setData(null);
      setPrimitive(null);
      try {
        const opts = { withTimeReversal: wtr, referenceDistance: refDist };
        const { data, primitive } = await computeKPath(structure, opts);
        setData(data);
        setPrimitive(primitive);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [structure],
  );

  useEffect(() => {
    if (!structure) {
      setData(null);
      setError(null);
      return;
    }
    compute(withTimeReversal, referenceDistance);
  }, [structure, compute]);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    const container = containerRef.current;
    const viz = createBZVisualizer(container, data, {
      showPathpoints: false,
      disableInteractOverlay: true,
    });

    return () => {
      window.removeEventListener("resize", viz.resizeRenderer);
      if (container) container.innerHTML = "";
    };
  }, [data]);

  const handleToggleTimeReversal = (e) => {
    const wtr = e.target.checked;
    setWithTimeReversal(wtr);
    compute(wtr, referenceDistance);
  };

  if (!structure) {
    return <></>;
  }

  const pathSummary = data ? formatPath(data.path) : "";

  const files =
    data && primitive ? downloads({ data, primitive }, pointsPerLine) : null;
  const vaspKpointsText = files?.kpoints ?? "";
  const vaspHybridText = files?.kpointsHybrid ?? "";
  const crystalD3Text = files?.crystalD3 ?? "";
  const pwInputText = files?.pw ?? "";
  const jsonText = files?.json ?? "";

  return (
    <div className={`space-y-3 px-2 sm:px-4 ${className}`}>
      {/* loading and error states here (above the results: while loading,
          the space of the previous results is kept) */}
      {loading && (
        <div className="flex h-40 items-center justify-center gap-2 text-sm text-slate-500">
          <McloudSpinner className="w-8 shrink-0" />
          Computing high-symmetry k-path…
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center rounded-lg bg-red-50 px-3 py-6 text-sm text-red-600">
          Failed to compute the Brillouin zone: {error}
        </div>
      )}

      <McResults busy={loading} resultKey={data} className="space-y-3">
        {data && primitive && (
          <>
            <h2 className="text-lg font-semibold text-slate-900">Results</h2>
            <McInfoAccordion
              title="Structure information (primitive cell)"
              open={infoOpen}
              onToggle={() => setInfoOpen(!infoOpen)}
            >
              <div className="space-y-4 text-sm">
                {/* The lattice information, with the cell vectors on its right */}
                <div className="grid items-start gap-4 lg:grid-cols-2">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
                    <InfoRow label="Bravais lattice">
                      <span className="font-mono">{data.bravais_lattice}</span>
                    </InfoRow>
                    <InfoRow label="Extended Bravais symbol">
                      <span className="font-mono">
                        {data.bravais_lattice_extended}
                      </span>{" "}
                      <span className="text-slate-500">
                        ({data.has_inversion_symmetry ? "with" : "without"}{" "}
                        inversion symmetry)
                      </span>{" "}
                      <a
                        href={BRAVAIS_HASH}
                        className="text-blue-600 hover:underline"
                      >
                        What is this?
                      </a>
                    </InfoRow>
                    <InfoRow label="Space group">
                      {formatSpaceGroupSymbol(data.spacegroup_international)}{" "}
                      <span className="text-slate-500">
                        (number {data.spacegroup_number})
                      </span>
                    </InfoRow>
                  </dl>
                  <CoordinatesTable
                    groups={[
                      {
                        title: "Primitive cell vectors (Å)",
                        columns: ["x", "y", "z"],
                      },
                    ]}
                    rows={[0, 1, 2].map((i) => [
                      <>
                        v<sub>{i + 1}</sub>
                      </>,
                      ...primitive.lattice.basis.data.slice(3 * i, 3 * i + 3),
                    ])}
                  />
                </div>
                <CoordinatesTable
                  groups={[
                    {
                      title: "Atom coordinates (fractional)",
                      columns: [
                        <>
                          r<sub>1</sub>
                        </>,
                        <>
                          r<sub>2</sub>
                        </>,
                        <>
                          r<sub>3</sub>
                        </>,
                      ],
                    },
                    {
                      title: "Atom coordinates (Cartesian, Å)",
                      columns: ["x", "y", "z"],
                    },
                  ]}
                  labelHeader="Element"
                  rows={primitive.sites.map((site) => [
                    site.species.symbol,
                    ...site.frac,
                    ...cartesian(primitive.lattice, site),
                  ])}
                />
              </div>
            </McInfoAccordion>
          </>
        )}
        {data && (
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="relative overflow-hidden">
              <ViewerTitle>Brillouin zone</ViewerTitle>
              <div
                ref={containerRef}
                className="h-[480px] w-full overflow-hidden"
              />
            </div>

            <div className="relative overflow-hidden">
              <ViewerTitle>Structure (primitive)</ViewerTitle>
              {structure && (
                <div className="h-[480px] w-full">
                  <StructureVisualizer
                    structure={structure}
                    initSupercell={[1, 1, 1]}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {data && (
          // Each point in scaled units (of the reciprocal cell vectors) on the
          // left, in 1/Å on the right
          <CoordinatesTable
            groups={[
              {
                title: "High-symmetry k-points (scaled units)",
                columns: [
                  <>
                    k<sub>1</sub>
                  </>,
                  <>
                    k<sub>2</sub>
                  </>,
                  <>
                    k<sub>3</sub>
                  </>,
                ],
              },
              {
                title: "High-symmetry k-points (1/Å)",
                columns: [
                  <>
                    k<sub>x</sub>
                  </>,
                  <>
                    k<sub>y</sub>
                  </>,
                  <>
                    k<sub>z</sub>
                  </>,
                ],
              },
            ]}
            labelHeader="Label"
            rows={Object.entries(data.kpoints_rel).map(([label, rel]) => [
              prettify(label),
              ...rel,
              ...data.kpoints[label],
            ])}
          />
        )}

        {data && (
          <>
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <InfoRow label="Recommended path">
                <span className="font-mono">{pathSummary}</span>
                {data.augmented_path && (
                  <span className="ml-1.5 inline-flex items-center rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                    augmented
                  </span>
                )}
              </InfoRow>
              <InfoRow label="Time reversal">
                {/* With an inversion centre k and -k are already equivalent, so
                    time reversal cannot change the path. */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <label
                    className={`inline-flex select-none items-center gap-1.5 ${
                      data.has_inversion_symmetry
                        ? "cursor-not-allowed text-slate-400"
                        : "cursor-pointer"
                    }`}
                    title="When off, and the structure has no inversion symmetry, the path is augmented with -k segments (HPKOT)"
                  >
                    <input
                      type="checkbox"
                      checked={withTimeReversal}
                      onChange={handleToggleTimeReversal}
                      disabled={data.has_inversion_symmetry}
                      className="accent-blue-600"
                    />
                    <span>Assume time-reversal symmetry</span>
                  </label>
                  {data.has_inversion_symmetry && (
                    <span className="text-xs text-slate-500">
                      (structure has an inversion centre, so the path is
                      unaffected)
                    </span>
                  )}
                </div>
              </InfoRow>
              <InfoRow label="Points per line">
                <label className="flex select-none items-center gap-2">
                  <input
                    type="range"
                    min={MIN_POINTS_PER_LINE}
                    max={MAX_POINTS_PER_LINE}
                    step={1}
                    value={pointsPerLine}
                    onChange={(e) =>
                      setPointsPerLine(parseInt(e.target.value, 10) || 0)
                    }
                    aria-label="Points per line"
                    className="w-48 accent-blue-600"
                  />
                  <span className="w-12 font-mono">{pointsPerLine}</span>
                </label>
              </InfoRow>
            </dl>
            <McCopyAccordion
              title="Quantum ESPRESSO pw.x input"
              text={pwInputText}
              filename="PW.in"
              open={outputsOpen === "pw"}
              onToggle={() =>
                setOutputsOpen((prev) => (prev === "pw" ? null : "pw"))
              }
            />

            {data.kpath.segments.length > CRYSTAL_MAX_BAND_LINES && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                This path has {data.kpath.segments.length} segments, and
                CRYSTAL&apos;s BAND reads at most {CRYSTAL_MAX_BAND_LINES}: the
                CRYSTAL file below has them all, with a warning in its title.
                Assuming time-reversal symmetry halves the path.
              </p>
            )}

            <McCopyAccordion
              title="CRYSTAL D3 BAND"
              text={crystalD3Text}
              filename="BAND"
              open={outputsOpen === "d3"}
              onToggle={() =>
                setOutputsOpen((prev) => (prev === "d3" ? null : "d3"))
              }
            />

            <McCopyAccordion
              title="VASP KPOINTS for LDA/GGA"
              text={vaspKpointsText}
              filename="KPOINTS"
              open={outputsOpen === "vasp"}
              onToggle={() =>
                setOutputsOpen((prev) => (prev === "vasp" ? null : "vasp"))
              }
            />
            <McCopyAccordion
              title="VASP KPOINTS for LDA/GGA/Hybrid/GW"
              text={vaspHybridText}
              filename="KPOINTS"
              open={outputsOpen === "vaspHybrid"}
              onToggle={() =>
                setOutputsOpen((prev) =>
                  prev === "vaspHybrid" ? null : "vaspHybrid",
                )
              }
            />

            <McCopyAccordion
              title="Raw data (JSON)"
              text={jsonText}
              filename="seekpath.json"
              open={outputsOpen === "json"}
              onToggle={() =>
                setOutputsOpen((prev) => (prev === "json" ? null : "json"))
              }
            />
          </>
        )}
      </McResults>
    </div>
  );
}
