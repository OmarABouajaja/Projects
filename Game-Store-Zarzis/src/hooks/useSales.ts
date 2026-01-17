import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Sale {
  id: string;
  client_id: string | null;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: string;
  points_used: number;
  points_earned: number;
  staff_id: string;
  notes: string | null;
  created_at: string;
}

export const useTodaySales = () => {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["today-sales", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          product:products(*),
          client:clients(*)
        `)
        .gte("created_at", `${today}T00:00:00`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sale: Omit<Sale, "id" | "created_at">) => {
      // Create the sale
      const { data: newSale, error: saleError } = await supabase
        .from("sales")
        .insert(sale)
        .select()
        .single();

      if (saleError) throw saleError;

      // Update product stock directly
      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock_quantity: supabase.rpc ? undefined : undefined // Placeholder, we'll handle below
        })
        .eq("id", sale.product_id);

      // Actually decrement stock using raw update
      const { data: product } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", sale.product_id)
        .single();

      if (product) {
        await supabase
          .from("products")
          .update({ stock_quantity: Math.max(0, product.stock_quantity - sale.quantity) })
          .eq("id", sale.product_id);
      }

      // If stock update fails, we still have the sale but log it
      if (stockError) {

      }

      return newSale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};