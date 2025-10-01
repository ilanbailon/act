import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Task, TaskPayload } from "../types";
import { useAuth } from "../providers/AuthProvider";

const TASKS_KEY = ["tasks"] as const;

const fetchTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("tasks") // Ajusta el nombre de la tabla si cambia en Supabase.
    .select("*")
    .eq("user_id", userId)
    .order("scheduled_date", { ascending: true, nullsFirst: true })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Task[];
};

export const useTasksQuery = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: [...TASKS_KEY, userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([] as Task[]);
      return fetchTasks(userId);
    },
    enabled: Boolean(userId)
  });
};

export const useInsertTask = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async (payload: TaskPayload) => {
      if (!session?.user.id) throw new Error("No user session");
      const { error } = await supabase
        .from("tasks") // Ajusta campos/tabla aquí si cambian en Supabase.
        .insert({ ...payload, user_id: session.user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<TaskPayload> }) => {
      const { error } = await supabase
        .from("tasks") // Ajusta campos/tabla aquí si cambian en Supabase.
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY })
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tasks") // Ajusta campos/tabla aquí si cambian en Supabase.
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY })
  });
};
