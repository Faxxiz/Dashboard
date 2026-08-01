import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SportsHomePage from './pages/SportsHomePage';
import F1DashboardPage from './pages/F1DashboardPage';
import SeasonResultsPage from './pages/SeasonResultsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SportsHomePage />} />
        <Route path="/f1" element={<F1DashboardPage />} />
        <Route path="/f1/seasons/:year" element={<SeasonResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
