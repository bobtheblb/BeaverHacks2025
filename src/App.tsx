
import './App.css'

import { Routes, Route } from 'react-router';

// Pages
import Home from './pages/Home';
import Tone from './pages/Tone';
import Rhythm from './pages/Rhythm';
import Sheets from './pages/Sheets';
import KeyboardTest from './pages/KeyboardTest'

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/keyboard" element={<KeyboardTest />} /> 
      <Route path="/tone" element={<Tone />} />
      <Route path="/rhythm" element={<Rhythm />} />
      <Route path="/sheets" element={<Sheets />} />
    </Routes>
  );
}

export default App;
