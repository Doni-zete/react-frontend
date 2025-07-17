// react-frontend/src/components/Goals/Goals.tsx
import { useState, useEffect } from 'react';
// Remova ou ajuste esta linha em Goals.tsx
import { initialGoals } from '../../data/data'; // correto// Importa as metas iniciais

interface Goal {
  id: number;
  text: string;
  checked: boolean;
}

export function Goals() {
  // Carrega as metas do localStorage ou usa as metas iniciais
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const savedGoals = localStorage.getItem('myGoals');
      return savedGoals ? JSON.parse(savedGoals) : initialGoals;
    } catch (error) {
      console.error("Erro ao carregar metas do localStorage:", error);
      return initialGoals;
    }
  });

  // Salva as metas no localStorage sempre que elas mudam
  useEffect(() => {
    localStorage.setItem('myGoals', JSON.stringify(goals));
  }, [goals]);

  const handleGoalClick = (id: number) => {
    setGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === id ? { ...goal, checked: !goal.checked } : goal
      )
    );
  };

  return (
    <div className="goals-section">
      <h2>Minhas Metas 🎯</h2>
      <ul id="goal-list">
        {goals.map(goal => (
          <li key={goal.id} className={goal.checked ? 'checked' : ''}>
            {/* O span "checkbox-icon" será o seu checkbox visual, que você já tem no CSS */}
            <span
              className="checkbox-icon"
              onClick={() => handleGoalClick(goal.id)}
            ></span>
            <span className="goal-text">{goal.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}