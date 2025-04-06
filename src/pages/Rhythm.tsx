import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Tone from 'tone';

const Rhythm = () => {
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();
  const beatTimesRef = useRef<number[]>([]);

  useEffect(() => {
    Tone.Transport.bpm.value = 60;
    const synth = new Tone.MembraneSynth().toDestination();

    const tickCallback = (time: number) => {
      synth.triggerAttackRelease("C2", "8n", time);
      beatTimesRef.current.push(time);
    };

    const loopId = Tone.Transport.scheduleRepeat(tickCallback, "4n");

    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }

    return () => {
      Tone.Transport.clear(loopId);
    };
  }, []);

  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();

      const now = Tone.now();
      const beatTimes = beatTimesRef.current;

      let closest: number | null = null;
      let signedDiff = 0;
      let smallestAbsDiff = Infinity;

      for (const beatTime of beatTimes) {
        let diff = now - beatTime;

        // If it's more than 900ms late, consider it early for the next beat
        if (diff > 0.9) {
          diff -= 1.0;
        }

        const absDiff = Math.abs(diff);
        if (absDiff < smallestAbsDiff) {
          smallestAbsDiff = absDiff;
          signedDiff = diff;
          closest = beatTime;
        }
      }

      // Clean up old beats
      while (beatTimes.length > 0 && beatTimes[0] < now - 1) {
        beatTimes.shift();
      }

      const errorMs = signedDiff * 1000;
      const sign = errorMs >= 0 ? '+' : '-';
      const rating = Math.abs(errorMs) <= 150 ? '🎯 Great!' : '❌ Miss';

      setFeedback(`${rating} (${sign}${Math.abs(errorMs).toFixed(1)} ms)`);
    };

    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">

        <h1 className="text-4xl md:text-6xl font-borel font-extrabold mb-6">rhythm trainer</h1>

        <div className="tabs tabs-lift mb-4 w-4xl">
          <input type="radio" name="my_tabs_3" className="tab" aria-label="Practice" defaultChecked/>
          <div className="tab-content bg-base-100 border-base-300 p-6">
            <p className="mb-4">Tap the space bar in sync with the metronome.</p>

            <div className="mt-4">
              <p className="text-xl">{feedback}</p>
            </div>

          </div>

          <input type="radio" name="my_tabs_3" className="tab" aria-label="Tab 2"  />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            Tab content 2
          </div>

          <input type="radio" name="my_tabs_3" className="tab" aria-label="Tab 3" />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            Tab content 3
          </div>
        </div>

        
        
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