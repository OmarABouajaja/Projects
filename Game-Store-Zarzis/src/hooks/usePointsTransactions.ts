import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PointsTransaction } from "@/types";

export const usePointsTransactions = (clientId?: string) => {
  return useQuery({
    queryKey: ["points-transactions", clientId],
    queryFn: async () => {
      let query = supabase
        .from("points_transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PointsTransaction[];
    },
  });
};

export const useCreatePointsTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: {
      client_id: string;
      transaction_type: "earned" | "spent" | "refund" | "bonus" | "adjustment";
      amount: number;
      description?: string;
      reference_type?: string;
      reference_id?: string;
      staff_id?: string;
    }) => {
      // Get current balance
      const { data: transactions } = await supabase
        .from("points_transactions")
        .select("amount")
        .eq("client_id", transaction.client_id)
        .order("created_at", { ascending: false });

      const currentBalance = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const newBalance = currentBalance + transaction.amount;

      const { data, error } = await supabase
        .from("points_transactions")
        .insert({
          ...transaction,
          balance_after: newBalance,
          confirmed_by_staff: true,
          confirmed_by_client: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Update client points balance
      await supabase
        .from("clients")
        .update({ points_balance: newBalance })
        .eq("id", transaction.client_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useRedeemPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      client_id,
      points_to_redeem,
      description,
      staff_id,
    }: {
      client_id: string;
      points_to_redeem: number;
      description: string;
      staff_id: string;
    }) => {
      // Check current balance
      const { data: client } = await supabase
        .from("clients")
        .select("points_balance")
        .eq("id", client_id)
        .single();

      if (!client || client.points_balance < points_to_redeem) {
        throw new Error("Insufficient points balance");
      }

      const { data, error } = await supabase
        .from("points_transactions")
        .insert({
          client_id,
          transaction_type: "spent",
          amount: -points_to_redeem,
          balance_after: client.points_balance - points_to_redeem,
          description,
          confirmed_by_staff: true,
          confirmed_by_client: false,
          staff_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update client points balance
      await supabase
        .from("clients")
        .update({ points_balance: client.points_balance - points_to_redeem })
        .eq("id", client_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
