import clsx from "clsx";
import type { Task } from "../types";
import { bandColor, computeCountdown } from "../utils/urgency";
import { formatDate } from "../utils/date";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onMarkDone: (task: Task) => void;
  onCycleStatus: (task: Task) => void;
}

const statusLabel: Record<Task["status"], string> = {
  todo: "Por hacer",
  doing: "En progreso",
  done: "Hecha",
  blocked: "Bloqueada"
};

const nextStatus: Record<Task["status"], Task["status"]> = {
  todo: "doing",
  doing: "done",
  done: "todo",
  blocked: "todo"
};

export const TaskCard = ({ task, onEdit, onMarkDone, onCycleStatus }: TaskCardProps) => {
  const band = bandColor(task.due_at);
  const countdown = computeCountdown(task.due_at);

  return (
    <article
      className={clsx(
        "rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow transition hover:border-slate-700",
        task.status === "done" && "opacity-70"
      )}
      draggable
      data-task-id={task.id}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{task.title}</h3>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {task.project ?? "General"} • {statusLabel[task.status]} • Prioridad {task.priority}
          </p>
        </div>
        <span
          className={clsx("h-2 w-16 rounded-full", {
            "bg-emerald-400/80": band === "green",
            "bg-amber-400/80": band === "amber",
            "bg-rose-400/80": band === "red",
            "bg-slate-700": band === "none"
          })}
        />
      </header>
      {task.note ? <p className="mt-3 text-sm text-slate-300">{task.note}</p> : null}
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
        <div>
          <dt className="uppercase tracking-wide">Vence</dt>
          <dd>{task.due_at ? formatDate(task.due_at, "PPp") : "Sin fecha"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Programada</dt>
          <dd>{task.scheduled_date ? formatDate(task.scheduled_date, "PP") : "Pendiente"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Progreso</dt>
          <dd>{task.progress}%</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Cuenta regresiva</dt>
          <dd>{countdown || "--"}</dd>
        </div>
      </dl>
      <footer className="mt-4 flex flex-wrap gap-2 text-sm">
        <button
          className="rounded-md bg-emerald-500/20 px-3 py-2 text-emerald-200 hover:bg-emerald-500/30"

import { computeCountdown, bandColor, type UrgencyBand } from '../utils/urgency';


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


const bandClasses: Record<UrgencyBand, string> = {

const bandClasses: Record<string, string> = {

  none: 'bg-slate-200',
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onMarkDone, onChangeStatus, onEdit }) => {
  const band = bandColor(task.due_at, new Date());

  const bandClass = bandClasses[band];


  const countdown = computeCountdown(task.due_at, new Date());

  return (
    <div className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{task.title}</h3>
          {task.project && <p className="text-xs text-slate-500">{task.project}</p>}
        </div>

        <span className={`h-2 w-16 rounded-full ${bandClass}`} aria-hidden />

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
          className="rounded-md bg-sky-500/20 px-3 py-2 text-sky-200 hover:bg-sky-500/30"
          onClick={() => onCycleStatus({ ...task, status: nextStatus[task.status] })}
        >
          Cambiar a {statusLabel[nextStatus[task.status]]}
        </button>
        <button
          className="rounded-md border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800"
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
      </footer>
    </article>
      </div>
    </div>
  );
};

export default TaskCard;
