import { useEffect, useState } from 'react'
import { Stage, Layer, Rect, Circle } from 'react-konva';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function Canvas() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect x={20} y={20} width={100} height={100} fill="blue" draggable />
        <Circle x={150} y={150} radius={50} fill="red" draggable />
      </Layer>
    </Stage>
  );
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Canvas></Canvas>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
