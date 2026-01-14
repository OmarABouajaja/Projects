import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface StaffShift {
  id: string;
  staff_id: string;
  check_in: string;
  check_out: string | null;
  notes: string | null;
}

export const useActiveShift = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["active-shift", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("staff_shifts")
        .select("*")
        .eq("staff_id", user.id)
        .is("check_out", null)
        .order("check_in", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as StaffShift | null;
    },
    enabled: !!user,
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("staff_shifts")
        .insert({
          staff_id: user.id,
          check_in: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-shift"] });
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shiftId: string) => {
      const { error } = await supabase
        .from("staff_shifts")
        .update({
          check_out: new Date().toISOString(),
        })
        .eq("id", shiftId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-shift"] });
    },
  });
};