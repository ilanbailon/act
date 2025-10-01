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
