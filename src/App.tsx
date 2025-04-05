import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useEffect, useState } from 'react'
import Keyboard from './Keyboard.tsx'
import { BrowserRouter, Routes, Route } from 'react-router';

// Pages
import Home from './pages/Home';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;