import { useMemo, useState } from "react";
import DayColumn from "../components/DayColumn";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import { useTasksQuery, useUpdateTask } from "../hooks/useTasks";
import type { Task } from "../types";
import { getWeekDays } from "../utils/date";
import { useToast } from "../providers/ToastProvider";

const WeekPage = () => {
  const { data: tasks = [], isLoading } = useTasksQuery();
  const updateTask = useUpdateTask();
  const { push } = useToast();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const weekDays = useMemo(() => getWeekDays(), []);

  const grouped = useMemo(() => {
    return weekDays.map((day) => ({
      ...day,
      tasks: tasks.filter((task) => task.scheduled_date === day.iso)
    }));
  }, [weekDays, tasks]);

  const backlog = tasks.filter((task) => !task.scheduled_date);

  const handleDropTask = (taskId: string, iso: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.scheduled_date === iso) return;
    const confirmed = window.confirm(
      `¿Mover "${task.title}" al ${iso}? Esto actualizará la fecha programada.`
    );
    if (!confirmed) return;
    updateTask.mutate(
      { id: task.id, payload: { scheduled_date: iso } },
      {
        onSuccess: () => push({ title: "Tarea reprogramada", type: "success" }),
        onError: () => push({ title: "No se pudo actualizar", type: "error" })
      }
    );
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Semana</h1>
        <p className="text-sm text-slate-400">Arrastra tareas entre días para reprogramarlas.</p>
      </header>
      {isLoading ? (
        <p className="text-slate-400">Cargando tareas...</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {grouped.map((day) => (
              <DayColumn
                key={day.iso}
                label={day.label}
                iso={day.iso}
                isToday={day.isToday}
                tasks={day.tasks}
                onDropTask={handleDropTask}
                onEdit={handleEdit}
                onMarkDone={(task) =>
                  updateTask.mutate(
                    { id: task.id, payload: { status: "done", progress: 100 } },
                    {
                      onSuccess: () => push({ title: "Tarea completada", type: "success" }),
                      onError: () => push({ title: "No se pudo actualizar", type: "error" })
                    }
                  )
                }
                onCycleStatus={(task) =>
                  updateTask.mutate(
                    { id: task.id, payload: { status: task.status } },
                    {
                      onSuccess: () => push({ title: "Estado actualizado" }),
                      onError: () => push({ title: "No se pudo actualizar", type: "error" })
                    }
                  )
                }
              />
            ))}
          </div>
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="mb-3 text-lg font-semibold text-white">Sin programar</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {backlog.length === 0 ? (
                <p className="text-sm text-slate-500">Todas tus tareas tienen fecha asignada.</p>
              ) : (
                backlog.map((task) => (
                  <div key={task.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/task-id", task.id)}>
                    <TaskCard
                      task={task}
                      onEdit={handleEdit}
                      onMarkDone={(t) =>
                        updateTask.mutate(
                          { id: t.id, payload: { status: "done", progress: 100 } },
                          {
                            onSuccess: () => push({ title: "Tarea completada", type: "success" }),
                            onError: () => push({ title: "No se pudo actualizar", type: "error" })
                          }
                        )
                      }
                      onCycleStatus={(t) =>
                        updateTask.mutate(
                          { id: t.id, payload: { status: t.status } },
                          {
                            onSuccess: () => push({ title: "Estado actualizado" }),
                            onError: () => push({ title: "No se pudo actualizar", type: "error" })
                          }
                        )
                      }
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
      <TaskForm
        open={showForm}
        initialTask={editingTask}
        onClose={() => setShowForm(false)}
        onSubmit={async (payload) => {
          if (!editingTask) return;
          await updateTask.mutateAsync({ id: editingTask.id, payload });
          push({ title: "Tarea actualizada", type: "success" });
        }}
      />
    </div>
  );
};

export default WeekPage;
