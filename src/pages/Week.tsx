import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DayColumn from '../components/DayColumn';
import TaskForm, { type TaskFormValues } from '../components/TaskForm';
import { supabase } from '../lib/supabaseClient';
import type { Task } from '../types';
import { weekDays, formatDate, nowInLima } from '../utils/date';
import { useToast } from '../context/ToastContext';

const WeekPage = () => {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchWeekTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('scheduled_date', { ascending: true, nullsFirst: true })
      .order('priority', { ascending: false });
    if (error) throw error;
    return data as Task[];
  };

  const { data: tasks = [] } = useQuery({ queryKey: ['tasks', 'week'], queryFn: fetchWeekTasks });

  const updateScheduledDate = useMutation({
    mutationFn: async ({ id, scheduled_date }: { id: string; scheduled_date: string | null }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ scheduled_date }) // Ajusta si cambian los campos
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      pushToast({ type: 'success', message: 'Tarea reprogramada' });
    },
    onError: (error: unknown) => {
      pushToast({ type: 'error', message: error instanceof Error ? error.message : 'Error' });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Task> }) => {
      const { error } = await supabase
        .from('tasks')
        .update(changes) // Ajusta si cambian los campos
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

  const upsertTask = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      if (!editingTask) return;
      const dueAt = values.due_at ? new Date(values.due_at).toISOString() : null;
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
        }) // Ajusta si cambian los campos
        .eq('id', editingTask.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowModal(false);
      setEditingTask(null);
      pushToast({ type: 'success', message: 'Tarea actualizada' });
    },
    onError: (error: unknown) => {
      pushToast({ type: 'error', message: error instanceof Error ? error.message : 'Error' });
    },
  });

  const days = useMemo(() => weekDays(nowInLima()), []);
  const unscheduled = useMemo(() => tasks.filter((task) => !task.scheduled_date), [tasks]);
  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const day of days) {
      map.set(formatDate(day), []);
    }
    for (const task of tasks) {
      if (!task.scheduled_date) continue;
      if (!map.has(task.scheduled_date)) {
        map.set(task.scheduled_date, []);
      }
      map.get(task.scheduled_date)?.push(task);
    }
    for (const [key, list] of map.entries()) {
      map.set(
        key,
        [...list].sort((a, b) => {
          if (a.priority !== b.priority) return b.priority - a.priority;
          return (a.due_at ?? '').localeCompare(b.due_at ?? '');
        }),
      );
    }
    return map;
  }, [days, tasks]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">Semana</h2>
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {days.map((day) => (
            <DayColumn
              key={day.toISOString()}
              date={day}
              tasks={grouped.get(formatDate(day)) ?? []}
              onDropTask={(taskId, newDate) => updateScheduledDate.mutate({ id: taskId, scheduled_date: newDate })}
              onMarkDone={(task) => updateTask.mutate({ id: task.id, changes: { status: 'done', progress: 100 } })}
              onChangeStatus={(task) => {
                const states: Task['status'][] = ['todo', 'doing', 'done', 'blocked'];
                const next = states[(states.indexOf(task.status) + 1) % states.length];
                updateTask.mutate({ id: task.id, changes: { status: next } });
              }}
              onEdit={(task) => {
                setEditingTask(task);
                setShowModal(true);
              }}
            />
          ))}
        </div>
        <section className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Sin fecha programada</h3>
          <div
            className="flex flex-wrap gap-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const taskId = event.dataTransfer.getData('text/plain');
              if (!taskId) return;
              const confirmDrop = window.confirm('¿Quitar fecha programada?');
              if (confirmDrop) {
                updateScheduledDate.mutate({ id: taskId, scheduled_date: null });
              }
            }}
          >
            {unscheduled.map((task) => (
              <div key={task.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', task.id)}>
                <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                  {task.title}
                </div>
              </div>
            ))}
            {unscheduled.length === 0 && (
              <p className="text-xs text-slate-400">Sin tareas libres</p>
            )}
          </div>
        </section>
      </div>
      {showModal && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Editar tarea</h3>
              <button className="text-sm text-slate-500" onClick={() => setShowModal(false)}>
                Cerrar
              </button>
            </div>
            <TaskForm
              initialTask={editingTask}
              onSubmit={(values) => upsertTask.mutate(values)}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekPage;
