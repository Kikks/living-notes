import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Note from './pages/Note';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/note/:code" element={<Note />} />
      </Routes>
    </Router>
  );
}

export default App;
