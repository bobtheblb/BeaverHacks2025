import { useEffect, useRef, useState } from 'react';
import * as OpenSheetMusicDisplay from 'opensheetmusicdisplay';

export function SheetMusicOSMD() {
  const [selectedFile, setSelectedFile] = useState<string>("/twinkle.musicxml");
  const [musicXML, setMusicXML] = useState<string | null>(null);
  const osmdContainerRef = useRef<HTMLDivElement>(null);
  const osmdInstance = useRef<OpenSheetMusicDisplay.OpenSheetMusicDisplay | null>(null); 

  const sheetMusicFiles = [
    { label: "Twinkle, Twinkle, Little Star", file: "/twinkle.musicxml" },
    { label: "When the Saints go Marching in", file: "/saints.musicxml" },
    { label: "Mary Had a Little Lamb", file: "/mary.musicxml" },
    { label: "Itsy Bitsy Spider", file: "/spider.musicxml" },
  ];

  // Handle selection change (dropdown)
  const handleFileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFile(event.target.value);
  };

  // Fetch the music XML file when the selected file changes
  useEffect(() => {
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
        osmdInstance.current = osmd; 
      });
    }
  }, [musicXML]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Dropdown to select sheet music */}
      <div className="mb-4">
        <label htmlFor="sheet-music-dropdown" className="block text-lg font-semibold mb-2">Select Sheet Music: </label>
        <select
          id="sheet-music-dropdown"
          value={selectedFile}
          onChange={handleFileChange}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {sheetMusicFiles.map((music) => (
            <option key={music.file} value={music.file}>
              {music.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sheet music viewer */}
      <div className="mt-8">
        {musicXML ? (
          <div>
            {/* OSMD renders the sheet music here */}
            <div ref={osmdContainerRef} />
          </div>
        ) : (
          <p className="text-center text-lg text-gray-600">Loading sheet music...</p>
        )}
      </div>
    </div>
  );
}

export default SheetMusicOSMD;
