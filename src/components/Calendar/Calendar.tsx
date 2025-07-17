import { useState, useEffect, useCallback } from 'react';
import { monthNames, weekDayNames } from '../../data/data';
import {
  updateProgress,
  saveProgressToLocalStorage,
  loadProgressFromLocalStorage,
  setNumberOfGoals,
} from '../Progress/progress';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [goalsCount, setGoalsCount] = useState(6);

  // Função para avançar/voltar o mês
  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      if (direction === 'prev') {
        if (prevMonth === 0) {
          setCurrentYear(y => y - 1);
          return 11;
        }
        return prevMonth - 1;
      } else {
        if (prevMonth === 11) {
          setCurrentYear(y => y + 1);
          return 0;
        }
        return prevMonth + 1;
      }
    });
  }, []);

  // Lógica para gerar os dias do calendário e os checkboxes
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Efeito para definir o número de metas no módulo de progresso (se aplicável)
  useEffect(() => {
    setNumberOfGoals(goalsCount);
  }, [goalsCount]);

  // Handler para quando um checkbox é ticado/desticado
  const handleCheckboxChange = useCallback(() => {
    const calendarGridElement = document.getElementById('calendar-grid');
    if (calendarGridElement) {
      saveProgressToLocalStorage(currentYear, currentMonth, calendarGridElement);
      updateProgress();
    }
  }, [currentYear, currentMonth]);

  // Efeito para carregar o progresso do localStorage quando o mês/ano muda
  useEffect(() => {
    const calendarGridElement = document.getElementById('calendar-grid');
    if (calendarGridElement) {
      loadProgressFromLocalStorage(calendarGridElement, currentYear, currentMonth);
      updateProgress();
    }
  }, [currentMonth, currentYear]);

  return (
    <div className="calendar-section">
      <div className="calendar-wrapper">
        {/* Input para alterar o número de metas dinamicamente */}
        <div className="calendar-goals-input">
          <label htmlFor="goals-count-input">Número de metas: </label>
          <input
            id="goals-count-input"
            type="number"
            min={1}
            max={20}
            value={goalsCount}
            onChange={e => setGoalsCount(Number(e.target.value))}
          />
        </div>
        <div className="calendar-navigation">
          <button onClick={() => handleMonthChange('prev')}>Anterior</button>
          <h2>
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button onClick={() => handleMonthChange('next')}>Próximo</button>
        </div>
        <div className="calendar-scroll-container">
          <div className="calendar-header">
            {/* Renderiza os nomes e números dos dias dinamicamente */}
            {calendarDays.map((day) => {
              const date = new Date(currentYear, currentMonth, day);
              const dayName = weekDayNames[date.getDay()];
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <>
                  <div key={`name-${day}`} className={`calendar-day-name${isWeekend ? ' weekend' : ''}`}>
                    {dayName}
                  </div>
                  <div key={`num-${day}`} className={`calendar-day-number-header${isWeekend ? ' weekend' : ''}`}>
                    {day}
                  </div>
                </>
              );
            })}
          </div>
          <div id="calendar-grid" className="calendar-grid">
            {/* Renderiza os checkboxes para cada dia e meta */}
            {calendarDays.map((day) =>
              Array.from({ length: goalsCount }).map((_, goalIndex) => {
                const dateId = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const checkboxId = `checkbox-${dateId}-goal${goalIndex}`;
                return (
                  <div key={checkboxId} className="calendar-cell">
                    <input
                      type="checkbox"
                      id={checkboxId}
                      data-date={dateId}
                      onChange={handleCheckboxChange}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;