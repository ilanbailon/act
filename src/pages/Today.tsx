
import { useMemo, useState } from "react";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import { useToast } from "../providers/ToastProvider";
import { useInsertTask, useTasksQuery, useUpdateTask } from "../hooks/useTasks";
import type { Task, TaskPayload } from "../types";
import { todayInLima } from "../utils/date";

const TodayPage = () => {
  const { data: tasks = [], isLoading } = useTasksQuery();
  const updateTask = useUpdateTask();
  const insertTask = useInsertTask();
  const { push } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayIso = todayInLima();

  const todayTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.scheduled_date === todayIso || (task.type === "quick" && !task.scheduled_date)
      )
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return (a.due_at ?? "").localeCompare(b.due_at ?? "");
      });
  }, [tasks, todayIso]);

  const handleMarkDone = (task: Task) => {
    updateTask.mutate(
      { id: task.id, payload: { status: "done", progress: 100, scheduled_date: todayIso } },
      {
        onSuccess: () => push({ title: "¡Buen trabajo!", description: "Tarea marcada como hecha", type: "success" }),
        onError: () => push({ title: "No se pudo actualizar", type: "error" })
      }
    );
  };

  const handleCycle = (task: Task) => {
    updateTask.mutate(
      { id: task.id, payload: { status: task.status } },
      {
        onSuccess: () => push({ title: "Estado actualizado" }),
        onError: () => push({ title: "No se pudo actualizar", type: "error" })
      }
    );
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleSubmit = async (payload: TaskPayload) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, payload });
    } else {
      await insertTask.mutateAsync(payload);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Hoy</h1>
          <p className="text-sm text-slate-400">
            Tareas rápidas y programadas para hoy. Arranca por lo urgente.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="rounded-md bg-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/30"
        >
          Nueva tarea
        </button>
      </header>
      {isLoading ? (
        <p className="text-slate-400">Cargando tareas...</p>
      ) : todayTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
          No tienes tareas para hoy. ¡Disfruta el foco!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {todayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onMarkDone={handleMarkDone}
              onCycleStatus={handleCycle}
            />
          ))}
        </div>
      )}
      <TaskForm
        open={showForm}
        initialTask={editingTask}
        onClose={() => setShowForm(false)}
        onSubmit={async (payload) => {
          await handleSubmit({ ...payload, scheduled_date: payload.scheduled_date ?? todayIso });
          push({ title: "Tarea guardada", type: "success" });
        }}
      />

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
