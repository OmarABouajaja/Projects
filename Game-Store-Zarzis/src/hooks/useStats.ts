import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DailyStats {
  total_revenue: number;
  gaming_revenue: number;
  sales_revenue: number;
  service_revenue: number;
  total_sessions: number;
  total_sales: number;
  total_services: number;
}

export const useTodayStats = () => {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["today-stats", today],
    queryFn: async () => {
      // Get gaming sessions revenue
      const { data: sessions, error: sessionsError } = await supabase
        .from("gaming_sessions")
        .select("total_amount, status")
        .gte("created_at", `${today}T00:00:00`)
        .eq("status", "completed");

      if (sessionsError) throw sessionsError;

      // Get sales revenue
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("total_amount")
        .gte("created_at", `${today}T00:00:00`);

      if (salesError) throw salesError;

      // Get services revenue
      const { data: services, error: servicesError } = await supabase
        .from("service_requests")
        .select("final_cost, status")
        .gte("created_at", `${today}T00:00:00`)
        .eq("status", "completed");

      if (servicesError) throw servicesError;

      // Get all sessions count (active + completed)
      const { count: sessionCount, error: countError } = await supabase
        .from("gaming_sessions")
        .select("id", { count: "exact" })
        .gte("created_at", `${today}T00:00:00`);

      if (countError) throw countError;

      const gamingRevenue = sessions?.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0) || 0;
      const salesRevenue = sales?.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0) || 0;
      const serviceRevenue = services?.reduce((sum, s) => sum + (Number(s.final_cost) || 0), 0) || 0;

      return {
        total_revenue: gamingRevenue + salesRevenue + serviceRevenue,
        gaming_revenue: gamingRevenue,
        sales_revenue: salesRevenue,
        service_revenue: serviceRevenue,
        total_sessions: sessionCount || 0,
        total_sales: sales?.length || 0,
        total_services: services?.length || 0,
      } as DailyStats;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMonthlyStats = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  return useQuery({
    queryKey: ["monthly-stats", startOfMonth],
    queryFn: async () => {
      // Get gaming sessions revenue
      const { data: sessions, error: sessionsError } = await supabase
        .from("gaming_sessions")
        .select("total_amount")
        .gte("created_at", startOfMonth)
        .eq("status", "completed");

      if (sessionsError) throw sessionsError;

      // Get sales revenue
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("total_amount")
        .gte("created_at", startOfMonth);

      if (salesError) throw salesError;

      // Get services revenue
      const { data: services, error: servicesError } = await supabase
        .from("service_requests")
        .select("final_cost")
        .gte("created_at", startOfMonth)
        .eq("status", "completed");

      if (servicesError) throw servicesError;

      const gamingRevenue = sessions?.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0) || 0;
      const salesRevenue = sales?.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0) || 0;
      const serviceRevenue = services?.reduce((sum, s) => sum + (Number(s.final_cost) || 0), 0) || 0;

      return {
        total_revenue: gamingRevenue + salesRevenue + serviceRevenue,
        gaming_revenue: gamingRevenue,
        sales_revenue: salesRevenue,
        service_revenue: serviceRevenue,
        total_sessions: sessions?.length || 0,
        total_sales: sales?.length || 0,
        total_services: services?.length || 0,
      } as DailyStats;
    },
  });
};