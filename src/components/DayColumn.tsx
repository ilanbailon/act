import type { Task } from "../types";
import TaskCard from "./TaskCard";

interface DayColumnProps {
  label: string;
  iso: string;
  isToday?: boolean;
  tasks: Task[];
  onDropTask: (taskId: string, iso: string) => void;
  onEdit: (task: Task) => void;
  onMarkDone: (task: Task) => void;
  onCycleStatus: (task: Task) => void;
}

export const DayColumn = ({
  label,
  iso,
  isToday,
  tasks,
  onDropTask,
  onEdit,
  onMarkDone,
  onCycleStatus
}: DayColumnProps) => {
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/task-id");
    if (taskId) {
      onDropTask(taskId, iso);
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLElement>, taskId: string) => {
    event.dataTransfer.setData("text/task-id", taskId);
  };

  return (
    <section
      className="flex min-h-[320px] flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <header className="mb-3 flex items-center justify-between text-sm text-slate-300">
        <span className="font-semibold text-white">{label}</span>
        {isToday ? <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">Hoy</span> : null}
      </header>
      <div className="flex flex-1 flex-col gap-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500">Sin tareas</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(event) => handleDragStart(event, task.id)}
            >
              <TaskCard task={task} onEdit={onEdit} onMarkDone={onMarkDone} onCycleStatus={onCycleStatus} />
            </div>
          ))
        )}
      </div>
    </section>
import { format } from 'date-fns';
import { useMemo } from 'react';
import TaskCard from './TaskCard';
import type { Task } from '../types';

interface DayColumnProps {
  date: Date;
  tasks: Task[];
  onDropTask: (taskId: string, newDate: string | null) => void;
  onMarkDone: (task: Task) => void;
  onChangeStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({
  date,
  tasks,
  onDropTask,
  onMarkDone,
  onChangeStatus,
  onEdit,
}) => {
  const isoDate = useMemo(() => format(date, 'yyyy-MM-dd'), [date]);

  return (
    <div
      className="flex min-h-[200px] flex-1 flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        const taskId = event.dataTransfer.getData('text/plain');
        if (!taskId) return;
        const shouldMove = window.confirm(`¿Mover tarea al ${isoDate}?`);
        if (shouldMove) {
          onDropTask(taskId, isoDate);
        }
      }}
    >
      <header className="flex items-center justify-between text-sm text-slate-600">
        <span className="font-medium text-slate-800">{format(date, 'EEE dd')}</span>
        <span>{tasks.length} tareas</span>
      </header>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(event) => event.dataTransfer.setData('text/plain', task.id)}
          >
            <TaskCard task={task} onMarkDone={onMarkDone} onChangeStatus={onChangeStatus} onEdit={onEdit} />
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="rounded bg-white p-3 text-center text-xs text-slate-400">Sin tareas</p>
        )}
      </div>
    </div>
  );
};

export default DayColumn;
