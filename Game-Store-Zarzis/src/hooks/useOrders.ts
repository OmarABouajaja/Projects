import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Order, OrderFormData } from "@/types";

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (orderData: OrderFormData) => {
            // 1. Calculate totals
            const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            let deliveryCost = 0;

            // Fetch delivery settings to get exact cost if needed, or trust frontend (should verify on backend in real app)
            // For now, we will trust the passed values or calculate simple logic
            if (orderData.delivery_method === 'rapid_post') deliveryCost = 10.000;
            if (orderData.delivery_method === 'local_delivery') deliveryCost = 7.000;

            const totalAmount = subtotal + deliveryCost;

            // Combine client info into notes since columns are missing
            const clientInfoNote = `
--- Client Info ---
Name: ${orderData.client_name}
Phone: ${orderData.client_phone}
Email: ${orderData.client_email || 'N/A'}
Address: ${orderData.delivery_address || 'N/A'}
-------------------`;

            const finalNotes = orderData.notes ? `${orderData.notes}\n${clientInfoNote}` : clientInfoNote;

            // 2. Insert Order
            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert({
                    delivery_method: orderData.delivery_method,
                    delivery_cost: deliveryCost,
                    subtotal: subtotal,
                    total_amount: totalAmount,
                    items: orderData.items, // JSONB column
                    payment_method: orderData.payment_method || 'cash',
                    payment_reference: orderData.payment_reference || null,
                    status: 'pending',
                    notes: finalNotes.trim()
                })
                .select()
                .single();

            if (orderError) throw orderError;
            return order;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};

export const useOrders = () => {
    return useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Order[];
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from("orders")
                .update({ status })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};
