import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import ExcelManager from './components/ExcelManager/ExcelManager';
import Relatorio from './components/Relatorio/Relatorio';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/excel" element={<ExcelManager />} />
      <Route path="/relatorio" element={<Relatorio />} />

    </Routes>
  </BrowserRouter>
);

export default App;