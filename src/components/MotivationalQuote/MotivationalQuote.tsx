// react-frontend/src/components/MotivationalQuote/MotivationalQuote.tsx
import { useState, useEffect } from 'react';
import quotesData from '../../../public/quotes.json'; // Importa o JSON diretamente

interface Quote {
  quote: string;
  author: string;
}

export function MotivationalQuote() {
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const quotes: Quote[] = quotesData; // Assume que quotesData é um array de Quote

      if (quotes && quotes.length > 0) {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 0);
        const diff = today.getTime() - startOfYear.getTime(); // Use .getTime() para diferença em ms
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const quoteIndex = (dayOfYear - 1 + quotes.length) % quotes.length;
        setDailyQuote(quotes[quoteIndex]);
      } else {
        setDailyQuote(null);
        setError('Não foi possível carregar as frases motivacionais do arquivo.');
      }
    } catch (err) {
      console.error('Erro ao carregar frases motivacionais:', err);
      setError('Erro ao carregar a frase motivacional do dia. Verifique o arquivo quotes.json.');
    }
  }, []); // Array de dependências vazio para executar apenas uma vez no montagem do componente

  return (
    <div className="motivational-section">
      <h3>MOTIVACIONAL DO DIA 🎉</h3>
      {dailyQuote ? (
        <p>{dailyQuote.quote} - {dailyQuote.author}</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <p>Carregando frase motivacional...</p>
      )}
    </div>
  );
}