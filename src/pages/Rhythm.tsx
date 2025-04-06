import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Tone from 'tone';
import { motion, useAnimation } from 'framer-motion';

const Rhythm = () => {
  const navigate = useNavigate();

  // State
  const [feedback, setFeedback] = useState('');
  const [bpm, setBpm] = useState(60);
  const [started, setStarted] = useState(false);

  // Refs & Controls
  const beatTimesRef = useRef<number[]>([]);
  const pulseControls = useAnimation();

  // Initialize metronome and pulse
  useEffect(() => {
    if (!started) return;

    Tone.Transport.bpm.value = bpm;
    const synth = new Tone.MembraneSynth().toDestination();

    const tickCallback = (time: number) => {
      synth.triggerAttackRelease("C2", "8n", time);
      beatTimesRef.current.push(time);

      Tone.Draw.schedule(() => {
        pulseControls.start({
          scale: [1, 1.25, 1],
          transition: { duration: 0.4, ease: 'easeInOut' },
        });
      }, time);
    };

    const loopId = Tone.Transport.scheduleRepeat(tickCallback, "4n");

    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }

    return () => {
      Tone.Transport.clear(loopId);
    };
  }, [started, bpm, pulseControls]);

  // Spacebar key listener for tapping
  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || !started) return;
      e.preventDefault();

      const now = Tone.now();
      const beatTimes = beatTimesRef.current;

      let signedDiff = 0;
      let smallestAbsDiff = Infinity;

      for (const beatTime of beatTimes) {
        let diff = now - beatTime;
        if (diff > 0.9) diff -= 1.0;

        const absDiff = Math.abs(diff);
        if (absDiff < smallestAbsDiff) {
          smallestAbsDiff = absDiff;
          signedDiff = diff;
        }
      }

      // Remove old beats
      while (beatTimes.length > 0 && beatTimes[0] < now - 1) {
        beatTimes.shift();
      }

      const errorMs = signedDiff * 1000;
      const rating = Math.abs(errorMs) <= 150 ? '🎯 Great!' : '❌ Miss';
      const sign = errorMs >= 0 ? '+' : '-';

      setFeedback(`${rating} (${sign}${Math.abs(errorMs).toFixed(1)} ms)`);
    };

    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [started]);

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBpm(Number(e.target.value));
  };

  const toggleMetronome = async () => {
    if (!started) {
      await Tone.start();
      await Tone.Transport.start();
      setStarted(true);
    } else {
      Tone.Transport.stop();
      setStarted(false);
      beatTimesRef.current = []; // optional: clear timing data
      setFeedback('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl md:text-6xl font-borel font-extrabold mb-6">rhythm trainer</h1>

      <div className="tabs tabs-lift mb-4 w-sm sm:w-xl md:w-3xl">
        {/* Practice Tab */}
        <input type="radio" name="my_tabs_3" className="tab" aria-label="Practice" defaultChecked />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <p className="mb-4">Tap the space bar in sync with the metronome.</p>

          {/* BPM Control */}
          <div className="mb-6">
            <label className="label justify-center mr-2">
              <span className="label-text text-lg">BPM: {bpm}</span>
            </label>
            <input
              type="range"
              min="40"
              max="120"
              value={bpm}
              onChange={handleBpmChange}
              className="range range-neutral w-full max-w-xs mx-auto"
              disabled={!started}
            />
            <div className="flex justify-between text-xs px-2 w-full max-w-xs mx-auto">
              <span>40</span>
              <span>55</span>
              <span>80</span>
              <span>110</span>
            </div>
          </div>

          {/* Start Button */}
          <button className="btn btn-primary mb-6" onClick={toggleMetronome}>
            {started ? 'Stop Metronome' : 'Start Metronome'}
          </button>

          {/* Beat Pulse */}
          <div className="flex items-center justify-center">
            <motion.div
              className="w-16 h-16 bg-neutral rounded-full"
              animate={started ? pulseControls : {}}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Feedback Display */}
          {started && (
            <div className="mt-4">
              <p className="text-xl">{feedback}</p>
            </div>
          )}
        </div>

        {/* Placeholder Tabs */}
        <input type="radio" name="my_tabs_3" className="tab" aria-label="Measure View" />
        <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>

        <input type="radio" name="my_tabs_3" className="tab" aria-label="Game View" />
        <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 3</div>
      </div>

      {/* Navigation */}
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