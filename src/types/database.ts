export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row = Record<string, unknown>;
type Insert<T extends Row> = Partial<T>;
type Update<T extends Row> = Partial<T>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          referred_by: string | null;
          coin_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Insert<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      deposits: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: string;
          transaction_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Insert<Database["public"]["Tables"]["deposits"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["deposits"]["Row"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          reward: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Insert<Database["public"]["Tables"]["tasks"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };
      user_tasks: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          status: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Insert<Database["public"]["Tables"]["user_tasks"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["user_tasks"]["Row"]>;
        Relationships: [];
      };
      packages_settings: {
        Row: {
          id: string;
          name: string;
          price: number;
          coin_reward: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Insert<Database["public"]["Tables"]["packages_settings"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["packages_settings"]["Row"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Insert<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
      withdrawals: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: string;
          payment_method: string | null;
          payment_details: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Insert<Database["public"]["Tables"]["withdrawals"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["withdrawals"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
