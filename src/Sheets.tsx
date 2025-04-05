import { useEffect, useRef, useState } from 'react';
import * as OpenSheetMusicDisplay from 'opensheetmusicdisplay';

type SheetMusicOSMDProps = {
  file: string;
};

export function SheetMusicOSMD({ file }: SheetMusicOSMDProps) {
  const [musicXML, setMusicXML] = useState<string | null>(null);
  const osmdContainerRef = useRef<HTMLDivElement>(null); // Ref to the container for OSMD

  useEffect(() => {
    // Fetch the music XML file when the selected file changes
    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load the music XML file');
        }
        return response.text();
      })
      .then((data) => setMusicXML(data))
      .catch((error) => {
        console.error('Error loading the sheet music:', error);
        setMusicXML(null); // Clear musicXML in case of error
      });
  }, [file]);

  useEffect(() => {
    if (musicXML && osmdContainerRef.current) {
      const osmd = new OpenSheetMusicDisplay.OpenSheetMusicDisplay(osmdContainerRef.current);
      osmd.load(musicXML).then(() => {
        osmd.render();
      });
    }
  }, [musicXML]);

  return (
    <div>
      {musicXML ? (
        <div>
          {/* OSMD renders the sheet music here */}
          {/* <p>Sheet music for: {file}</p> */}
          <div ref={osmdContainerRef} style={{ width: '100%', height: '500px' }} />
        </div>
      ) : (
        <p>Loading sheet music...</p>
      )}
    </div>
  );
}

export default SheetMusicOSMD;
