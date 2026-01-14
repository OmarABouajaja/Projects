import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface StoreSettings {
  opening_hours: { open: string; close: string };
  weekly_schedule: any;
  special_hours: any[];
  free_game_threshold: { games_required: number };
  points_config: { points_per_dt: number; dt_per_point: number };
  auth_config?: { enable_sms_verification: boolean };
  sms_enabled?: boolean;
  sms_phone?: string;
  sms_api_key?: string;
  free_games_enabled?: boolean;
  points_system_enabled?: boolean;
  help_tooltips_enabled?: boolean;
  tariff_display_mode?: 'cards' | 'table' | 'comparison';
  data_limit_mb?: number;
  delivery_settings?: any;
  theme_primary?: string;
  theme_secondary?: string;
  theme_accent?: string;
  default_pricing_ps4?: string;
  default_pricing_ps5?: string;
  payment_methods_config?: {
    bank_transfer: { enabled: boolean; details: string };
    d17: { enabled: boolean; details: string };
    direct_card: { enabled: boolean };
  };
}

export const useStoreSettings = () => {
  return useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*");

      if (error) throw error;

      const settings: any = {};
      data?.forEach((row: { key: string; value: unknown }) => {
        let value = row.value;
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Stay as string
          }
        }
        settings[row.key] = value;
      });

      return settings as StoreSettings;
    },
  });
};

export const useUpdateStoreSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { error } = await supabase
        .from("store_settings")
        .upsert({ key, value: value as any }, { onConflict: 'key' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
    },
  });
};