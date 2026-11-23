import { McStructureUpload } from "mc-react-library";

import { examples } from "./examples";

export default function CrystalStructureUpload(props) {
  return (
    <McStructureUpload
      historyKey="seekpath.parsedStructures"
      historyTitle="Previously calculated structures"
      examples={examples}
      {...props}
    />
  );
}
