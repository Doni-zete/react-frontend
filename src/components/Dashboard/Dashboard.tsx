import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Goals } from '../Goals/Goals';
import Calendar from '../Calendar/Calendar';
import { updateProgress } from '../Progress/progress';

export default function Dashboard() {
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [motivationalAuthor, setMotivationalAuthor] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('quotes.json');
        const quotes = await response.json();
        if (quotes && quotes.length > 0) {
          const today = new Date();
          const startOfYear = new Date(today.getFullYear(), 0, 0);
          const diff = today.getTime() - startOfYear.getTime();
          const oneDay = 1000 * 60 * 60 * 24;
          const dayOfYear = Math.floor(diff / oneDay);

          const quoteIndex = (dayOfYear - 1 + quotes.length) % quotes.length;
          const dailyQuote = quotes[quoteIndex];
          setMotivationalQuote(dailyQuote.quote);
          setMotivationalAuthor(dailyQuote.author);
        } else {
          setMotivationalQuote("Não foi possível carregar as frases motivacionais do arquivo.");
          setMotivationalAuthor("");
        }
      } catch (error) {
        console.error('Erro ao carregar frases motivacionais:', error);
        setMotivationalQuote("Erro ao carregar a frase motivacional do dia. Verifique o arquivo quotes.json.");
        setMotivationalAuthor("");
      }
    };

    fetchQuote();
    updateProgress();
  }, []);

  return (
    <div className="container">
      <div className="top-section-wrapper">
        <div className="motivational-section">
          <h3>MOTIVACIONAL DO DIA 🎉</h3>
          <p>{motivationalQuote} - {motivationalAuthor}</p>
        </div>
        <div className="progress-container">
          <div className="progress-section">
            <h2>Progresso Semanal (%) <span id="weekly-progress">0%</span></h2>
            <div className="progress-bars">
              <div className="main-progress-bar" style={{ width: '0%' }}></div>
              <div className="day-progress-bars">
                <div className="bar bar-0"></div>
                <div className="bar bar-1"></div>
                <div className="bar bar-2"></div>
                <div className="bar bar-3"></div>
                <div className="bar bar-4"></div>
                <div className="bar bar-5"></div>
                <div className="bar bar-6"></div>
              </div>
              <div className="day-progress-labels">
                <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="goals-and-calendar-section">
        <Goals />
        <Calendar />
      </div>

      <div className="action-buttons-section">
        <button onClick={() => navigate('/excel')}>
          Importar/Exportar Planilha
        </button>

        <button onClick={() => navigate('/relatorio')}>
          Gerar Relatório
        </button>
      </div>
    </div>
  );
}