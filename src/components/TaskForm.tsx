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
