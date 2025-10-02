const STORAGE_KEY = 'activate_v2';
const initialData = {
  tasks: [],
  ideas: [],
  timer: { focus: 25, short: 5, long: 15, cycles: 4 },
  log: [],
  activeTaskId: null,
};

const clone = (value) =>
  typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));

const state = loadState();

let editingTaskId = null;
let timerInterval = null;
let completedFocusInCycle = 0;
const timerState = {
  mode: 'focus',
  remaining: state.timer.focus * 60,
  running: false,
};

const selectors = {
  navButtons: document.querySelectorAll('[data-scroll]'),
  taskForm: document.getElementById('form-tarea'),
  board: document.querySelector('.board'),
  stats: document.getElementById('stats-tareas'),
  summary: document.getElementById('resumen'),
  timerDisplay: document.getElementById('timer-display'),
  timerMode: document.getElementById('timer-mode'),
  startBtn: document.getElementById('btn-start'),
  pauseBtn: document.getElementById('btn-pause'),
  resetBtn: document.getElementById('btn-reset'),
  timerConfig: document.getElementById('form-config'),
  activeTask: document.getElementById('tarea-activa'),
  logList: document.getElementById('lista-log'),
  clearLogBtn: document.getElementById('btn-limpiar-log'),
  ideaForm: document.getElementById('form-idea'),
  ideaList: document.getElementById('lista-ideas'),
  summaryExport: document.getElementById('btn-exportar'),
  resetAll: document.getElementById('btn-restaurar'),
};

selectors.navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.scroll);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

selectors.board?.addEventListener('click', (event) => {
  const columnButton = event.target.closest('[data-clear]');
  if (columnButton) {
    const status = columnButton.dataset.clear;
    state.tasks = state.tasks.filter((task) => !(task.status === status && task.completed));
    saveState();
    renderTasks();
    renderSummary();
    return;
  }

  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) return;

  const taskElement = actionButton.closest('.task');
  const taskId = taskElement?.dataset.id;
  if (!taskId) return;

  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const action = actionButton.dataset.action;
  switch (action) {
    case 'complete':
      task.completed = !task.completed;
      if (!task.completed) {
        task.completedPomodoros = Math.min(task.completedPomodoros, task.estimate);
      }
      if (state.activeTaskId === task.id && task.completed) {
        state.activeTaskId = null;
        renderActiveTask();
      }
      break;
    case 'focus':
      state.activeTaskId = task.id;
      renderActiveTask();
      selectors.timerMode.textContent = 'Enfoque listo';
      if (!timerState.running) {
        timerState.mode = 'focus';
        timerState.remaining = state.timer.focus * 60;
        updateTimerDisplay();
      }
      break;
    case 'edit':
      fillTaskForm(task);
      break;
    case 'delete':
      state.tasks = state.tasks.filter((item) => item.id !== task.id);
      if (state.activeTaskId === task.id) {
        state.activeTaskId = null;
        renderActiveTask();
      }
      break;
    case 'increment':
      task.completedPomodoros = Math.min(task.completedPomodoros + 1, task.estimate);
      break;
    case 'decrement':
      task.completedPomodoros = Math.max(task.completedPomodoros - 1, 0);
      break;
    default:
      break;
  }
  saveState();
  renderTasks();
  renderSummary();
});

selectors.taskForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(selectors.taskForm);
  const title = formData.get('title')?.toString().trim();
  if (!title) return;

  const taskData = {
    title,
    status: formData.get('status')?.toString() || 'today',
    due: formData.get('due')?.toString() || null,
    estimate: clampNumber(parseInt(formData.get('estimate'), 10) || 1, 1, 8),
    notes: formData.get('notes')?.toString().trim() || '',
    priority: Boolean(formData.get('priority')),
  };

  if (editingTaskId) {
    const index = state.tasks.findIndex((task) => task.id === editingTaskId);
    if (index >= 0) {
      state.tasks[index] = {
        ...state.tasks[index],
        ...taskData,
      };
    }
    editingTaskId = null;
  } else {
    state.tasks.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completed: false,
      completedPomodoros: 0,
      ...taskData,
    });
  }

  selectors.taskForm.reset();
  selectors.taskForm.querySelector('input[name="title"]').focus();

  saveState();
  renderTasks();
  renderSummary();
});

selectors.taskForm?.addEventListener('reset', () => {
  editingTaskId = null;
});

selectors.timerConfig?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(selectors.timerConfig);
  state.timer = {
    focus: clampNumber(parseInt(formData.get('focus'), 10) || 25, 5, 60),
    short: clampNumber(parseInt(formData.get('short'), 10) || 5, 3, 30),
    long: clampNumber(parseInt(formData.get('long'), 10) || 15, 5, 45),
    cycles: clampNumber(parseInt(formData.get('cycles'), 10) || 4, 2, 8),
  };
  timerState.mode = 'focus';
  timerState.remaining = state.timer.focus * 60;
  completedFocusInCycle = 0;
  stopTimer();
  updateTimerDisplay();
  selectors.timerMode.textContent = 'Configuración actualizada';
  saveState();
});

selectors.timerConfig?.addEventListener('reset', () => {
  setTimeout(() => {
    selectors.timerConfig.querySelector('input[name="focus"]').value = initialData.timer.focus;
    selectors.timerConfig.querySelector('input[name="short"]').value = initialData.timer.short;
    selectors.timerConfig.querySelector('input[name="long"]').value = initialData.timer.long;
    selectors.timerConfig.querySelector('input[name="cycles"]').value = initialData.timer.cycles;
    state.timer = { ...initialData.timer };
    timerState.mode = 'focus';
    timerState.remaining = state.timer.focus * 60;
    completedFocusInCycle = 0;
    stopTimer();
    updateTimerDisplay();
    selectors.timerMode.textContent = 'Valores restaurados';
    saveState();
  });
});

selectors.startBtn?.addEventListener('click', () => {
  if (timerState.running) return;
  timerState.running = true;
  selectors.startBtn.disabled = true;
  selectors.pauseBtn.disabled = false;
  selectors.resetBtn.disabled = false;
  if (!timerInterval) {
    timerInterval = window.setInterval(tick, 1000);
  }
  selectors.timerMode.textContent = modeLabel(timerState.mode);
});

selectors.pauseBtn?.addEventListener('click', () => {
  if (!timerState.running) return;
  stopTimer();
  selectors.timerMode.textContent = 'Temporizador en pausa';
});

selectors.resetBtn?.addEventListener('click', () => {
  stopTimer();
  timerState.mode = 'focus';
  timerState.remaining = state.timer.focus * 60;
  completedFocusInCycle = 0;
  selectors.timerMode.textContent = 'Listo para comenzar';
  updateTimerDisplay();
});

selectors.clearLogBtn?.addEventListener('click', () => {
  if (!state.log.length) return;
  if (window.confirm('¿Seguro que quieres vaciar el registro diario?')) {
    state.log = [];
    saveState();
    renderLog();
  }
});

selectors.ideaForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(selectors.ideaForm);
  const title = formData.get('title')?.toString().trim();
  if (!title) return;

  state.ideas.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `idea-${Date.now()}`,
    title,
    content: formData.get('content')?.toString().trim() || '',
    pinned: Boolean(formData.get('pin')),
    createdAt: new Date().toISOString(),
  });

  selectors.ideaForm.reset();
  selectors.ideaForm.querySelector('input[name="title"]').focus();
  saveState();
  renderIdeas();
  renderSummary();
});

selectors.ideaList?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const ideaElement = button.closest('.idea');
  const ideaId = ideaElement?.dataset.id;
  if (!ideaId) return;
  const idea = state.ideas.find((item) => item.id === ideaId);
  if (!idea) return;

  switch (button.dataset.action) {
    case 'pin':
      idea.pinned = !idea.pinned;
      break;
    case 'delete':
      state.ideas = state.ideas.filter((item) => item.id !== ideaId);
      break;
    default:
      break;
  }
  saveState();
  renderIdeas();
  renderSummary();
});

selectors.summaryExport?.addEventListener('click', () => {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `activate-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  requestAnimationFrame(() => URL.revokeObjectURL(link.href));
  link.remove();
});

selectors.resetAll?.addEventListener('click', () => {
  if (window.confirm('Esto eliminará tareas, ideas y registro. ¿Deseas continuar?')) {
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, clone(initialData));
    editingTaskId = null;
    completedFocusInCycle = 0;
    timerState.mode = 'focus';
    timerState.remaining = state.timer.focus * 60;
    stopTimer();
    hydrateConfigForm();
    renderAll();
  }
});

function tick() {
  if (!timerState.running) return;
  timerState.remaining -= 1;
  if (timerState.remaining <= 0) {
    completeSession();
  }
  updateTimerDisplay();
}

function completeSession() {
  stopTimer(false);
  const mode = timerState.mode;

  if (mode === 'focus') {
    completedFocusInCycle += 1;
    const activeTask = state.tasks.find((task) => task.id === state.activeTaskId);
    if (activeTask) {
      activeTask.completedPomodoros = Math.min(activeTask.completedPomodoros + 1, 999);
      if (activeTask.completedPomodoros >= activeTask.estimate && !activeTask.completed) {
        activeTask.completed = true;
      }
    }
    addLogEntry('Enfoque', `${state.timer.focus} min completados`, activeTask?.title ?? null);
    if (completedFocusInCycle >= state.timer.cycles) {
      timerState.mode = 'long';
      timerState.remaining = state.timer.long * 60;
      completedFocusInCycle = 0;
    } else {
      timerState.mode = 'short';
      timerState.remaining = state.timer.short * 60;
    }
  } else if (mode === 'short') {
    addLogEntry('Descanso corto', `${state.timer.short} min para recargar`, null);
    timerState.mode = 'focus';
    timerState.remaining = state.timer.focus * 60;
  } else {
    addLogEntry('Descanso largo', `${state.timer.long} min completados`, null);
    timerState.mode = 'focus';
    timerState.remaining = state.timer.focus * 60;
  }

  selectors.timerMode.textContent = `${modeLabel(mode)} terminado`;
  updateTimerDisplay();
  syncTimerButtons();
  saveState();
  renderTasks();
  renderSummary();
  if (timerState.mode === 'focus' && state.activeTaskId && !state.tasks.some((task) => task.id === state.activeTaskId)) {
    state.activeTaskId = null;
    renderActiveTask();
  }
}

function stopTimer(updateButtons = true) {
  timerState.running = false;
  if (timerInterval) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
  if (updateButtons) {
    syncTimerButtons();
  }
}

function updateTimerDisplay() {
  const minutes = Math.max(0, Math.floor(timerState.remaining / 60));
  const seconds = Math.max(0, timerState.remaining % 60);
  selectors.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
  syncTimerButtons();
}

function renderTasks() {
  const lists = document.querySelectorAll('[data-list]');
  lists.forEach((list) => {
    const status = list.dataset.list;
    list.innerHTML = '';
    const tasks = state.tasks
      .filter((task) => task.status === status)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.priority !== b.priority) return a.priority ? -1 : 1;
        if (a.due && b.due) return new Date(a.due) - new Date(b.due);
        if (a.due) return -1;
        if (b.due) return 1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    if (!tasks.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'Sin tareas aquí todavía';
      list.appendChild(empty);
      return;
    }

    tasks.forEach((task) => {
      const article = document.createElement('article');
      article.className = 'task';
      if (task.completed) article.classList.add('task--done');
      article.dataset.id = task.id;

      const header = document.createElement('div');
      header.className = 'task__header';
      const title = document.createElement('h4');
      title.className = 'task__title';
      title.textContent = task.title;
      header.appendChild(title);

      const tags = document.createElement('div');
      tags.className = 'task__meta';
      tags.appendChild(createTag(`🍅 ${task.completedPomodoros}/${task.estimate}`));
      if (task.due) {
        tags.appendChild(createTag(`📅 ${formatDate(task.due)}`));
      }
      if (task.priority) {
        const priorityTag = createTag('⚡ Importante');
        priorityTag.classList.add('tag--priority');
        tags.appendChild(priorityTag);
      }

      header.appendChild(tags);
      article.appendChild(header);

      if (task.notes) {
        const notes = document.createElement('p');
        notes.className = 'task__notes';
        notes.textContent = task.notes;
        article.appendChild(notes);
      }

      const actions = document.createElement('div');
      actions.className = 'task__actions';

      const completeBtn = document.createElement('button');
      completeBtn.dataset.action = 'complete';
      completeBtn.textContent = task.completed ? 'Reabrir' : 'Completar';
      actions.appendChild(completeBtn);

      const focusBtn = document.createElement('button');
      focusBtn.dataset.action = 'focus';
      focusBtn.textContent = state.activeTaskId === task.id ? 'Enfoque activo' : 'Enfocar';
      if (state.activeTaskId === task.id) {
        focusBtn.disabled = true;
      }
      actions.appendChild(focusBtn);

      const increment = document.createElement('button');
      increment.dataset.action = 'increment';
      increment.textContent = '+ 🍅';
      actions.appendChild(increment);

      const decrement = document.createElement('button');
      decrement.dataset.action = 'decrement';
      decrement.textContent = '− 🍅';
      actions.appendChild(decrement);

      const editBtn = document.createElement('button');
      editBtn.dataset.action = 'edit';
      editBtn.textContent = 'Editar';
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.dataset.action = 'delete';
      deleteBtn.textContent = 'Eliminar';
      actions.appendChild(deleteBtn);

      article.appendChild(actions);

      list.appendChild(article);
    });
  });

  renderStats();
  renderActiveTask();
}

function renderStats() {
  if (!selectors.stats) return;
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.completed).length;
  const today = state.tasks.filter((task) => task.status === 'today' && !task.completed).length;
  const focusCount = state.tasks.reduce((acc, task) => acc + task.completedPomodoros, 0);

  selectors.stats.innerHTML = '';

  const items = [
    { label: 'Pendientes totales', value: total },
    { label: 'Completadas', value: completed },
    { label: 'Para hoy', value: today },
    { label: 'Pomodoros logrados', value: focusCount },
  ];

  items.forEach(({ label, value }) => {
    const card = document.createElement('div');
    card.className = 'stats__item';
    const text = document.createElement('span');
    text.textContent = label;
    const strong = document.createElement('strong');
    strong.textContent = value;
    card.append(strong, text);
    selectors.stats.appendChild(card);
  });
}

function renderIdeas() {
  if (!selectors.ideaList) return;
  selectors.ideaList.innerHTML = '';
  if (!state.ideas.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Sin ideas todavía';
    selectors.ideaList.appendChild(empty);
    return;
  }

  const sorted = [...state.ideas].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  sorted.forEach((idea) => {
    const article = document.createElement('article');
    article.className = 'idea';
    if (idea.pinned) article.classList.add('idea--pinned');
    article.dataset.id = idea.id;

    const title = document.createElement('h4');
    title.className = 'idea__title';
    const text = document.createElement('span');
    text.textContent = idea.title;
    const badge = document.createElement('span');
    badge.textContent = idea.pinned ? 'Fijada' : formatDate(idea.createdAt);
    title.append(text, badge);

    article.appendChild(title);

    if (idea.content) {
      const content = document.createElement('p');
      content.className = 'idea__content';
      content.textContent = idea.content;
      article.appendChild(content);
    }

    const actions = document.createElement('div');
    actions.className = 'idea__actions';
    const pin = document.createElement('button');
    pin.dataset.action = 'pin';
    pin.textContent = idea.pinned ? 'Quitar fijado' : 'Fijar';
    actions.appendChild(pin);
    const remove = document.createElement('button');
    remove.dataset.action = 'delete';
    remove.textContent = 'Eliminar';
    actions.appendChild(remove);

    article.appendChild(actions);
    selectors.ideaList.appendChild(article);
  });
}

function renderSummary() {
  if (!selectors.summary) return;
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.completed).length;
  const focusDone = state.tasks.reduce((acc, task) => acc + task.completedPomodoros, 0);
  const focusPlanned = state.tasks.reduce((acc, task) => acc + task.estimate, 0);
  const ideas = state.ideas.length;
  const pinned = state.ideas.filter((idea) => idea.pinned).length;

  selectors.summary.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'summary__grid';

  const cards = [
    { label: 'Tareas creadas', value: total },
    { label: 'Tareas finalizadas', value: completed },
    { label: 'Pomodoros completados', value: focusDone },
    { label: 'Pomodoros planificados', value: focusPlanned },
    { label: 'Ideas guardadas', value: ideas },
    { label: 'Ideas fijadas', value: pinned },
  ];

  cards.forEach(({ label, value }) => {
    const card = document.createElement('article');
    card.className = 'summary__card';
    const strong = document.createElement('strong');
    strong.textContent = value;
    const span = document.createElement('span');
    span.textContent = label;
    card.append(strong, span);
    grid.appendChild(card);
  });

  const instructions = document.createElement('div');
  instructions.className = 'summary__card';
  instructions.innerHTML = `
    <strong>Consejos rápidos</strong>
    <ul>
      <li>Duplica sesiones Pomodoro con el botón + 🍅 cuando cierres un ciclo adicional.</li>
      <li>Usa "Fijar" para mantener visibles las ideas prioritarias.</li>
      <li>Exporta regularmente tus datos para guardarlos o migrarlos de navegador.</li>
    </ul>
  `;

  selectors.summary.appendChild(grid);
  selectors.summary.appendChild(instructions);
}

function renderLog() {
  if (!selectors.logList) return;
  selectors.logList.innerHTML = '';
  if (!state.log.length) {
    const empty = document.createElement('li');
    empty.textContent = 'El registro está vacío por ahora.';
    selectors.logList.appendChild(empty);
    return;
  }

  state.log.forEach((entry) => {
    const item = document.createElement('li');
    item.textContent = `${formatTime(entry.createdAt)} — ${entry.label}${entry.task ? ` · ${entry.task}` : ''} (${entry.note})`;
    selectors.logList.appendChild(item);
  });
}

function renderActiveTask() {
  if (!selectors.activeTask) return;
  if (!state.activeTaskId) {
    selectors.activeTask.textContent = 'Sin tarea seleccionada. Pulsa “Enfocar” en una tarea para asociarla.';
    return;
  }
  const activeTask = state.tasks.find((task) => task.id === state.activeTaskId);
  if (!activeTask) {
    selectors.activeTask.textContent = 'La tarea seleccionada ya no existe. Elige otra para enfocar.';
    state.activeTaskId = null;
    saveState();
    return;
  }
  selectors.activeTask.textContent = `Enfocando: ${activeTask.title} (${activeTask.completedPomodoros}/${activeTask.estimate} 🍅)`;
}

function hydrateConfigForm() {
  if (!selectors.timerConfig) return;
  selectors.timerConfig.querySelector('input[name="focus"]').value = state.timer.focus;
  selectors.timerConfig.querySelector('input[name="short"]').value = state.timer.short;
  selectors.timerConfig.querySelector('input[name="long"]').value = state.timer.long;
  selectors.timerConfig.querySelector('input[name="cycles"]').value = state.timer.cycles;
}

function fillTaskForm(task) {
  selectors.taskForm.querySelector('input[name="title"]').value = task.title;
  selectors.taskForm.querySelector('select[name="status"]').value = task.status;
  selectors.taskForm.querySelector('input[name="due"]').value = task.due ?? '';
  selectors.taskForm.querySelector('input[name="estimate"]').value = task.estimate;
  selectors.taskForm.querySelector('textarea[name="notes"]').value = task.notes ?? '';
  selectors.taskForm.querySelector('input[name="priority"]').checked = Boolean(task.priority);
  editingTaskId = task.id;
  selectors.taskForm.querySelector('input[name="title"]').focus();
}

function addLogEntry(label, note, task) {
  state.log.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
    label,
    note,
    task,
    createdAt: new Date().toISOString(),
  });
  state.log = state.log.slice(0, 30);
  renderLog();
  saveState();
}

function renderAll() {
  hydrateConfigForm();
  updateTimerDisplay();
  renderTasks();
  renderIdeas();
  renderSummary();
  renderLog();
}

function syncTimerButtons() {
  if (!selectors.startBtn || !selectors.pauseBtn || !selectors.resetBtn) return;
  selectors.startBtn.disabled = timerState.running;
  selectors.pauseBtn.disabled = !timerState.running;
  const initialSeconds = state.timer.focus * 60;
  const isInitialState = !timerState.running && timerState.mode === 'focus' && timerState.remaining === initialSeconds;
  selectors.resetBtn.disabled = timerState.running || isInitialState;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return clone(initialData);
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      ...clone(initialData),
      ...parsed,
      timer: { ...initialData.timer, ...(parsed.timer || {}) },
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
      log: Array.isArray(parsed.log) ? parsed.log : [],
    };
  } catch (error) {
    console.error('No se pudo leer la información almacenada. Se restaurará el estado inicial.', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return clone(initialData);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createTag(text) {
  const span = document.createElement('span');
  span.className = 'tag';
  span.textContent = text;
  return span;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function clampNumber(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

function modeLabel(mode) {
  switch (mode) {
    case 'focus':
      return 'Enfoque';
    case 'short':
      return 'Descanso corto';
    case 'long':
      return 'Descanso largo';
    default:
      return 'Sesión';
  }
}

renderAll();
