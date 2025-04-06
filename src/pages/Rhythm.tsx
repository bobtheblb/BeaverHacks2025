import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Tone from 'tone';

const Rhythm = () => {
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Set BPM (beats per minute)
    Tone.Transport.bpm.value = 60;
    // Create a simple synth for the metronome tick
    const synth = new Tone.MembraneSynth().toDestination();

    // Schedule a repeating metronome tick every quarter note ("4n")
    const tickCallback = (time: number) => {
      synth.triggerAttackRelease("C2", "8n", time);
    };

    const loopId = Tone.Transport.scheduleRepeat(tickCallback, "4n");

    // Start the Tone.Transport if not already started
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }

    // Cleanup: remove scheduled tick on component unmount
    return () => {
      Tone.Transport.clear(loopId);
    };
  }, []);

  useEffect(() => {
    // Listen for the space bar press
    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        // Get current time in seconds from the metronome
        const now = Tone.Transport.seconds;
        // Determine the interval (in seconds) of a quarter note
        const interval = Tone.Time("4n").toSeconds();
        // Calculate how far into the current beat we are
        const remainder = now % interval;
        // Determine the minimal error (distance from nearest tick)
        const error = remainder < interval / 2 ? remainder : interval - remainder;
        // Convert error to milliseconds
        const errorMs = error * 1000;
        setFeedback(`Your timing error: ${errorMs.toFixed(1)} ms`);
      }
    };

    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Practice Mode</h1>
      <p className="mb-4">Tap the space bar in sync with the metronome.</p>
      <div className="mt-4">
        <p className="text-xl">{feedback}</p>
      </div>
      {/* Optional: A button to navigate back to home or another page */}
      <div className="mt-8">
        <button
          className="btn btn-neutral px-6 py-3 text-lg"
          onClick={() => navigate('/')}
        >
          Back Home
        </button>
      </div>
    </div>
  );
};

export default Rhythm;