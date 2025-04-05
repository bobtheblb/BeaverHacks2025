import { useEffect, useRef, useState } from 'react';
import * as OpenSheetMusicDisplay from 'opensheetmusicdisplay';

export function SheetMusicOSMD() {
  const [selectedFile, setSelectedFile] = useState<string>("/twinkle.musicxml");

  // List of sheet music files (you can add more files here)
  const sheetMusicFiles = [
    { label: "Twinkle, Twinkle, Little Star", file: "/twinkle.musicxml" },
    { label: "Happy Birthday", file: "/happy.musicxml" },
    { label: "Mary Had a Little Lamb", file: "/mary.musicxml" },
  ];

  const [musicXML, setMusicXML] = useState<string | null>(null);
  const osmdContainerRef = useRef<HTMLDivElement>(null); // Ref to the container for OSMD

  // Handle selection change
  const handleFileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFile(event.target.value);
  };

  useEffect(() => {
    // Fetch the music XML file when the selected file changes
    fetch(selectedFile)
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
  }, [selectedFile]);

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
      {/* Dropdown to select sheet music */}
      <div>
        <label htmlFor="sheet-music-dropdown">Select Sheet Music: </label>
        <select
          id="sheet-music-dropdown"
          value={selectedFile}
          onChange={handleFileChange}
        >
          {sheetMusicFiles.map((music) => (
            <option key={music.file} value={music.file}>
              {music.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sheet music viewer */}
      <div>
        {musicXML ? (
          <div>
            {/* OSMD renders the sheet music here */}
            <div ref={osmdContainerRef} style={{ width: '100%', height: '500px' }} />
          </div>
        ) : (
          <p>Loading sheet music...</p>
        )}
      </div>
    </div>
  );
}

export default SheetMusicOSMD;
