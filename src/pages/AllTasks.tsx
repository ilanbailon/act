import { useMemo, useState } from "react";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import { useDeleteTask, useInsertTask, useTasksQuery, useUpdateTask } from "../hooks/useTasks";
import type { Task, TaskPayload } from "../types";
import { useToast } from "../providers/ToastProvider";

const statuses = ["", "todo", "doing", "done", "blocked"] as const;
const priorities = ["", 0, 1, 2] as const;

const AllTasksPage = () => {
  const { data: tasks = [], isLoading } = useTasksQuery();
  const insertTask = useInsertTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { push } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("");
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorities)[number]>("");
  const [projectFilter, setProjectFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const projects = useMemo(() => {
    const unique = new Set<string>();
    tasks.forEach((task) => {
      if (task.project) unique.add(task.project);
    });
    return Array.from(unique);
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && task.status !== statusFilter) return false;
      if (projectFilter && task.project !== projectFilter) return false;
      if (priorityFilter !== "" && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, search, statusFilter, projectFilter, priorityFilter]);

  const handleCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSubmit = async (payload: TaskPayload) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, payload });
      push({ title: "Tarea actualizada", type: "success" });
    } else {
      await insertTask.mutateAsync(payload);
      push({ title: "Tarea creada", type: "success" });
    }
    setShowForm(false);
  };

  const handleDelete = (task: Task) => {
    const confirmed = window.confirm(`¿Eliminar "${task.title}"?`);
    if (!confirmed) return;
    deleteTask.mutate(task.id, {
      onSuccess: () => push({ title: "Tarea eliminada", type: "success" }),
      onError: () => push({ title: "No se pudo eliminar", type: "error" })
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Todas las tareas</h1>
          <p className="text-sm text-slate-400">Busca, filtra y gestiona tu backlog.</p>
        </div>
        <button
          onClick={handleCreate}
          className="rounded-md bg-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/30"
        >
          Nueva tarea
        </button>
      </header>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Buscar</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
              placeholder="Título de la tarea"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Estado</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="todo">Por hacer</option>
              <option value="doing">En progreso</option>
              <option value="done">Hechas</option>
              <option value="blocked">Bloqueadas</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Prioridad</label>
            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value === "" ? "" : Number(event.target.value) as 0 | 1 | 2)
              }
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
            >
              <option value="">Todas</option>
              <option value="2">Alta</option>
              <option value="1">Media</option>
              <option value="0">Baja</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Proyecto</label>
            <select
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
            >
              <option value="">Todos</option>
              {projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
      {isLoading ? (
        <p className="text-slate-400">Cargando tareas...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
          No encontramos tareas con esos filtros.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((task) => (
            <div key={task.id} className="relative">
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
              <button
                onClick={() => handleDelete(task)}
                className="absolute right-4 top-4 rounded-full border border-slate-700 bg-slate-900/80 p-2 text-xs text-slate-400 hover:bg-rose-500/20 hover:text-rose-200"
              >
                Borrar
              </button>
            </div>
          ))}
        </div>
      )}
      <TaskForm
        open={showForm}
        initialTask={editingTask}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AllTasksPage;
