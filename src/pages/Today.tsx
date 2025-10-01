import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TaskCard from '../components/TaskCard';
import TaskForm, { type TaskFormValues } from '../components/TaskForm';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import type { Task } from '../types';
import { todayString } from '../utils/date';
import { useToast } from '../context/ToastContext';

const TodayPage = () => {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = async () => {
    const today = todayString();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('priority', { ascending: false })
      .order('due_at', { ascending: true, nullsFirst: true })
      .or(`scheduled_date.eq.${today},and(type.eq.quick,scheduled_date.is.null)`);
    if (error) throw error;
    return data as Task[];
  };

  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks', 'today'], queryFn: fetchTasks });

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
    mutationFn: async (payload: Partial<Task> & { id: string }) => {
      const { id, ...rest } = payload;
      const { error } = await supabase
        .from('tasks')
        .update(rest) // Ajusta si se renombran columnas
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

  const sortedTasks = useMemo(() => tasks, [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Hoy</h2>
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
      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMarkDone={(current) =>
                updateTask.mutate({ id: current.id, status: 'done', progress: 100 })
              }
              onChangeStatus={(current) => {
                const states: Task['status'][] = ['todo', 'doing', 'done', 'blocked'];
                const next = states[(states.indexOf(current.status) + 1) % states.length];
                updateTask.mutate({ id: current.id, status: next });
              }}
              onEdit={(current) => {
                setEditingTask(current);
                setShowModal(true);
              }}
            />
          ))}
          {sortedTasks.length === 0 && (
            <p className="text-sm text-slate-500">No hay tareas para hoy.</p>
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

export default TodayPage;
