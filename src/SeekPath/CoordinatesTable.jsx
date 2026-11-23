const fmt = (x) => x.toFixed(10); // as the legacy app

/**
 * A table of coordinates: a title row split over its column `groups` (each
 * `{ title, columns }`, divided by a line), the column headings, then `rows`
 * of `[label, ...values]`. The label column, headed `labelHeader`, belongs to
 * the first group. Long tables scroll under their headings.
 */
export default function CoordinatesTable({ groups, labelHeader = "", rows }) {
  const divider = "border-l border-slate-200";
  // Separate borders: each cell draws its own, also under the sticky header
  // (collapsed borders are the table's, painted over by the header)
  const starts = new Set(); // the columns starting a group, after the first
  let n = 0;
  for (const { columns } of groups) {
    if (n > 0) starts.add(n);
    n += columns.length;
  }
  return (
    <div className="max-h-80 overflow-auto border border-slate-300 shadow">
      <table className="w-full border-separate border-spacing-0 text-[13px]">
        <thead className="sticky top-0">
          <tr className="bg-slate-50 text-left">
            {groups.map(({ title, columns }, i) => (
              <th
                key={i}
                colSpan={columns.length + (i === 0 ? 1 : 0)}
                className={`border-b border-slate-200 px-3 py-2 ${i > 0 ? divider : ""}`}
              >
                {title}
              </th>
            ))}
          </tr>
          <tr className="bg-white text-slate-400">
            <th className="border-b border-slate-100 px-3 py-1.5 text-left font-medium">
              {labelHeader}
            </th>
            {groups
              .flatMap((g) => g.columns)
              .map((column, j) => (
                <th
                  key={j}
                  className={`border-b border-slate-100 px-3 py-1.5 text-right font-medium ${starts.has(j) ? divider : ""}`}
                >
                  {column}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, ...values], i) => (
            <tr key={i} className=" last:border-0 odd:bg-slate-50">
              <td className="px-3 py-1 font-mono text-slate-500">{label}</td>
              {values.map((v, j) => (
                <td
                  key={j}
                  className={`px-3 py-1 text-right font-mono tabular-nums text-slate-700 ${starts.has(j) ? divider : ""}`}
                >
                  {fmt(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
