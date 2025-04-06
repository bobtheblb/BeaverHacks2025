import { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import Keyboard from '../Keyboard.tsx';

const App = () => {
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [noteTimerStart, setNoteTimerStart] = useState(null);
  const [heldNotes, setHeldNotes] = useState([]);

  const keyToNoteMap = {
    'a': 'C4',
    'w': 'C#4',
    's': 'D4',
    'e': 'D#4',
    'd': 'E4',
    'f': 'F4',
    't': 'F#4',
    'g': 'G4',
    'y': 'G#4',
    'h': 'A4',
    'u': 'A#4',
    'j': 'B4',
    'k': 'C5',
  };

  // Metronome setup
  const metronome = new Tone.MembraneSynth().toDestination();
  const transport = Tone.Transport;
  transport.bpm.value = tempo;

  // Store synths and press start times per key
  const activeSynths = useRef({});
  const pressStartTimes = useRef({});

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const note = keyToNoteMap[key];

      if (note && !activeSynths.current[key]) {
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttack(note);
        activeSynths.current[key] = synth;
        pressStartTimes.current[key] = Date.now();
        setHeldNotes((prev) => [...prev, note]);

        if (noteTimerStart === null) {
          setNoteTimerStart(Date.now());
        }
      }
    };

    const handleKeyUp = (event) => {
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
  }, [noteTimerStart]);

  const toggleMetronome = () => {
    if (isMetronomeActive) {
      transport.stop();
      setIsMetronomeActive(false);
    } else {
      transport.start();
      setIsMetronomeActive(true);
    }
  };

  const handleTempoChange = (event) => {
    setTempo(event.target.value);
    transport.bpm.value = event.target.value;
  };

  useEffect(() => {
    transport.scheduleRepeat(() => {
      metronome.triggerAttackRelease('C1', '8n');
    }, '4n');
  }, []);

  return (
    <div>
      <Keyboard />

      <h1>Press keys to play notes</h1>
      <p>
        {heldNotes.length > 0
          ? `Currently playing: ${heldNotes.join(', ')}`
          : 'Press and hold a key to play a note'}
      </p>
      <p>Use the following keys to play:</p>
      <ul>
        <li>A = C4</li>
        <li>S = D4</li>
        <li>D = E4</li>
        <li>F = F4</li>
        <li>G = G4</li>
        <li>H = A4</li>
        <li>J = B4</li>
        <li>K = C5</li>
      </ul>

      <pre>
        {`
  Key:  a  a  g  g  h  h  g
  Notes: C4 C4 G4 G4 A4 A4 G4
  Lyrics: Twinkle, twinkle, little star

  Key:  f  f  d  d  s  s  a
  Notes: F4 F4 E4 E4 D4 D4 C4
  Lyrics: How I wonder what you are

  Key:  g  g  f  f  d  d  s
  Notes: G4 G4 F4 F4 E4 E4 D4
  Lyrics: Up above the world so high

  Key:  g  g  f  f  d  d  s
  Notes: G4 G4 F4 F4 E4 E4 D4
  Lyrics: Like a diamond in the sky

  Key:  a  a  g  g  h  h  g
  Notes: C4 C4 G4 G4 A4 A4 G4
  Lyrics: Twinkle, twinkle, little star

  Key:  f  f  d  d  s  s  a
  Notes: F4 F4 E4 E4 D4 D4 C4
  Lyrics: How I wonder what you are
        `}
      </pre>

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

      <div>
        <label htmlFor="tempo">Set Tempo (BPM):</label>
        <input
          id="tempo"
          type="number"
          value={tempo}
          onChange={handleTempoChange}
          min="60"
          max="200"
        />
      </div>

      {noteTimerStart && (
        <div>
          <p>Timer started at: {new Date(noteTimerStart).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};

export default App;
