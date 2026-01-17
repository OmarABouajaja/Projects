import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useAllActiveShifts = () => {
  return useQuery({
    queryKey: ["all-active-shifts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_shifts")
        .select(`
          *,
          profile:profiles!staff_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .is("check_out", null)
        .order("check_in", { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};