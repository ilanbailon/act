import { supabase } from './supabaseClient.js';
import {
  getWeekDates,
  formatWeekday,
  formatDay,
  formatDate,
  formatISODate,
  nowInLima,
  todayKey,
  isSameDate,
  toDateInputValue,
  toDateTimeLocalValue,
} from './date.js';
import { bandColor, computeCountdown } from './urgency.js';

const state = {
  session: null,
  tasks: [],
  view: 'today',
  filters: {
    search: '',
    status: 'all',
    project: 'all',
    priority: 'all',
  },
  offline: !navigator.onLine,
};

const elements = {
  appShell: document.querySelector('.app'),
  tabs: document.getElementById('view-tabs'),
  tabButtons: Array.from(document.querySelectorAll('#view-tabs button')),
  viewContainer: document.getElementById('view-container'),
  authPanel: document.getElementById('auth-panel'),
  toast: document.getElementById('toast'),
  offline: document.getElementById('offline-banner'),
  sessionInfo: document.getElementById('session-info'),
  modal: document.getElementById('modal'),
  modalClose: document.getElementById('modal-close'),
  taskForm: document.getElementById('task-form'),
  taskCancel: document.getElementById('task-cancel'),
  taskDelete: document.getElementById('task-delete'),
};

init();

async function init() {
  registerServiceWorker();
  attachEventListeners();
  updateOfflineStatus();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  handleSession(session);

  supabase.auth.onAuthStateChange((_event, newSession) => {
    handleSession(newSession);
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .catch(() => console.warn('No se pudo registrar el service worker.'));
  }
}

function attachEventListeners() {
  elements.tabButtons.forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  document.getElementById('auth-login').addEventListener('submit', handleLogin);
  document.getElementById('auth-register').addEventListener('submit', handleRegister);
  document.getElementById('auth-magic').addEventListener('submit', handleMagicLink);

  elements.modalClose.addEventListener('click', closeModal);
  elements.taskCancel.addEventListener('click', (event) => {
    event.preventDefault();
    closeModal();
  });
  elements.taskDelete.addEventListener('click', deleteCurrentTask);
  elements.taskForm.addEventListener('submit', handleTaskSubmit);

  window.addEventListener('online', updateOfflineStatus);
  window.addEventListener('offline', updateOfflineStatus);
}

function updateOfflineStatus() {
  state.offline = !navigator.onLine;
  elements.offline.classList.toggle('hidden', !state.offline);
  if (state.session?.user) {
    renderView();
  }
}

function handleSession(session) {
  state.session = session;
  if (session?.user) {
    elements.appShell.classList.remove('hidden');
    elements.authPanel.classList.add('hidden');
    elements.tabs.classList.remove('hidden');
    renderSessionInfo();
    loadTasks();
  } else {
    elements.appShell.classList.add('hidden');
    elements.authPanel.classList.remove('hidden');
    elements.tabs.classList.add('hidden');
    elements.sessionInfo.textContent = '';
    elements.viewContainer.innerHTML = '<p class="muted">Inicia sesión para ver tus tareas.</p>';
  }
}

function renderSessionInfo() {
  const user = state.session?.user;
  if (!user) return;
  elements.sessionInfo.innerHTML = '';
  const label = document.createElement('span');
  label.textContent = user.email ?? 'Usuario';
  const logoutButton = document.createElement('button');
  logoutButton.type = 'button';
  logoutButton.textContent = 'Salir';
  logoutButton.className = 'button button--ghost button--small';
  logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showToast('Sesión cerrada.');
  });
  elements.sessionInfo.append(label, logoutButton);
}

async function handleLogin(event) {
  event.preventDefault();
  if (state.offline) return showToast('Sin conexión para iniciar sesión.', true);
  const data = new FormData(event.currentTarget);
  const email = data.get('email');
  const password = data.get('password');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message, true);
  } else {
    event.currentTarget.reset();
    showToast('Bienvenido de nuevo 👋');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  if (state.offline) return showToast('Sin conexión para registrarse.', true);
  const data = new FormData(event.currentTarget);
  const email = data.get('email');
  const password = data.get('password');
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    showToast(error.message, true);
  } else {
    showToast('Revisa tu correo para confirmar la cuenta.');
    event.currentTarget.reset();
  }
}

async function handleMagicLink(event) {
  event.preventDefault();
  if (state.offline) return showToast('Sin conexión para enviar el enlace.', true);
  const data = new FormData(event.currentTarget);
  const email = data.get('email');
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    showToast(error.message, true);
  } else {
    showToast('Enlace mágico enviado. Revisa tu bandeja.');
    event.currentTarget.reset();
  }
}

async function loadTasks() {
  if (!state.session?.user) return;
  elements.viewContainer.innerHTML = '<p class="muted">Cargando tareas...</p>';
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('priority', { ascending: false })
    .order('scheduled_date', { ascending: true })
    .order('due_at', { ascending: true, nullsFirst: false });
  if (error) {
    showToast(error.message, true);
    elements.viewContainer.innerHTML = '<p class="muted">No se pudieron cargar las tareas.</p>';
    return;
  }
  state.tasks = data ?? [];
  renderView();
}

function setView(view) {
  if (state.view === view) return;
  state.view = view;
  elements.tabButtons.forEach((button) => {
    button.classList.toggle('tabs__button--active', button.dataset.view === view);
  });
  renderView();
}

function renderView() {
  switch (state.view) {
    case 'week':
      renderWeekView();
      break;
    case 'all':
      renderAllTasksView();
      break;
    case 'today':
    default:
      renderTodayView();
  }
}

function renderTodayView() {
  const today = todayKey();
  const now = nowInLima();
  const filtered = state.tasks.filter((task) => {
    const scheduledToday = task.scheduled_date && task.scheduled_date === today;
    const quickWithoutDate = task.type === 'quick' && !task.scheduled_date;
    return scheduledToday || quickWithoutDate;
  });

  const urgencyWeight = (task) => {
    const band = bandColor(task.due_at, now);
    switch (band) {
      case 'red':
        return 0;
      case 'amber':
        return 1;
      case 'green':
        return 2;
      default:
        return 3;
    }
  };

  filtered.sort((a, b) => {
    const priorityDiff = Number(b.priority ?? 0) - Number(a.priority ?? 0);
    if (priorityDiff !== 0) return priorityDiff;
    const urgencyDiff = urgencyWeight(a) - urgencyWeight(b);
    if (urgencyDiff !== 0) return urgencyDiff;
    const dueA = a.due_at ? new Date(a.due_at).getTime() : Infinity;
    const dueB = b.due_at ? new Date(b.due_at).getTime() : Infinity;
    return dueA - dueB;
  });

  if (!filtered.length) {
    elements.viewContainer.innerHTML = '<p class="muted">No hay tareas para hoy aún.</p>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'tasks-list';
  filtered.forEach((task) => {
    list.appendChild(createTaskCard(task, { allowDrag: true }));
  });
  elements.viewContainer.innerHTML = '';
  elements.viewContainer.append(list);
}

function renderWeekView() {
  const now = nowInLima();
  const week = getWeekDates(now);
  const container = document.createElement('div');
  container.className = 'week-grid';

  week.forEach((day) => {
    const column = document.createElement('section');
    column.className = 'day-column';
    column.dataset.date = formatISODate(day);
    column.innerHTML = `
      <div class="day-column__header">
        <h3 class="day-column__title">${formatWeekday(day)}</h3>
        <span class="day-column__date">${formatDay(day)}</span>
      </div>
    `;
    column.addEventListener('dragover', (event) => {
      event.preventDefault();
    });
    column.addEventListener('drop', (event) => {
      event.preventDefault();
      const taskId = event.dataTransfer.getData('text/plain');
      if (!taskId || state.offline) return;
      const newDate = column.dataset.date;
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) return;
      if (!confirm(`¿Reprogramar "${task.title}" para ${formatDate(day)}?`)) return;
      updateTask(task.id, { scheduled_date: newDate });
    });

    const tasksForDay = state.tasks.filter((task) => task.scheduled_date && isSameDate(task.scheduled_date, day));
    if (!tasksForDay.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Sin tareas';
      column.appendChild(empty);
    } else {
      tasksForDay.forEach((task) => {
        column.appendChild(createTaskCard(task, { allowDrag: true }));
      });
    }

    container.appendChild(column);
  });

  const backlog = document.createElement('section');
  backlog.className = 'day-column';
  backlog.dataset.date = '';
  backlog.innerHTML = `
    <div class="day-column__header">
      <h3 class="day-column__title">Sin programar</h3>
      <span class="day-column__date">${state.tasks.filter((task) => !task.scheduled_date).length} tareas</span>
    </div>
  `;
  backlog.addEventListener('dragover', (event) => event.preventDefault());
  backlog.addEventListener('drop', (event) => {
    event.preventDefault();
    if (state.offline) return;
    const taskId = event.dataTransfer.getData('text/plain');
    if (!taskId) return;
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;
    if (!confirm(`¿Quitar fecha programada de "${task.title}"?`)) return;
    updateTask(task.id, { scheduled_date: null });
  });

  const unscheduled = state.tasks.filter((task) => !task.scheduled_date);
  if (!unscheduled.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Todo programado';
    backlog.appendChild(empty);
  } else {
    unscheduled.forEach((task) => {
      backlog.appendChild(createTaskCard(task, { allowDrag: true }));
    });
  }

  container.appendChild(backlog);
  elements.viewContainer.innerHTML = '';
  elements.viewContainer.append(container);
}

function renderAllTasksView() {
  const wrapper = document.createElement('div');
  const filters = document.createElement('div');
  filters.className = 'filters';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Buscar por título o nota';
  searchInput.value = state.filters.search;
  searchInput.addEventListener('input', (event) => {
    state.filters.search = event.target.value;
    renderAllTasksView();
  });

  const statusSelect = document.createElement('select');
  statusSelect.innerHTML = `
    <option value="all">Todos los estados</option>
    <option value="todo">Por hacer</option>
    <option value="doing">En progreso</option>
    <option value="done">Completas</option>
    <option value="blocked">Bloqueadas</option>
  `;
  statusSelect.value = state.filters.status;
  statusSelect.addEventListener('change', (event) => {
    state.filters.status = event.target.value;
    renderAllTasksView();
  });

  const prioritySelect = document.createElement('select');
  prioritySelect.innerHTML = `
    <option value="all">Todas las prioridades</option>
    <option value="2">Alta</option>
    <option value="1">Media</option>
    <option value="0">Baja</option>
  `;
  prioritySelect.value = state.filters.priority;
  prioritySelect.addEventListener('change', (event) => {
    state.filters.priority = event.target.value;
    renderAllTasksView();
  });

  const projectSelect = document.createElement('select');
  const projects = Array.from(new Set(state.tasks.map((task) => task.project).filter(Boolean)));
  if (state.filters.project !== 'all' && !projects.includes(state.filters.project)) {
    state.filters.project = 'all';
  }
  projectSelect.innerHTML = `<option value="all">Todos los proyectos</option>` +
    projects.map((project) => `<option value="${project}">${project}</option>`).join('');
  projectSelect.value = state.filters.project;
  projectSelect.addEventListener('change', (event) => {
    state.filters.project = event.target.value;
    renderAllTasksView();
  });

  const createButton = document.createElement('button');
  createButton.type = 'button';
  createButton.className = 'button';
  createButton.textContent = 'Nueva tarea';
  createButton.addEventListener('click', () => openModal());

  filters.append(searchInput, statusSelect, prioritySelect, projectSelect, createButton);

  const list = document.createElement('div');
  list.className = 'tasks-list';

  const tasks = applyFilters();
  if (!tasks.length) {
    list.innerHTML = '<p class="muted">No hay tareas con los filtros actuales.</p>';
  } else {
    tasks.forEach((task) => {
      list.appendChild(createTaskCard(task, { allowDrag: false }));
    });
  }

  wrapper.append(filters, list);
  elements.viewContainer.innerHTML = '';
  elements.viewContainer.append(wrapper);
}

function applyFilters() {
  const search = state.filters.search.trim().toLowerCase();
  return state.tasks.filter((task) => {
    if (state.filters.status !== 'all' && task.status !== state.filters.status) return false;
    if (state.filters.priority !== 'all' && String(task.priority) !== state.filters.priority) return false;
    if (state.filters.project !== 'all' && task.project !== state.filters.project) return false;
    if (search) {
      const content = `${task.title ?? ''} ${task.note ?? ''}`.toLowerCase();
      if (!content.includes(search)) return false;
    }
    return true;
  }).sort((a, b) => {
    const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return createdB - createdA;
  });
}

function createTaskCard(task, { allowDrag } = { allowDrag: false }) {
  const now = nowInLima();
  const article = document.createElement('article');
  article.className = 'task-card';
  article.dataset.id = task.id;
  if (allowDrag && !state.offline) {
    article.draggable = true;
    article.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', task.id);
    });
  }

  const urgency = bandColor(task.due_at, now);
  if (urgency !== 'none') {
    const band = document.createElement('span');
    band.className = `urgency-band urgency-band--${urgency}`;
    article.appendChild(band);
  }

  const header = document.createElement('div');
  header.className = 'task-card__header';
  const title = document.createElement('h3');
  title.className = 'task-card__title';
  title.textContent = task.title;
  header.appendChild(title);

  const countdown = document.createElement('span');
  countdown.className = 'badge';
  countdown.textContent = computeCountdown(task.due_at, now);
  header.appendChild(countdown);
  article.appendChild(header);

  if (task.note) {
    const note = document.createElement('p');
    note.textContent = task.note;
    note.style.margin = '0';
    note.style.color = 'rgba(226, 232, 240, 0.75)';
    article.appendChild(note);
  }

  const meta = document.createElement('div');
  meta.className = 'task-card__meta';
  if (task.project) {
    const project = document.createElement('span');
    project.className = 'badge';
    project.textContent = task.project;
    meta.appendChild(project);
  }

  const status = document.createElement('span');
  status.className = `badge badge--status-${task.status}`;
  status.textContent = `Estado: ${mapStatus(task.status)}`;
  meta.appendChild(status);

  const priority = document.createElement('span');
  priority.className = `badge badge--priority-${task.priority ?? 0}`;
  priority.textContent = `Prioridad ${['Baja', 'Media', 'Alta'][Number(task.priority ?? 0)] ?? 'Baja'}`;
  meta.appendChild(priority);

  if (task.progress != null) {
    const progress = document.createElement('span');
    progress.textContent = `Progreso ${task.progress}%`;
    meta.appendChild(progress);
  }

  if (task.scheduled_date) {
    const scheduled = document.createElement('span');
    scheduled.textContent = `Programada: ${formatDate(task.scheduled_date)}`;
    meta.appendChild(scheduled);
  }

  if (task.target_date) {
    const target = document.createElement('span');
    target.textContent = `Objetivo: ${formatDate(task.target_date)}`;
    meta.appendChild(target);
  }

  article.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'task-card__actions';
  const doneButton = document.createElement('button');
  doneButton.type = 'button';
  doneButton.className = 'button button--small';
  doneButton.textContent = 'Marcar done';
  doneButton.addEventListener('click', () => markTaskDone(task));

  const statusButton = document.createElement('button');
  statusButton.type = 'button';
  statusButton.className = 'button button--ghost button--small';
  statusButton.textContent = 'Cambiar estado';
  statusButton.addEventListener('click', () => cycleTaskStatus(task));

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'button button--ghost button--small';
  editButton.textContent = 'Editar';
  editButton.addEventListener('click', () => openModal(task));

  const actionsList = [doneButton, statusButton, editButton];
  actionsList.forEach((button) => actions.appendChild(button));
  article.appendChild(actions);
  return article;
}

function mapStatus(status) {
  switch (status) {
    case 'doing':
      return 'En progreso';
    case 'done':
      return 'Completa';
    case 'blocked':
      return 'Bloqueada';
    default:
      return 'Por hacer';
  }
}

function markTaskDone(task) {
  if (state.offline) return showToast('Sin conexión para actualizar.', true);
  updateTask(task.id, { status: 'done', progress: 100 });
}

function cycleTaskStatus(task) {
  if (state.offline) return showToast('Sin conexión para actualizar.', true);
  const order = ['todo', 'doing', 'blocked', 'done'];
  const currentIndex = order.indexOf(task.status);
  const nextStatus = order[(currentIndex + 1) % order.length];
  updateTask(task.id, { status: nextStatus });
}

function openModal(task = null) {
  if (!state.session?.user) return;
  elements.modal.classList.remove('hidden');
  elements.taskForm.reset();
  elements.taskDelete.classList.toggle('hidden', !task);
  if (task) {
    elements.taskForm.elements.id.value = task.id;
    elements.taskForm.elements.title.value = task.title ?? '';
    elements.taskForm.elements.project.value = task.project ?? '';
    elements.taskForm.elements.note.value = task.note ?? '';
    elements.taskForm.elements.type.value = task.type ?? 'normal';
    elements.taskForm.elements.status.value = task.status ?? 'todo';
    elements.taskForm.elements.priority.value = task.priority ?? 0;
    elements.taskForm.elements.estimate_blocks.value = task.estimate_blocks ?? 0;
    elements.taskForm.elements.progress.value = task.progress ?? 0;
    elements.taskForm.elements.target_date.value = toDateInputValue(task.target_date);
    elements.taskForm.elements.scheduled_date.value = toDateInputValue(task.scheduled_date);
    elements.taskForm.elements.due_at.value = toDateTimeLocalValue(task.due_at);
  } else {
    elements.taskForm.elements.priority.value = 0;
    elements.taskForm.elements.type.value = 'normal';
    elements.taskForm.elements.status.value = 'todo';
  }
}

function closeModal() {
  elements.modal.classList.add('hidden');
}

async function handleTaskSubmit(event) {
  event.preventDefault();
  if (state.offline) return showToast('Sin conexión para guardar.', true);
  const formData = new FormData(elements.taskForm);
  const id = formData.get('id');
  const title = formData.get('title').trim();
  if (!title) {
    showToast('El título es obligatorio.', true);
    return;
  }

  const payload = {
    title,
    note: formData.get('note')?.trim() || null,
    project: formData.get('project')?.trim() || null,
    type: formData.get('type') || 'normal',
    status: formData.get('status') || 'todo',
    priority: Number(formData.get('priority') ?? 0),
    estimate_blocks: Number(formData.get('estimate_blocks') ?? 0),
    progress: Number(formData.get('progress') ?? 0),
    target_date: formData.get('target_date') || null,
    scheduled_date: formData.get('scheduled_date') || null,
    due_at: formData.get('due_at') ? new Date(formData.get('due_at')).toISOString() : null,
  };

  if (payload.estimate_blocks < 0 || Number.isNaN(payload.estimate_blocks)) {
    return showToast('Los bloques estimados deben ser positivos.', true);
  }
  if (payload.progress < 0 || payload.progress > 100 || Number.isNaN(payload.progress)) {
    return showToast('El progreso debe estar entre 0 y 100.', true);
  }

  if (id) {
    await updateTask(id, payload);
  } else {
    payload.user_id = state.session.user.id;
    await insertTask(payload);
  }
}

async function insertTask(payload) {
  const { data, error } = await supabase.from('tasks').insert(payload).select().single();
  if (error) {
    showToast(error.message, true);
    return;
  }
  state.tasks = [data, ...state.tasks];
  closeModal();
  showToast('Tarea creada.');
  renderView();
}

async function updateTask(id, changes) {
  if (!id) return;
  const { data, error } = await supabase.from('tasks').update(changes).eq('id', id).select().single();
  if (error) {
    showToast(error.message, true);
    return;
  }
  state.tasks = state.tasks.map((task) => (task.id === id ? data : task));
  showToast('Tarea actualizada.');
  closeModal();
  renderView();
}

async function deleteCurrentTask() {
  if (state.offline) return showToast('Sin conexión para eliminar.', true);
  const id = elements.taskForm.elements.id.value;
  if (!id) return;
  if (!confirm('¿Eliminar esta tarea?')) return;
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) {
    showToast(error.message, true);
    return;
  }
  state.tasks = state.tasks.filter((task) => task.id !== id);
  closeModal();
  showToast('Tarea eliminada.');
  renderView();
}

function showToast(message, isError = false) {
  if (!message) return;
  elements.toast.textContent = message;
  elements.toast.classList.toggle('toast--error', isError);
  elements.toast.classList.remove('hidden');
  setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 3200);
}
