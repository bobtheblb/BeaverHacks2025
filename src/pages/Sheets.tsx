import { useEffect, useRef, useState } from 'react';
import * as OpenSheetMusicDisplay from 'opensheetmusicdisplay';
import * as Tone from 'tone';
import Keyboard from '../Keyboard.tsx'; 
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router';

import amazing_grace from '../../note_data_jsons/amazing_grace.json';
import mary from '../../note_data_jsons/mary.json';
import twinkle from '../../note_data_jsons/twinkle.json';

import saints from '../../note_data_jsons/saints.json';
import spider from '../../note_data_jsons/spider.json';

import gemini from '../../public/gemini.png';

export function SheetMusicOSMD() {
  const navigate = useNavigate();
  
  const [selectedFile, setSelectedFile] = useState<string>(() => {
    return localStorage.getItem('selectedSheetMusic') || '/twinkle.musicxml';
  });
  const [musicXML, setMusicXML] = useState<string | null>(null);
  const osmdContainerRef = useRef<HTMLDivElement>(null);
  const osmdInstance = useRef<OpenSheetMusicDisplay.OpenSheetMusicDisplay | null>(null);
  const [song, setSong] = useState<string>(() => {
    return localStorage.getItem('selectedSong') || 'twinkle';
  });
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [isMetronomeActive2, setIsMetronomeActive2] = useState(false);

  const [tempo, setTempo] = useState(120); // Default tempo for metronome
  const [heldNotes, setHeldNotes] = useState<string[]>([]);
  const [octave, setOctave] = useState(4); // Default octave
  const [isCoachingActive, setIsCoachingActive] = useState(false)
  const [coachingStart, setCoachingStart] = useState(0)
  const coachingStartRef = useRef<number | null>(null);
  const startCoachingTimerRef = useRef(false);
  const iouListRef = useRef([]);
  const noteHistoryRef = useRef([]);
  const noteHistoryRefOld = useRef([]);
  const [avgIou, setAvgIou] = useState(0.0);
  const [accuracy, setAccuracy] = useState(0.0);
  const [showMetrics, setShowMetrics] = useState(false);
  const [isSongPlaying, setIsSongPlaying] = useState(false); // Track song playback state
  const formattedNotesRef = useRef([]);
  const formattedNotesRefOld = useRef([]);
  const [numBeats, setNumBeats] = useState(0);
  const [text, setText] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chatOutputRef = useRef('');

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
    const myData = `So I'm trying to play a piano piece on a virtual piano, and I've listed the expected values and my actual values, how can I improve? Here are the metrics. Please don't repeat the metrics just give nice feedback. Also compare with last run, which may be empty, don't mention it if it is. Don't do any formatting please. Be really nice like a piano instructor. Also if your previous advice is there, use it to inform you:
    Expected values: ${JSON.stringify(formattedNotesRef, null, 2)}
    Actual values: ${JSON.stringify(noteHistoryRef, null, 2)}
    Old Actual Values from last run: ${JSON.stringify(noteHistoryRefOld, null, 2)}
    Previous advice: ${chatOutputRef.current}
    `;

    console.log(myData);
  
    getResponse(myData); // Pass the data to the function
  }
  

  async function getResponse(data: string) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: data,  // pass data here
    });
  
    chatOutputRef.current = response;

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
    durationMs: string;
    time?: string; // Optional, if you want to add time calculations
  }

  let currentTime1 = 0;
  const millisecondsPerBeat1 = (60 / tempo) * 1000; // BPM to milliseconds per beat conversion
  console.log(`ms per beat: ${millisecondsPerBeat1}`)

  // Based on selected song, update the notes
  const songData = {
    mary: mary,
    twinkle: twinkle,
    saints: saints,
    spider: spider,
    amazing_grace: amazing_grace
  };

  const notesToUse = songData[song] || mary;  // Default to mary if no song is found

  updateMusic();

  useEffect(() => {
    console.log("tempo changed");
    updateMusic();
  }, [tempo]);

  function updateMusic() {
    formattedNotesRef.current = []
    console.log("updating music")
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
          currentTime1 += restDuration * 4 * millisecondsPerBeat1;  // Update the time
          formattedNotesRef.current.push({ note: 'rest', duration, time: `${time}`, durationMs: `${restDuration * 4 * millisecondsPerBeat1}`});
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

        // Calculate time
        const time = currentTime1;
        currentTime1 += noteDuration * 4 * millisecondsPerBeat1;
    
        // Push to formattedNotes
        console.log(`ms per beat2: ${millisecondsPerBeat1}`)
        formattedNotesRef.current.push({ note, duration, time: `${time}`, durationMs: `${noteDuration * 4 * millisecondsPerBeat1}` });
      }

    });

    // console.log(`aboutta poop: ${JSON.stringify(formattedNotesRef.current)}`);
  }

  function calculateIou(start, end) {
    // console.log(`im pooping my pants rn: ${JSON.stringify(formattedNotesRef.current)}`);
    var true_note;
    var true_i;
    for (let i = 0; i < formattedNotesRef.current.length; i++) {
      let note = formattedNotesRef.current[i];
      if (start < note.time) {
        true_note = formattedNotesRef.current[i-1];
        true_i = i-1
        break;
      }
    }

    var next_note;
    var next_i;
    for (let i = 0; i < formattedNotesRef.current.length; i++) {
      let note = formattedNotesRef.current[i];
      if (end < note.time) {
        next_note = formattedNotesRef.current[i-1];
        next_i = i-1
        break;
      }
    }

    let true_notes = [];
    for (let i = true_i; i <= next_i; i++) {
      true_notes.push(formattedNotesRef.current[i]);
    }

    let ious = [];
    let weights = [];
    for (let i = 0; i < true_notes.length; i++) {
      let true_note = true_notes[i];
      let true_start = true_note.time;
      console.log(`true note time: ${true_note.time}, duration: ${true_note.durationMs}`)
      let true_end = parseFloat(true_note.time) + parseFloat(true_note.durationMs);
      let intersection = 0;
      let union = 0;
      let weight = 0;

      console.log(`true start: ${true_start}, true_end: ${true_end}`)
      console.log(`start: ${start}, end: ${end}`)

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

  function calculateAccuracy(noteHistory) {
    let count_correct = 0;
    let count_total = 0;
    let current_j = 0;
    for (let i = 0; i < noteHistory.length; i++) {
      let true_curr_note = formattedNotesRef.current[current_j].note;
      if (current_j < formattedNotesRef.current.length) {
        if (noteHistory[i].note[0] == true_curr_note[0]) {
          count_correct += 1;
          count_total += 1;
          current_j = current_j + 1;
        } else {
          count_total += 1;
        }
      } else {
        count_total += 1;
      }
    }

    return (count_correct / count_total);
  }
  
  // Calculate time for each note and include in the array
  let currentTime = 0;
  const millisecondsPerBeat = (60 / tempo) * 1000; // BPM to milliseconds per beat conversion

  // Function to play the song


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
      for (let i = 0; i < formattedNotesRef.current.length; i++) {
        const { note, duration } = formattedNotesRef.current[i];
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
    localStorage.setItem('selectedSheetMusic', newFile);
    // console.log(newFile)

    // Update song name when file is selected
    const songName = newFile.split('.')[0] // Get the song name from the file name
      .replace('/', '') // Remove the leading slash
    setSong(songName);
    localStorage.setItem('selectedSong', songName);
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
        if (startCoachingTimerRef.current == true) {
          console.log("starting coaching timer");
          coachingStartRef.current = Date.now();
          startCoachingTimerRef.current = false;
        }

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
          const coachingStartTime = coachingStartRef.current ? start - coachingStartRef.current : 0;
          console.log(`now: ${Date.now()}`)
          console.log(`coaching start: ${coachingStartRef.current}`)
          console.log(`poopy2: ${coachingStartTime}`)
          console.log(`Pressed '${key}' for ${duration} milliseconds`);

          noteHistoryRef.current.push({
            note: note,
            duration: duration,
            time: coachingStartTime
          });

          console.log(`note history: ${noteHistoryRef.current}`);
  
          const coachingEndTime = coachingStartTime + duration

          setAccuracy(calculateAccuracy(noteHistoryRef.current));
          const iou = calculateIou(coachingStartTime, coachingEndTime)

          iouListRef.current.push(iou);
          const sumIou = iouListRef.current.reduce((partialSum, a) => partialSum + a, 0);
          const avgIou = sumIou / iouListRef.current.length;
          setAvgIou(avgIou);
          console.log(`iou list: ${iouListRef.current}`);
          console.log(`avg iou: ${avgIou}`);

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
      coachingStartRef.current = null;
      setAccuracy(calculateAccuracy(noteHistoryRef.current));
      setShowMetrics(true);
      setIsCoachingActive(false);
    } else {
      startCoachingTimerRef.current = true
      iouListRef.current = [];
      noteHistoryRefOld.current = noteHistoryRef.current;
      noteHistoryRef.current = [];
      setAvgIou(0.0);
      setShowMetrics(false);
      setIsCoachingActive(true);

      // setIsSongPlaying(true);
      // playSong();
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
    const metronome = new Tone.MembraneSynth().toDestination();
    transport.scheduleRepeat(() => {
      metronome.triggerAttackRelease('C1', '8n');
    }, '4n');
  }, []);


  return (
    <div>
    <div className="max-w-full mx-auto px-4 py-8 flex flex-col sm:flex-row">
      {/* Sheet music container */}
      <div className="w-full sm:w-1/2 mb-4 sm:mb-0 pr-4">
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
            className={`btn btn-primary ${isMetronomeActive ? 'btn-error' : 'btn-primary'}`}
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
      <div className="w-full sm:w-1/2 overflow-hidden pl-4">
        {/* Metronome toggle */}
      

        {/* Metronome tempo control */}
        <div className="flex items-center">
          {/* Text box for exact tempo */}
          
          {/* Sliding bar */}
          <input
            id="tempo-slider"
            type="range"
            min="60"
            max="200"
            value={tempo}
            onChange={handleTempoChange}
            className="w-full mr-10"
          />
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

        </div>

        <div className='mt-4 flex items-center'>
          <button
            onClick={toggleMetronome}
            className={`btn ${isMetronomeActive ? 'btn-error' : 'btn-primary'} `}
            >
            {isMetronomeActive ? 'Stop Metronome' : 'Start Metronome'}
          </button>

        </div>

        <Keyboard octave={octave} setOctave={setOctave} />

        <div className="mt-4 flex items-center">
          <button
            onClick={toggleCoaching}
            className={`btn ${isCoachingActive ? 'btn-error' : 'btn-primary'} `}
            >
            {isCoachingActive ? 'Stop Coaching' : 'Start Coaching'}
            </button>
        </div>

        <div className="space-y-4 mt-4">
          <div className="flex flex-col items-start space-y-2">
            {showMetrics ? (
              <div>
                <div className="text-lg font-semibold">Rhythm Metrics:</div>
                <div className="text-xl text-gray-700">
                  {(avgIou && !isNaN(avgIou)) ? (avgIou * 100).toFixed(2) + '%' : '0%'}
                </div>
              </div>
            ) : !isCoachingActive ? (
              <div className="text-xl text-gray-700">
                Please complete a coaching session to view your rhythm metrics and note accuracy.
              </div>
            ) : (
              <div>
                <div className="text-xl text-gray-700">You got this!</div>
                <div className="text-lg font-semibold">Rhythm Metrics:</div>
                <div className="text-xl text-gray-700">
                  {(avgIou && !isNaN(avgIou)) ? (avgIou * 100).toFixed(2) + '%' : '0%'}
                </div>
                <div className="text-lg font-semibold">Note Accuracy:</div>
                <div className="text-xl text-gray-700">
                  {(accuracy && !isNaN(accuracy)) ? (accuracy * 100).toFixed(2) + '%' : '0%'}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start space-y-2">
            {showMetrics && (
              <div>
                <div className="text-lg font-semibold">Note Accuracy:</div>
                <div className="text-xl text-gray-700">
                  {showMetrics ? 
                    (isNaN(accuracy) ? '0.00%' : (accuracy * 100).toFixed(2) + '%') 
                  : ''}
                </div>
              </div>
            )}
          </div>
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
        className="bg-gray-700 p-2 rounded-full fixed bottom-4 right-4 z-50 flex justify-center items-center cursor-pointer shadow-lg transition-transform transform hover:scale-105"
        >
        <img src="/gemini_icon.png" alt="Chat" className="h-10 w-10" />

      </button>
      

    </div>

    <div className="absolute left-0 bottom-0 ml-8">
      <button
        className="btn btn-neutral px-6 py-3 text-lg"
        onClick={() => navigate('/')}
      >
        Back Home
      </button>
    </div>
   </div>
    
  );
}

export default SheetMusicOSMD;
