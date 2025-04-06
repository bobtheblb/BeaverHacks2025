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
  const [tempo, setTempo] = useState(120); // Default tempo for metronome
  const [heldNotes, setHeldNotes] = useState<string[]>([]);
  const [octave, setOctave] = useState(4); // Default octave
  const [isCoachingActive, setIsCoachingActive] = useState(false)
  const [coachingStart, setCoachingStart] = useState(0)
  const coachingStartRef = useRef<number | null>(null);

  const keyToNoteMap = {
    a: `C${octave}`,
    w: `C#${octave}`,
    s: `D${octave}`,
    e: `D#${octave}`,
    d: `E${octave}`,
    f: `F${octave}`,
    t: `F#${octave}`,
    g: `G${octave}`,
    y: `G#${octave}`,
    h: `A${octave}`,
    u: `A#${octave}`,
    j: `B${octave}`,
    k: `C${octave + 1}`,
  };

  const twinkle = [
    { note: 'C4', duration: '4n' },
    { note: 'C4', duration: '4n' },
    { note: 'G4', duration: '4n' },
    { note: 'G4', duration: '4n' },

    { note: 'A4', duration: '4n' },
    { note: 'A4', duration: '4n' },
    { note: 'G4', duration: '2n' },

    { note: 'F4', duration: '4n' },
    { note: 'F4', duration: '4n' },
    { note: 'E4', duration: '4n' },
    { note: 'E4', duration: '4n' },

    { note: 'D4', duration: '4n' },
    { note: 'D4', duration: '4n' },
    { note: 'C4', duration: '2n' },

    { note: 'G4', duration: '4n' },
    { note: 'G4', duration: '4n' },
    { note: 'F4', duration: '4n' },
    { note: 'F4', duration: '4n' },

    { note: 'E4', duration: '4n' },
    { note: 'E4', duration: '4n' },
    { note: 'D4', duration: '2n' },

    { note: 'G4', duration: '4n' },
    { note: 'G4', duration: '4n' },
    { note: 'F4', duration: '4n' },
    { note: 'F4', duration: '4n' },

    { note: 'E4', duration: '4n' },
    { note: 'E4', duration: '4n' },
    { note: 'D4', duration: '2n' },
  ]

  function calculateErrorMetrics(start, end) {
    var true_note;
    var true_i;
    for (let i = 0; i < twinkle.length; i++) {
      let note = twinkle[i];
      if (start < note.time) {
        true_note = twinkle[i-1];
        true_i = i-1
        break;
      }
    }

    var next_note;
    var next_i;
    for (let i = 0; i < twinkle.length; i++) {
      let note = twinkle[i];
      if (end < note.time) {
        next_note = twinkle[i-1];
        next_i = i-1
        break;
      }
    }

    let true_notes = [];
    for (let i = true_i; i <= next_i; i++) {
      true_notes.push(twinkle[i]);
    }

    console.log(`true notes poop: ${true_notes}`);

    let ious = [];
    let weights = [];
    for (let i = 0; i < true_notes.length; i++) {
      let true_note = true_notes[i];
      let true_start = true_note.time;
      let true_end = true_note.time + true_note.durationMs;
      let intersection = 0;
      let union = 0;
      let weight = 0;
      if ((start >= true_start) && (end <= true_end)) {
        intersection = end - start;
        union = true_end - true_start;
        weight = 1;
      } else if ((true_start <= start) && (end >= true_end)) {
        intersection = true_end - start;
        union = end - true_start;
        weight = (true_end - start) / (end - start);
      } else if ((true_start >= start) && (true_end <= end)) {
        intersection = true_end - true_start;
        union = end - start;
        weight = (true_end - true_start) / (end - start);
      } else if ((true_start >= start) && (true_end >= end)) {
        intersection = end - true_start;
        union = true_end - start;
        weight = (end - true_start) / (end - start);
      }
      ious.push(intersection / union);
      weights.push(weight);
    }

    let weighted_iou = 0;
    for (let i = 0; i < ious.length; i++) {
      weighted_iou += (ious[i] * weights[i])
    }

    return weighted_iou
    // New cases:
    // ###
    //  #
    //
    // ###
    //  ###
    // 
    //  #
    // ###
    //
    //  ###
    // ###

    // Old cases:
    // ###
    //  ###
    //
    // ####
    //  ##
    //
    //  ###
    // ###
    //
    //  ##
    // ####
  }

  // Calculate time for each note and include in the array
  let currentTime = 0;
  const millisecondsPerBeat = (60 / tempo) * 1000; // BPM to milliseconds per beat conversion

  twinkle.forEach(note => {
    const noteDuration = note.duration === '4n' ? 1 : (note.duration === '2n' ? 2 : 0);
    note.time = currentTime;  // Store the cumulative time for the note in milliseconds
    currentTime += noteDuration * millisecondsPerBeat; // Update the cumulative time in milliseconds
    note.durationMs = noteDuration * millisecondsPerBeat
  });

  console.log(twinkle);

  // Function to play the song
  const playSong = async () => {
    // Ensure Tone.js is started
    await Tone.start();

    // Create a synth to play the notes
    const synth = new Tone.Synth().toDestination();

    // Play the song
    for (let i = 0; i < twinkle.length; i++) {
      const { note, duration } = twinkle[i];
      synth.triggerAttackRelease(note, duration);
      await new Promise(resolve => setTimeout(resolve, Tone.Time(duration).toMilliseconds()));
    }
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
    { label: 'Amazing Grace', file: '/amazing_grace.musicxml' },
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
          const coachingStartTime = coachingStartRef.current ? Date.now() - coachingStartRef.current : 0;
          console.log(`now: ${Date.now()}`)
          console.log(`coaching start: ${coachingStartRef.current}`)
          console.log(`poopy2: ${coachingStartTime}`)
          console.log(`Pressed '${key}' for ${duration} milliseconds`);

          const coachingEndTime = coachingStartTime + duration

          const iou = calculateErrorMetrics(coachingStartTime, coachingEndTime)

          console.log(`iou: ${iou}`)

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
  }, [octave]);

  const toggleMetronome = () => {
    if (isMetronomeActive) {
      transport.stop();
      setIsMetronomeActive(false);
    } else {
      transport.start();
      setIsMetronomeActive(true);
    }
  };

  const toggleCoaching = () => {
    if (isCoachingActive) {
      coachingStartRef.current = null
      setIsCoachingActive(false);
    } else {
      coachingStartRef.current = Date.now()
      setIsCoachingActive(true);
    }
  };

  useEffect(() => {
    console.log(`coaching start: ${coachingStart}`)
  }, [coachingStart]);

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
    <div className="max-w-full mx-auto px-4 py-8 flex flex-col sm:flex-row overflow-hidden">
      {/* Sheet music container */}
      <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
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

        <div className="mb-4">
        <button
          onClick={playSong}
          style={{
            backgroundColor: '#32cd32',
            color: 'white',
            padding: '10px 20px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Play Song
        </button>
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
      </div>

      {/* Control panel (keyboard, metronome, etc.) */}
      <div className="w-full sm:w-1/2">
        <Keyboard octave={octave} setOctave={setOctave} />

        {/* Metronome toggle */}
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
        <div className="mt-4 flex items-center">
          <button
            onClick={toggleCoaching}
            style={{
              backgroundColor: isCoachingActive ? '#ff6347' : '#32cd32',
              color: 'white',
              padding: '10px 20px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
          >
            {isCoachingActive ? 'Stop Coaching' : 'Start Coaching'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SheetMusicOSMD;
