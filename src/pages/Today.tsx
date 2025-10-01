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
    </div>
  );
};

export default TodayPage;
