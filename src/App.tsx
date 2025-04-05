import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { SheetMusicOSMD } from "./Sheets";

function App() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Sheet Music</h1>

      {/* Sheet music viewer component
      <SheetMusicOSMD /> */}

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <div className="card">
        <p>Edit <code>src/App.tsx</code> and save to test HMR</p>
      </div>
    </>

import { useEffect, useState } from 'react'
import Keyboard from './Keyboard.tsx'
import { Routes, Route } from 'react-router';


// Pages
import Home from './pages/Home';
import Rhythm from './pages/Rhythm';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rhythm" element={<Rhythm />} />
    </Routes>

  );
}

export default App;