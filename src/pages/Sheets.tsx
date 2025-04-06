import { useEffect, useRef, useState } from 'react';
import * as OpenSheetMusicDisplay from 'opensheetmusicdisplay';
import * as Tone from 'tone';
import Keyboard from '../Keyboard.tsx'; // Assuming you have a Keyboard component

export function SheetMusicOSMD() {
  const [selectedFile, setSelectedFile] = useState<string>('/twinkle.musicxml');
  const [musicXML, setMusicXML] = useState<string | null>(null);
  const osmdContainerRef = useRef<HTMLDivElement>(null);
  const osmdInstance = useRef<OpenSheetMusicDisplay.OpenSheetMusicDisplay | null>(null);

  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [tempo, setTempo] = useState(120);  // Default tempo for metronome
  const [heldNotes, setHeldNotes] = useState<string[]>([]);

  const keyToNoteMap = {
    a: 'C4',
    w: 'C#4',
    s: 'D4',
    e: 'D#4',
    d: 'E4',
    f: 'F4',
    t: 'F#4',
    g: 'G4',
    y: 'G#4',
    h: 'A4',
    u: 'A#4',
    j: 'B4',
    k: 'C5',
  };

  // Metronome setup
  const metronome = new Tone.MembraneSynth().toDestination();
  const transport = Tone.Transport;
  transport.bpm.value = tempo;

  // Store synths and press start times per key
  const activeSynths = useRef<{ [key: string]: Tone.Synth }>({});
  const pressStartTimes = useRef<{ [key: string]: number }>({});

  const sheetMusicFiles = [
    { label: 'Twinkle, Twinkle, Little Star', file: '/twinkle.musicxml' },
    { label: 'When the Saints go Marching in', file: '/saints.musicxml' },
    { label: 'Mary Had a Little Lamb', file: '/mary.musicxml' },
    { label: 'Itsy Bitsy Spider', file: '/spider.musicxml' },
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

  // Keyboard handling and metronome toggling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const note = keyToNoteMap[key];

      if (note && !activeSynths.current[key]) {
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttack(note);
        activeSynths.current[key] = synth;
        pressStartTimes.current[key] = Date.now();
        setHeldNotes((prev) => [...prev, note]);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const note = keyToNoteMap[key];
      const synth = activeSynths.current[key];

      if (note && synth) {
        const start = pressStartTimes.current[key];
        if (start) {
          const duration = Date.now() - start;
          console.log(`Pressed '${key}' for ${duration} milliseconds`);
          delete pressStartTimes.current[key];
        }

        synth.triggerRelease();
        delete activeSynths.current[key];

        setHeldNotes((prev) => prev.filter((n) => n !== note));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const toggleMetronome = () => {
    if (isMetronomeActive) {
      transport.stop();
      setIsMetronomeActive(false);
    } else {
      transport.start();
      setIsMetronomeActive(true);
    }
  };

  const handleTempoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = Math.min(200, Math.max(60, Number(event.target.value)));
    setTempo(newTempo);
    transport.bpm.value = newTempo;
  };

  const handleTempoInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Temporarily store the value without applying it yet
    setTempo(Number(event.target.value));
  };

  // Update tempo when Enter is pressed
  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      let newTempo = Number((event.target as HTMLInputElement).value);
      newTempo = Math.min(200, Math.max(60, newTempo));
      setTempo(newTempo);
      transport.bpm.value = newTempo;
    }
  };

  useEffect(() => {
    transport.scheduleRepeat(() => {
      metronome.triggerAttackRelease('C1', '8n');
    }, '4n');
  }, []);

  return (
    <div className="max-w-full mx-auto px-4 py-8">
      {/* Dropdown to select sheet music */}
      <div className="mb-4">
        <label htmlFor="sheet-music-dropdown" className="block text-lg font-semibold mb-2">
          Select Sheet Music:
        </label>
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
      <div className="mt-4 w-full h-[80vh]">
        {musicXML ? (
          <div
            ref={osmdContainerRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        ) : (
          <p className="text-center text-lg text-gray-600">Loading sheet music...</p>
        )}
      </div>

      {/* Keyboard Section */}
      <Keyboard />

      <h1>Press keys to play notes</h1>
      <p>
        {heldNotes.length > 0
          ? `Currently playing: ${heldNotes.join(', ')}`
          : 'Press and hold a key to play a note'}
      </p>

      <div>
        <button
          onClick={toggleMetronome}
          style={{
            backgroundColor: isMetronomeActive ? '#ff6347' : '#32cd32',
            color: 'white',
            padding: '10px 20px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
        >
          {isMetronomeActive ? 'Stop Metronome' : 'Start Metronome'}
        </button>
      </div>

      {/* Metronome tempo control */}
      <div className="mt-4 flex items-center">
        {/* Text box for exact tempo */}
        <input
          id="tempo-input"
          type="number"
          value={tempo}
          onChange={handleTempoInput}
          onKeyDown={handleInputKeyDown}
          min="60"
          max="200"
          className="w-24 p-2 border border-gray-300 rounded-md mr-4"
        />

        {/* Sliding bar */}
        <input
          id="tempo-slider"
          type="range"
          min="60"
          max="200"
          value={tempo}
          onChange={handleTempoChange}
          className="w-full"
        />
        <span className="ml-2">{tempo} BPM</span>
      </div>
    </div>
  );
}

export default SheetMusicOSMD;
