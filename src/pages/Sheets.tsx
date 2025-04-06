import { useEffect, useRef, useState } from 'react';
import * as OpenSheetMusicDisplay from 'opensheetmusicdisplay';
import * as Tone from 'tone';
import Keyboard from '../Keyboard.tsx'; 
import { GoogleGenAI } from "@google/genai";

import amazing_grace from '../../note_data_jsons/amazing_grace.json';
import mary from '../../note_data_jsons/mary.json';
import twinkle from '../../note_data_jsons/twinkle.json';

import saints from '../../note_data_jsons/saints.json';
import spider from '../../note_data_jsons/spider.json';

export function SheetMusicOSMD() {
  const [selectedFile, setSelectedFile] = useState<string>(() => {
    return localStorage.getItem('selectedSheetMusic') || '/twinkle.musicxml';
  });
  const [musicXML, setMusicXML] = useState<string | null>(null);
  const osmdContainerRef = useRef<HTMLDivElement>(null);
  const osmdInstance = useRef<OpenSheetMusicDisplay.OpenSheetMusicDisplay | null>(null);
  const [song, setSong] = useState<string>('twinkle');  // Set default song to 'mary'

  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [isMetronomeActive2, setIsMetronomeActive2] = useState(false);

  const [tempo, setTempo] = useState(120); // Default tempo for metronome
  const [heldNotes, setHeldNotes] = useState<string[]>([]);
  const [octave, setOctave] = useState(4); // Default octave
  const [isSongPlaying, setIsSongPlaying] = useState(false); // Track song playback state
  const [text, setText] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ai = new GoogleGenAI({ apiKey: "AIzaSyB7gXVIWi9Zifw_UFk9wFAACjOWW-C84as" });

  const expectedValues = [
    { note: 'C4', duration: 500 }, 
    { note: 'C4', duration: 500 }, 
    { note: 'G4', duration: 500 }, 
    { note: 'G4', duration: 500 }, 
    { note: 'A4', duration: 500 }, 
    { note: 'A4', duration: 500 }, 
    { note: 'G4', duration: 1000 },
    { note: 'F4', duration: 500 }, 
    { note: 'F4', duration: 500 }, 
    { note: 'E4', duration: 500 }, 
    { note: 'E4', duration: 500 }, 
    { note: 'D4', duration: 500 }, 
    { note: 'D4', duration: 500 }, 
    { note: 'C4', duration: 1000 } 
  ];
  
  const actualValues = [
    { note: 'C4', duration: 500 },
    { note: 'C4', duration: 600 }, 
    { note: 'G4', duration: 500 },
    { note: 'G4', duration: 500 },
    { note: 'A4', duration: 500 },
    { note: 'A4', duration: 500 },
    { note: 'G4', duration: 1000 },
    { note: 'F4', duration: 500 },
    { note: 'F4', duration: 450 }, 
    { note: 'E4', duration: 500 },
    { note: 'E4', duration: 550 }, 
    { note: 'D4', duration: 500 }, 
    { note: 'D4', duration: 500 }, 
    { note: 'C4', duration: 1000 } 
  ];
  

  async function chatFeature() {
    setIsModalOpen(true);
    setText("Loading response...");
    
    // You can provide the data directly here
    const myData = `Based on my metrics, how can I improve? Here are the metrics:
    Expected values: ${JSON.stringify(expectedValues, null, 2)}
    Actual values: ${JSON.stringify(actualValues, null, 2)}
    `;
  
    getResponse(myData); // Pass the data to the function
  }
  

  async function getResponse(data: string) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: data,  // pass data here
    });
  
    console.log(response.text);
    setText(response.text); // set the response text to display in the modal
  }
  

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

  interface Note {
    note: string;
    duration: string;
    time?: string; // Optional, if you want to add time calculations
  }

  const formattedNotes: Note[] = [];
  let currentTime1 = 0;
  const millisecondsPerBeat1 = (60 / tempo) * 1000; // BPM to milliseconds per beat conversion

  // Based on selected song, update the notes
  const songData = {
    mary: mary,
    twinkle: twinkle,
    saints: saints,
    spider: spider,
    amazing_grace: amazing_grace
  };

  const notesToUse = songData[song] || mary;  // Default to mary if no song is found
  notesToUse.forEach((item) => {
    // Handle rest (pitch is null)
    if (item.pitch === null) {
        let duration = '';
        if (item.duration === "60") {
            duration = '8n'; // Eighth rest
        } else if (item.duration === "120") {
            duration = '4n'; // Quarter rest
        } else if (item.duration === "180") {
            duration = '4n.'; // Quarter half rest
        } else if (item.duration === "240") {
            duration = '2n'; // Half rest
        }
        

        const restDuration = duration === '8n' ? 1 / 8 :
                             duration === '4n' ? 1 / 4 :
                             duration === '2n' ? 1 / 2 : 1;
        
        const time = currentTime1;
        currentTime1 += restDuration * millisecondsPerBeat1;  // Update the time
        formattedNotes.push({ note: 'rest', duration, time: `${time}` });
    }else {
      // Handle regular notes
      const note = `${item.pitch.step}${item.pitch.octave}`;
      let duration = '';
      let noteDuration = 0;
  
      // Set the note duration based on item.type
      if (item.type === 'eighth') {
          duration = '8n';
          noteDuration = 1 / 8;
      } else if (item.type === 'quarter') {
          if (item.dot) { // Dotted quarter note
              duration = '4n.';
              noteDuration = (1 / 4) * 1.5; // 3/8
          } else {
              duration = '4n';
              noteDuration = 1 / 4;
          }
      } else if (item.type === 'half') {
          duration = '2n';
          noteDuration = 1 / 2;
      } else if (item.type === 'whole') {
          duration = '1n';
          noteDuration = 1;
      } else if (item.type === 'dotted-quarter') {
          duration = '4n.';
          noteDuration = (1 / 4) * 1.5; // 3/8
      } else if (item.type === 'dotted-half') {
        duration = '2n.';
        noteDuration = (1 / 2) * 1.5;
    }
  
      // Optional: Override noteDuration based on specific duration string
      if (item.duration === "60") {
          noteDuration *= 1;
      } else if (item.duration === "120") {
          noteDuration *= 2;
      } else if (item.duration === "180") {
          noteDuration *= 4;
      } else if (item.duration === "240") {
          noteDuration *= 8;
      }
  
      // Calculate time
      const time = currentTime1;
      currentTime1 += noteDuration * millisecondsPerBeat1;
  
      // Push to formattedNotes
      formattedNotes.push({ note, duration, time: `${time}` });
  }
  
});


  console.log(formattedNotes);

  const playSong = async () => {
    setIsSongPlaying(true);
    // Ensure Tone.js is started
    await Tone.start();

    // Play the metronome for 4 beats
    const metronome = new Tone.MembraneSynth().toDestination();
    let beatCount = 0;
    let countIn = 0;
    let metronomeIntervalMs = Tone.Time('4n').toMilliseconds(); // default

    if (song === 'twinkle' || song === 'mary') {
      countIn = 4;
    }
    else if (song === 'saints' || song === 'amazing_grace') {
      countIn = 5;
    }
    else if (song === 'spider') {
      countIn = 11; // for 6/8 time
      metronomeIntervalMs = Tone.Time('8n').toMilliseconds(); // eighth-note metronome
    } else {
      countIn = 4; // or however many you want for 4/4 songs
      metronomeIntervalMs = Tone.Time('4n').toMilliseconds(); // quarter-note metronome
    }

    const metronomeInterval = setInterval(() => {
      metronome.triggerAttackRelease('C1', '8n');
      beatCount++;
      if (beatCount === countIn + 1) {
        if (!isMetronomeActive2) {
          clearInterval(metronomeInterval); // Stop the metronome after 4 beats
        }
        startSong();
      }

    }, metronomeIntervalMs);

    // Prevent starting the song until the metronome has clicked 4 times
    const startSong = async () => {
      // Create a synth to play the notes
      const synth = new Tone.Synth().toDestination();
      // Play the song
      for (let i = 0; i < formattedNotes.length; i++) {
        const { note, duration } = formattedNotes[i];
        console.log(duration);

        // Skip if the note is a rest
        if (note === 'rest') {
          // Do nothing, no need to trigger anything for rests
          await new Promise(resolve => setTimeout(resolve, Tone.Time(duration).toMilliseconds()));
        } else {
          synth.triggerAttackRelease(note, duration);
          await new Promise(resolve => setTimeout(resolve, Tone.Time(duration).toMilliseconds()));
        }
      }
      setIsSongPlaying(false); // Song finished or stopped
      clearInterval(metronomeInterval);
    };
  };

  const stopSong = () => {
    Tone.Transport.stop(); // Stop the transport to halt any ongoing playback
    Tone.context.close(); // Optionally stop Tone.js context (disabling audio)
    setIsSongPlaying(false);
    window.location.reload();
  };

  // Metronome setup
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
    const newFile = event.target.value;
    setSelectedFile(event.target.value);

    // Update song name when file is selected
    const songName = newFile.split('.')[0] // Get the song name from the file name
      .replace('/', '') // Remove the leading slash
    setSong(songName);
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
    const metronome = new Tone.MembraneSynth().toDestination();
    transport.scheduleRepeat(() => {
      metronome.triggerAttackRelease('C1', '8n');
    }, '4n');
  }, []);


  return (
    <div className="max-w-full mx-auto px-4 py-8 flex flex-col sm:flex-row">
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

        <div className="mb-4 flex items-center space-x-4">
          <button
            onClick={isSongPlaying ? stopSong : playSong}
            style={{
              backgroundColor: isSongPlaying ? '#ff6347' : '#32cd32',
              color: 'white',
              padding: '10px 20px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {isSongPlaying ? 'Stop Song' : 'Play Song'}
          </button>
          <label className="flex items-center text-lg font-semibold">
            <input
              type="checkbox"
              checked={isMetronomeActive2}
              onChange={() => setIsMetronomeActive2(prev => !prev)}
              className="mr-2"
            />
            Metronome On
          </label>
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
      <div className="w-full sm:w-1/2 overflow-hidden">
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

          <p>selected song: {song}</p>
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
        </div>
      </div>

      {/* Chat Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full max-h-[400px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Gemini response: </h2>
            <div className="flex-1 overflow-y-auto mb-4">
              <p>{text}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)} // Close modal when clicked
              className="mt-4 bg-red-500 text-white p-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}



      {/* Chat Button */}
      <button
        onClick={chatFeature}
        className="bg-gray-500 text-white h-15 p-2 rounded-md fixed bottom-4 right-4 z-50"
      >
        Chat
      </button>

    </div>
    
  );
}

export default SheetMusicOSMD;
