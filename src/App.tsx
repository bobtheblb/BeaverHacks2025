
import './App.css'

import { Routes, Route } from 'react-router';

// Pages
import Home from './pages/Home';
import Rhythm from './pages/Rhythm';
import Sheets from './pages/Sheets';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rhythm" element={<Rhythm />} />
      <Route path="/sheets" element={<Sheets />} />

    </Routes>
    

  );
}

export default App;