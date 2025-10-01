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
  );
};

export default TaskForm;
