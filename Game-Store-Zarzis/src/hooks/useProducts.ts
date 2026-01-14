import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Product {
  id: string;
  name: string;
  name_fr: string;
  name_ar: string;
  description: string | null;
  description_fr: string | null;
  description_ar: string | null;
  category: string;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  points_earned: number;
  points_price: number | null;
  image_url: string | null;
  is_active: boolean;
  product_type?: 'physical' | 'consumable' | 'digital';
  subcategory?: string;
  is_quick_sale?: boolean;
  digital_content?: string;
  is_digital_delivery?: boolean;
}

export const useProducts = (activeOnly = true) => {
  return useQuery({
    queryKey: ["products", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, "id">) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Partial<Product> & { id: string }) => {
      const { error } = await supabase
        .from("products")
        .update(product)
        .eq("id", product.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};