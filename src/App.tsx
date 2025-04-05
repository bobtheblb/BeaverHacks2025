import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import './App.css'

function App() {
  const [started, setStarted] = useState(false)
  const middleC = 'C4'
  const noteLength = '8n'

  const handleKeyDown = async (event) => {
    if (event.key === ' ') {
      if (!started) {
        await Tone.start()
        setStarted(true)
        console.log('Audio context started')
      }

      const synth = new Tone.PolySynth().toDestination()
      synth.triggerAttackRelease(middleC, noteLength)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [started])
  
  return (
    <>
      <h1>Deus</h1>
      <div className="card">
        <p>press space</p>
      </div>
    </>
  )
}

export default App
