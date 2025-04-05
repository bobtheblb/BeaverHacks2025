import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router';

// Pages
import Home from './pages/Home';
import KeyboardTest from './pages/KeyboardTest'

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/keyboard" element={<KeyboardTest />} /> 
    </Routes>
  );
}

export default App;