import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ServiceRequest {
  id: string;
  service_id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string;
  device_type: string | null;
  device_brand: string | null;
  device_model: string | null;
  issue_description: string;
  diagnosis: string | null;
  estimated_cost: number | null;
  final_cost: number | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  is_complex: boolean;
  started_at: string | null;
  completed_at: string | null;
  staff_id: string;
  notes: string | null;
  internal_notes: string | null;
  created_at: string;
}

export const useServiceRequests = (status?: string) => {
  return useQuery({
    queryKey: ["service-requests", status],
    queryFn: async () => {
      let query = supabase
        .from("service_requests")
        .select(`
          *,
          service:services_catalog(*)
        `)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching service requests:", error);
        throw error;
      }
      return data;
    },
  });
};

export const useTodayServiceRequests = () => {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["today-service-requests", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          *,
          service:services_catalog(*)
        `)
        .gte("created_at", `${today}T00:00:00`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<ServiceRequest, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("service_requests")
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["today-service-requests"] });
    },
  });
};

export const useUpdateServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Partial<ServiceRequest> & { id: string }) => {
      const { error } = await supabase
        .from("service_requests")
        .update(request)
        .eq("id", request.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["today-service-requests"] });
    },
  });
};