import { useEffect, useState } from "react";
import type { Task, TaskPayload } from "../types";
import { todayInLima } from "../utils/date";

interface TaskFormProps {
  open: boolean;
  initialTask?: Task | null;
  onClose: () => void;
  onSubmit: (payload: TaskPayload) => Promise<void>;
}

const baseState: TaskPayload = {
  title: "",
  note: "",
  project: "",
  type: "normal",
  status: "todo",
  priority: 0,
  estimate_blocks: 0,
  target_date: null,
  due_at: null,
  scheduled_date: null,
  progress: 0
};

const statuses = [
  { value: "todo", label: "Por hacer" },
  { value: "doing", label: "En progreso" },
  { value: "done", label: "Hecha" },
  { value: "blocked", label: "Bloqueada" }
] as const;

const priorities = [
  { value: 0, label: "Baja" },
  { value: 1, label: "Media" },
  { value: 2, label: "Alta" }
] as const;

const types = [
  { value: "normal", label: "Normal" },
  { value: "quick", label: "Rápida" }
] as const;

export const TaskForm = ({ open, initialTask, onClose, onSubmit }: TaskFormProps) => {
  const [payload, setPayload] = useState<TaskPayload>(baseState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialTask) {
      setPayload({
        title: initialTask.title,
        note: initialTask.note ?? "",
        project: initialTask.project ?? "",
        type: initialTask.type,
        status: initialTask.status,
        priority: initialTask.priority,
        estimate_blocks: initialTask.estimate_blocks,
        target_date: initialTask.target_date,
        due_at: initialTask.due_at,
        scheduled_date: initialTask.scheduled_date,
        progress: initialTask.progress
      });
    } else {
      setPayload({ ...baseState, scheduled_date: todayInLima() });
    }
    setError(null);
  }, [open, initialTask]);

  const handleChange = (field: keyof TaskPayload, value: string) => {
    setPayload((prev) => ({
      ...prev,
      [field]:
        field === "priority" || field === "estimate_blocks" || field === "progress"
          ? Number(value)
          : value || null
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!payload.title?.trim()) {
      setError("El título es obligatorio");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        ...payload,
        note: payload.note ?? "",
        project: payload.project ?? "",
        due_at: payload.due_at || null,
        scheduled_date: payload.scheduled_date || null,
        target_date: payload.target_date || null
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la tarea");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {initialTask ? "Editar tarea" : "Nueva tarea"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            Cerrar
          </button>
        </header>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Título *</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
              value={payload.title}
              onChange={(event) => setPayload((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Proyecto</label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
                value={payload.project ?? ""}
                onChange={(event) => setPayload((prev) => ({ ...prev, project: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Tipo</label>
              <select
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
                value={payload.type}
                onChange={(event) => setPayload((prev) => ({ ...prev, type: event.target.value as Task["type"] }))}
              >
                {types.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Nota</label>
            <textarea
              className="h-24 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
              value={payload.note ?? ""}
              onChange={(event) => setPayload((prev) => ({ ...prev, note: event.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Estado</label>
              <select
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
                value={payload.status}
                onChange={(event) => setPayload((prev) => ({ ...prev, status: event.target.value as Task["status"] }))}
              >
                {statuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Prioridad</label>
              <select
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
                value={payload.priority}
                onChange={(event) => handleChange("priority", event.target.value)}
              >
                {priorities.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Bloques estimados</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
                value={payload.estimate_blocks ?? 0}
                onChange={(event) => handleChange("estimate_blocks", event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Progreso (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
                value={payload.progress ?? 0}
                onChange={(event) => handleChange("progress", event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Fecha objetivo</label>
              <input
                type="date"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
                value={payload.target_date ?? ""}
                onChange={(event) => handleChange("target_date", event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Fecha programada</label>
              <input
                type="date"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
                value={payload.scheduled_date ?? ""}
                onChange={(event) => handleChange("scheduled_date", event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Vence</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
                value={payload.due_at ?? ""}
                onChange={(event) => handleChange("due_at", event.target.value)}
              />
            </div>
          </div>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/30 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>

import { FormEvent, useState } from 'react';
import type { Task, TaskStatus, TaskType } from '../types';

export interface TaskFormValues {
  title: string;
  note: string;
  project: string;
  type: TaskType;
  status: TaskStatus;
  priority: 0 | 1 | 2;
  estimate_blocks: number;
  target_date: string;
  due_at: string;
  scheduled_date: string;
  progress: number;
}

interface TaskFormProps {
  initialTask?: Task;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}

const defaultValues: TaskFormValues = {
  title: '',
  note: '',
  project: '',
  type: 'normal',
  status: 'todo',
  priority: 0,
  estimate_blocks: 0,
  target_date: '',
  due_at: '',
  scheduled_date: '',
  progress: 0,
};

const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSubmit, onCancel }) => {
  const [values, setValues] = useState<TaskFormValues>(() => {
    if (!initialTask) return defaultValues;
    return {
      title: initialTask.title,
      note: initialTask.note ?? '',
      project: initialTask.project ?? '',
      type: initialTask.type,
      status: initialTask.status,
      priority: initialTask.priority,
      estimate_blocks: initialTask.estimate_blocks,
      target_date: initialTask.target_date ?? '',
      due_at: initialTask.due_at ? initialTask.due_at.slice(0, 16) : '',
      scheduled_date: initialTask.scheduled_date ?? '',
      progress: initialTask.progress,
    };
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]:
        name === 'priority'
          ? (Number(value) as 0 | 1 | 2)
          : name === 'estimate_blocks' || name === 'progress'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!values.title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (values.estimate_blocks < 0) {
      setError('Los bloques deben ser positivos');
      return;
    }
    if (values.progress < 0 || values.progress > 100) {
      setError('El progreso debe estar entre 0 y 100');
      return;
    }
    setError(null);
    onSubmit(values);
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1 text-sm">
        Título
        <input
          className="rounded border border-slate-300 px-3 py-2"
          name="title"
          value={values.title}
          onChange={handleChange}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Nota
        <textarea
          className="rounded border border-slate-300 px-3 py-2"
          name="note"
          rows={3}
          value={values.note}
          onChange={handleChange}
        />
      </label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Proyecto
          <input
            className="rounded border border-slate-300 px-3 py-2"
            name="project"
            value={values.project}
            onChange={handleChange}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tipo
          <select className="rounded border border-slate-300 px-3 py-2" name="type" value={values.type} onChange={handleChange}>
            <option value="quick">Rápida</option>
            <option value="normal">Normal</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Estado
          <select
            className="rounded border border-slate-300 px-3 py-2"
            name="status"
            value={values.status}
            onChange={handleChange}
          >
            <option value="todo">Por hacer</option>
            <option value="doing">En progreso</option>
            <option value="done">Hecho</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Prioridad
          <select
            className="rounded border border-slate-300 px-3 py-2"
            name="priority"
            value={values.priority}
            onChange={handleChange}
          >
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Bloques estimados
          <input
            type="number"
            min={0}
            className="rounded border border-slate-300 px-3 py-2"
            name="estimate_blocks"
            value={values.estimate_blocks}
            onChange={handleChange}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Fecha objetivo
          <input
            type="date"
            className="rounded border border-slate-300 px-3 py-2"
            name="target_date"
            value={values.target_date ?? ''}
            onChange={handleChange}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Programada para
          <input
            type="date"
            className="rounded border border-slate-300 px-3 py-2"
            name="scheduled_date"
            value={values.scheduled_date ?? ''}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Vence el
          <input
            type="datetime-local"
            className="rounded border border-slate-300 px-3 py-2"
            name="due_at"
            value={values.due_at ?? ''}
            onChange={handleChange}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Progreso (%)
          <input
            type="number"
            min={0}
            max={100}
            className="rounded border border-slate-300 px-3 py-2"
            name="progress"
            value={values.progress}
            onChange={handleChange}
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="rounded bg-slate-200 px-4 py-2" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Guardar
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
