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
          deposit_wallet: number;
          withdrawal_wallet: number;
          coins: number;
          package_name: string | null;
          package_expires_at: string | null;
          referral_code: string | null;
          total_deposits: number;
          total_earnings: number;
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
          user_email: string | null;
          amount: number;
          amount_sent: number | null;
          amount_pkr: number | null;
          transaction_id: string | null;
          status: string;
          transaction_reference: string | null;
          proof_image: string | null;
          proof_image_url: string | null;
          screenshot_url: string | null;
          image_url: string | null;
          proof_url: string | null;
          package_name: string | null;
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
          task_link: string | null;
          image_url: string | null;
          coins_reward: number;
          category: string | null;
          status: string;
          created_by: string | null;
          task_type: "one_time" | "repeated" | "ad";
          ad_duration_seconds: number | null;
          cooldown_minutes: number;
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
          proof_image_url: string | null;
          coins_earned: number;
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
          daily_tasks: number;
          per_task_coins: number;
          duration_days: number;
          duration: string;
          description: string | null;
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
          user_email: string | null;
          amount: number;
          amount_pkr: number | null;
          coins_used: number | null;
          status: string;
          payment_method: string | null;
          payment_details: Json | null;
          account_name: string | null;
          jazzcash_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Insert<Database["public"]["Tables"]["withdrawals"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["withdrawals"]["Row"]>;
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string | null;
          subject: string;
          message: string;
          screenshot_url: string | null;
          status: string;
          created_at: string;
        };
        Insert: Insert<Database["public"]["Tables"]["support_tickets"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["support_tickets"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      process_referral: { Args: { p_user_id: string; p_referral_code: string }; Returns: boolean | { success?: boolean; reason?: string } };
      approve_deposit: { Args: { p_deposit_id: string }; Returns: { amount: number } };
      reject_deposit: { Args: { p_deposit_id: string }; Returns: { id: string; status: string } };
      approve_withdrawal: { Args: { p_withdrawal_id: string }; Returns: { amount: number } };
      reject_withdrawal: { Args: { p_withdrawal_id: string }; Returns: { id: string; status: string } };
      approve_user_tasks: { Args: { p_task_ids: string[] }; Returns: Json };
      complete_ad_task: { Args: { p_task_id: string }; Returns: Json };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
