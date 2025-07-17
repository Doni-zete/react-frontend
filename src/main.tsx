import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Importe seus arquivos CSS existentes aqui
import './assets/css/base.css';
import './assets/css/layout.css';
import './assets/css/motivational.css';
import './assets/css/progress.css';
import './assets/css/goals.css';
import './assets/css/calendar.css';
import './assets/css/responsive.css';
import './assets/css/excel_importer.css'; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
