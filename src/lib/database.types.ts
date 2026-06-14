export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      daily_metrics: {
        Row: {
          id: string;
          date: string;
          hrv: number | null;
          resting_hr: number | null;
          sleep_duration_min: number | null;
          sleep_score: number | null;
          body_battery_start: number | null;
          stress_avg: number | null;
          steps: number | null;
          weight_kg: number | null;
          ctl: number | null;
          atl: number | null;
          tsb: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_metrics']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_metrics']['Insert']>;
      };
      workouts: {
        Row: {
          id: string;
          interval_id: string | null;
          garmin_activity_id: string | null;
          date: string;
          type: string;
          name: string;
          duration_sec: number | null;
          distance_m: number | null;
          avg_hr: number | null;
          max_hr: number | null;
          avg_pace_sec_per_km: number | null;
          avg_cadence: number | null;
          training_load: number | null;
          hr_zone_1_min: number | null;
          hr_zone_2_min: number | null;
          hr_zone_3_min: number | null;
          hr_zone_4_min: number | null;
          hr_zone_5_min: number | null;
          ai_analysis: string | null;
          drag_median_pace_sec: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workouts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['workouts']['Insert']>;
      };
      drag_intervals: {
        Row: {
          id: string;
          workout_id: string;
          sequence: number;
          duration_sec: number;
          avg_pace_sec_per_km: number;
          avg_hr: number;
          max_hr: number;
          hr_drop_in_rest: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['drag_intervals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['drag_intervals']['Insert']>;
      };
      nutrition_logs: {
        Row: {
          id: string;
          logged_at: string;
          description: string;
          kcal: number;
          protein_g: number;
          carbs_g: number | null;
          fat_g: number | null;
          source: 'photo' | 'preset' | 'manual';
          image_url: string | null;
          preset_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['nutrition_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['nutrition_logs']['Insert']>;
      };
      meal_presets: {
        Row: {
          id: string;
          name: string;
          description: string;
          kcal: number;
          protein_g: number;
          carbs_g: number | null;
          fat_g: number | null;
          emoji: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['meal_presets']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['meal_presets']['Insert']>;
      };
      coaching_messages: {
        Row: {
          id: string;
          created_at: string;
          type: string;
          message: string;
          data_snapshot: Json | null;
          workout_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['coaching_messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['coaching_messages']['Insert']>;
      };
      push_subscriptions: {
        Row: {
          id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['push_subscriptions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>;
      };
      training_plan: {
        Row: {
          id: string;
          week_number: number;
          date_start: string;
          date_end: string;
          target_km: number;
          phase: string;
          key_session: string;
          is_light_week: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['training_plan']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['training_plan']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
