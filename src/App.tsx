import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
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