import React, { useEffect, useState } from 'react';
import * as Tone from 'tone';

const App = () => {
  const [synth] = useState(new Tone.Synth().toDestination());
  const [isPlaying, setIsPlaying] = useState(false);
  const [pressStartTime, setPressStartTime] = useState(null);
  const [currentNote, setCurrentNote] = useState('');
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [tempo, setTempo] = useState(120); 
  const [noteTimerStart, setNoteTimerStart] = useState(null);

  const keyToNoteMap = {
    'a': 'C4',
    's': 'D4',
    'd': 'E4',
    'f': 'F4',
    'g': 'G4',
    'h': 'A4',
    'j': 'B4',
    'k': 'C5',
  };

  // Metronome setup
  const metronome = new Tone.MembraneSynth().toDestination();
  const transport = Tone.Transport;
  transport.bpm.value = tempo;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const note = keyToNoteMap[event.key];
      if (note && !isPlaying) {
        setIsPlaying(true);
        setPressStartTime(Date.now());
        setCurrentNote(note);
        synth.triggerAttack(note);

        if (noteTimerStart === null) {
          setNoteTimerStart(Date.now());
        }
      }
    };

    const handleKeyUp = (event) => {
      const note = keyToNoteMap[event.key];
      if (note && isPlaying) {
        const pressDuration = Date.now() - pressStartTime;
        console.log(`Pressed '${event.key}' for ${pressDuration} milliseconds`);

        setIsPlaying(false);
        synth.triggerRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, pressStartTime, synth, noteTimerStart]);

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
      <h1>Press keys to play notes</h1>
      <p>{isPlaying ? `Note ${currentNote} is playing...` : 'Press and hold a key to play a note'}</p>
      <p>Use the following keys to play:</p>
      <ul>
        <li>A = C4</li>
        <li>S = D4</li>
        <li>D = E4</li>
        <li>F = F4</li>
        <li>G = G4</li>
        <li>H = A4</li>
        <li>J = B4</li>
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

      {/* Display the timer */}
      {noteTimerStart && (
        <div>
          <p>Timer started at: {new Date(noteTimerStart).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};

export default App;
