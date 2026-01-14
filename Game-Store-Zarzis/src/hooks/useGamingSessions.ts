import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export interface GamingSession {
  id: string;
  console_id: string;
  client_id: string | null;
  pricing_id: string;
  session_type: string;
  start_time: string;
  end_time: string | null;
  games_played: number;
  extra_time_minutes: number;
  base_amount: number;
  extra_amount: number;
  total_amount: number;
  points_earned: number;
  is_free_game: boolean;
  payment_method: string;
  points_used: number;
  status: string;
  staff_id: string;
  notes: string | null;
}

export const useActiveSessions = () => {
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("sessions-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gaming_sessions",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
          queryClient.invalidateQueries({ queryKey: ["consoles"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["active-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gaming_sessions")
        .select(`
          *,
          console:consoles(*),
          client:clients(*),
          pricing:pricing(*)
        `)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
  });
};

export const useTodaySessions = () => {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["today-sessions", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gaming_sessions")
        .select(`
          *,
          console:consoles(*),
          client:clients(*),
          pricing:pricing(*)
        `)
        .gte("created_at", `${today}T00:00:00`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: {
      console_id: string;
      client_id?: string;
      pricing_id: string;
      session_type: string;
      staff_id: string;
      is_free_game?: boolean;
      notes?: string;
    }) => {
      // Start the session
      const { data: newSession, error: sessionError } = await supabase
        .from("gaming_sessions")
        .insert({
          ...session,
          status: "active",
          start_time: new Date().toISOString(),
          notes: session.notes || null,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Update console status
      const { error: consoleError } = await supabase
        .from("consoles")
        .update({
          status: "in_use",
          current_session_id: newSession.id,
        })
        .eq("id", session.console_id);

      if (consoleError) throw consoleError;

      return newSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["consoles"] });
      queryClient.invalidateQueries({ queryKey: ["today-sessions"] });
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      session_id,
      console_id,
      total_amount,
      games_played,
      extra_time_minutes,
      extra_amount,
      points_earned,
      payment_method,
      points_used,
      client_id,
    }: {
      session_id: string;
      console_id: string;
      total_amount: number;
      games_played?: number;
      extra_time_minutes?: number;
      extra_amount?: number;
      points_earned?: number;
      payment_method?: string;
      points_used?: number;
      client_id?: string | null;
    }) => {
      // End the session
      const { error: sessionError } = await supabase
        .from("gaming_sessions")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
          total_amount,
          games_played: games_played || 0,
          extra_time_minutes: extra_time_minutes || 0,
          extra_amount: extra_amount || 0,
          points_earned: points_earned || 0,
          payment_method: payment_method || "cash",
          points_used: points_used || 0,
          client_id: client_id || null,
        })
        .eq("id", session_id);

      if (sessionError) throw sessionError;

      // Update console status
      const { error: consoleError } = await supabase
        .from("consoles")
        .update({
          status: "available",
          current_session_id: null,
        })
        .eq("id", console_id);

      if (consoleError) throw consoleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["consoles"] });
      queryClient.invalidateQueries({ queryKey: ["today-sessions"] });
    },
  });
};

export const useAddGameToSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      session_id,
      games_played,
      extra_time_minutes,
      extra_amount,
    }: {
      session_id: string;
      games_played: number;
      extra_time_minutes?: number;
      extra_amount?: number;
    }) => {
      const { error } = await supabase
        .from("gaming_sessions")
        .update({
          games_played,
          extra_time_minutes: extra_time_minutes || 0,
          extra_amount: extra_amount || 0,
        })
        .eq("id", session_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
    },
  });
};