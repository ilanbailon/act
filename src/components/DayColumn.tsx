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
  );
};

export default DayColumn;
