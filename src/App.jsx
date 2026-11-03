import "./index.css";
import MaterialsCloudHeader from "mc-react-header";
import { useState } from "react";

import InfoAccordions from "./AccordionContent";
import BravaisModal from "./BravaisModal";
import CrystalUpload from "./FileUpload";
import SeekPath from "./SeekPath";

// Current policy is no mc-keyvalues-stores allowed in apps
import {
  McAppHeader /* , McShareButton, toStructureShare */,
} from "mc-react-library";

function App() {
  // { structure, fileName, format, shareId? }
  const [loaded, setLoaded] = useState(null);

  return (
    <>
      <MaterialsCloudHeader
        activeSection="work"
        breadcrumbsPath={[
          { name: "Work", link: "https://www.materialscloud.org/work" },
          { name: "Tools", link: "https://www.materialscloud.org/work/tools" },
          {
            name: "SeeK-path: the k-path finder and visualizer",
            link: null,
          },
        ]}
      />

      <main className="min-h-screen bg-[aliceblue] pb-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="overflow-hidden bg-white shadow-sm p-4">
            <McAppHeader
              title="SeeK-path: the k-path finder and visualizer"
              logo={`${import.meta.env.BASE_URL}seekpath.png`}
              logoAlt="SeeK-path logo"
              dois={[
                { doi: "10.1016/j.commatsci.2016.10.015", label: "Paper DOI" },
              ]}
            />
            <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
              <div className="space-y-3">
                <InfoAccordions />
                <CrystalUpload onStructureParsed={setLoaded} />
              </div>
            </div>

            <SeekPath
              structure={loaded?.structure}
              className="max-w-6xl mx-auto py-4"
            />

            {/* Current policy is no mc-keyvalues-stores allowed in apps
            <McShareButton
              data={loaded}
              toDocument={toStructureShare}
              shareId={loaded?.shareId}
              className="mx-auto max-w-6xl px-6 sm:px-10"
            /> */}
          </div>
        </div>
        <BravaisModal />
      </main>
    </>
  );
}

export default App;
