
import clsx from 'clsx';

import { clsx } from 'clsx';

import { computeCountdown, bandColor } from '../utils/urgency';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onMarkDone: (task: Task) => void;
  onChangeStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const bandClasses: Record<string, string> = {
  none: 'bg-slate-200',
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onMarkDone, onChangeStatus, onEdit }) => {
  const band = bandColor(task.due_at, new Date());
  const countdown = computeCountdown(task.due_at, new Date());

  return (
    <div className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{task.title}</h3>
          {task.project && <p className="text-xs text-slate-500">{task.project}</p>}
        </div>
        <span className={clsx('h-2 w-16 rounded-full', bandClasses[band])} aria-hidden />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded bg-slate-100 px-2 py-1">Estado: {task.status}</span>
        <span className="rounded bg-slate-100 px-2 py-1">Prioridad: {task.priority}</span>
        <span className="rounded bg-slate-100 px-2 py-1">Progreso: {task.progress}%</span>
        <span className="rounded bg-slate-100 px-2 py-1">{countdown}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          className="rounded bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-600"
          onClick={() => onMarkDone(task)}
        >
          Marcar done
        </button>
        <button
          type="button"
          className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600"
          onClick={() => onChangeStatus(task)}
        >
          Cambiar estado
        </button>
        <button
          type="button"
          className="rounded bg-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-300"
          onClick={() => onEdit(task)}
        >
          Editar
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
