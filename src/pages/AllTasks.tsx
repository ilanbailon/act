import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TaskCard from '../components/TaskCard';
import TaskForm, { type TaskFormValues } from '../components/TaskForm';
import { supabase } from '../lib/supabaseClient';
import type { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AllTasksPage = () => {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Task[];
  };

  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks', 'all'], queryFn: fetchTasks });

  const upsertTask = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      if (!user) throw new Error('Sin usuario');
      const dueAt = values.due_at ? new Date(values.due_at).toISOString() : null;
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: values.title,
            note: values.note || null,
            project: values.project || null,
            type: values.type,
            status: values.status,
            priority: values.priority,
            estimate_blocks: values.estimate_blocks,
            target_date: values.target_date || null,
            due_at: dueAt,
            scheduled_date: values.scheduled_date || null,
            progress: values.progress,
          }) // Ajusta los nombres si cambian las columnas
          .eq('id', editingTask.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tasks').insert({
          title: values.title,
          note: values.note || null,
          project: values.project || null,
          type: values.type,
          status: values.status,
          priority: values.priority,
          estimate_blocks: values.estimate_blocks,
          target_date: values.target_date || null,
          due_at: dueAt,
          scheduled_date: values.scheduled_date || null,
          progress: values.progress,
          user_id: user.id,
        }); // Ajusta los nombres si cambian las columnas
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowModal(false);
      setEditingTask(null);
      pushToast({ type: 'success', message: 'Tarea guardada' });
    },
    onError: (error: unknown) => {
      pushToast({ type: 'error', message: error instanceof Error ? error.message : 'Error' });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Task> }) => {
      const { error } = await supabase
        .from('tasks')
        .update(changes) // Ajusta los nombres si cambian las columnas
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: unknown) => {
      pushToast({ type: 'error', message: error instanceof Error ? error.message : 'Error' });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId); // Ajusta si cambian claves
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      pushToast({ type: 'success', message: 'Tarea eliminada' });
    },
    onError: (error: unknown) => {
      pushToast({ type: 'error', message: error instanceof Error ? error.message : 'Error' });
    },
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = search
        ? task.title.toLowerCase().includes(search.toLowerCase()) ||
          (task.project ?? '').toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesStatus = statusFilter ? task.status === statusFilter : true;
      const matchesProject = projectFilter ? (task.project ?? '') === projectFilter : true;
      const matchesPriority = priorityFilter ? String(task.priority) === priorityFilter : true;
      return matchesSearch && matchesStatus && matchesProject && matchesPriority;
    });
  }, [tasks, search, statusFilter, projectFilter, priorityFilter]);

  const uniqueProjects = useMemo(() => {
    return Array.from(new Set(tasks.map((task) => task.project).filter(Boolean))) as string[];
  }, [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Todas las tareas</h2>
        <button
          type="button"
          className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          onClick={() => {
            setEditingTask(null);
            setShowModal(true);
          }}
        >
          Nueva tarea
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Buscar..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">Estado</option>
          <option value="todo">Por hacer</option>
          <option value="doing">En progreso</option>
          <option value="done">Hecho</option>
          <option value="blocked">Bloqueado</option>
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
        >
          <option value="">Proyecto</option>
          {uniqueProjects.map((project) => (
            <option key={project} value={project ?? ''}>
              {project}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
        >
          <option value="">Prioridad</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredTasks.map((task) => (
            <div key={task.id} className="relative">
              <TaskCard
                task={task}
                onMarkDone={(current) =>
                  updateTask.mutate({
                    id: current.id,
                    changes: { status: 'done', progress: 100 },
                  })
                }
                onChangeStatus={(current) => {
                  const states: Task['status'][] = ['todo', 'doing', 'done', 'blocked'];
                  const next = states[(states.indexOf(current.status) + 1) % states.length];
                  updateTask.mutate({ id: current.id, changes: { status: next } });
                }}
                onEdit={(current) => {
                  setEditingTask(current);
                  setShowModal(true);
                }}
              />
              <button
                type="button"
                className="absolute right-2 top-2 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                onClick={() => {
                  if (window.confirm('¿Eliminar tarea?')) {
                    deleteTask.mutate(task.id);
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <p className="text-sm text-slate-500">No hay tareas coincidentes.</p>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingTask ? 'Editar tarea' : 'Nueva tarea'}
              </h3>
              <button className="text-sm text-slate-500" onClick={() => setShowModal(false)}>
                Cerrar
              </button>
            </div>
            <TaskForm
              initialTask={editingTask ?? undefined}
              onSubmit={(values) => upsertTask.mutate(values)}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTasksPage;
