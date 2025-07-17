// react-frontend/src/progress.ts (ou progress.js)
// Este é um exemplo simplificado, adapte com o conteúdo exato do seu progress.js original

let numberOfGoalsGlobal: number; // Variável global para armazenar o número de metas

export function setNumberOfGoals(count: number) {
  numberOfGoalsGlobal = count;
  // Define a variável CSS para o cálculo dinâmico da altura no calendar.css
  document.documentElement.style.setProperty('--num-goals', count.toString());
}

export function updateProgress() {
  const calendarGrid = document.getElementById('calendar-grid');
  const weeklyProgressSpan = document.getElementById('weekly-progress');
  const mainProgressBar = document.querySelector('.main-progress-bar') as HTMLElement;
  const dayProgressBars = document.querySelectorAll('.day-progress-bars .bar') as NodeListOf<HTMLElement>;
  const dayProgressLabels = document.querySelectorAll('.day-progress-labels span') as NodeListOf<HTMLElement>;

  if (!calendarGrid || !weeklyProgressSpan || !mainProgressBar || dayProgressBars.length === 0 || dayProgressLabels.length === 0) {
    console.warn("Elementos do progresso não encontrados. Verifique o HTML ou a ordem de execução.");
    return;
  }

  let totalCheckedGoalsCurrentMonth = 0;
  // Inicializa com 7 zeros para os 7 dias da semana (0=Dom, 6=Sáb)
  const dailyCheckedCounts = Array(7).fill(0);

  const checkboxes = calendarGrid.querySelectorAll('input[type="checkbox"]');

  if (checkboxes.length === 0 || numberOfGoalsGlobal === 0) {
    weeklyProgressSpan.textContent = `0%`;
    mainProgressBar.style.width = `0%`;
    dayProgressBars.forEach(bar => bar.style.height = `0%`);
    dayProgressLabels.forEach(label => label.textContent = `0%`);
    return;
  }

  // Obter o número de dias no mês atual a partir dos checkboxes
  const datesInMonth = new Set<string>();
  checkboxes.forEach(checkbox => {
    const date = (checkbox as HTMLInputElement).dataset.date;
    if (date) {
      datesInMonth.add(date);
    }
  });
  const totalDaysInMonth = datesInMonth.size;

  checkboxes.forEach(checkbox => {
    const htmlCheckbox = checkbox as HTMLInputElement;
    if (htmlCheckbox.checked) {
      totalCheckedGoalsCurrentMonth++;
      const dateString = htmlCheckbox.dataset.date;
      if (dateString) {
        const dateParts = dateString.split('-');
        // month - 1 porque o mês em Date é 0-indexado
        const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        dailyCheckedCounts[date.getDay()]++; // date.getDay() retorna 0 para Dom, 1 para Seg, etc.
      }
    }
  });

  const totalPossibleGoals = numberOfGoalsGlobal * totalDaysInMonth; // Total de metas possíveis em todo o mês

  const weeklyProgress = totalPossibleGoals > 0
    ? (totalCheckedGoalsCurrentMonth / totalPossibleGoals) * 100
    : 0;

  weeklyProgressSpan.textContent = `${weeklyProgress.toFixed(0)}%`;
  mainProgressBar.style.width = `${weeklyProgress}%`;

  // Atualiza as barras de progresso diárias
  // O mapeamento de dayProgressBars para dailyCheckedCounts depende de como seus HTML bars estão configurados
  // Assumimos que bar-0 é Dom, bar-1 é Seg, etc.
  dayProgressBars.forEach((bar, index) => {
    const totalGoalsToday = numberOfGoalsGlobal; // Para um dia específico, o total possível é o número de metas
    const dailyProgress = totalGoalsToday > 0
      ? (dailyCheckedCounts[index] / totalGoalsToday) * 100
      : 0;
    bar.style.height = `${dailyProgress}%`;

    // Atualiza os labels de progresso diário
    if (dayProgressLabels[index]) {
      dayProgressLabels[index].textContent = `${dailyProgress.toFixed(0)}%`;
    }
  });
}

export function saveProgressToLocalStorage(year: number, month: number, calendarGrid: HTMLElement) {
  const checkboxStates: { [key: string]: boolean } = {};
  const allCheckboxesInMonth = calendarGrid.querySelectorAll('input[type="checkbox"]');
  allCheckboxesInMonth.forEach(checkbox => {
    checkboxStates[checkbox.id] = (checkbox as HTMLInputElement).checked;
  });
  localStorage.setItem(`calendarProgress-${year}-${month}`, JSON.stringify(checkboxStates));
}

export function loadProgressFromLocalStorage(calendarGrid: HTMLElement, year: number, month: number) {
  const savedProgress = localStorage.getItem(`calendarProgress-${year}-${month}`);
  if (savedProgress) {
    const checkboxStates = JSON.parse(savedProgress);
    const allCheckboxesInMonth = calendarGrid.querySelectorAll('input[type="checkbox"]');
    allCheckboxesInMonth.forEach(checkbox => {
      (checkbox as HTMLInputElement).checked = checkboxStates[checkbox.id] === true;
    });
  } else {
    // Se não houver progresso salvo, desmarca todos os checkboxes para evitar estados antigos
    const allCheckboxesInMonth = calendarGrid.querySelectorAll('input[type="checkbox"]');
    allCheckboxesInMonth.forEach(checkbox => {
      (checkbox as HTMLInputElement).checked = false;
    });
  }
}