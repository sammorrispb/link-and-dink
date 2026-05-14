// Supabase database types.
//
// Hand-authored to match supabase/migrations/* exactly so the app type-checks
// without a running local stack. Once Docker + `supabase start` are available,
// regenerate the canonical version with `pnpm types` (or `pnpm types:linked`).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string | null;
          phone: string | null;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email?: string | null;
          phone?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          email?: string | null;
          phone?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          display_name: string;
          dupr_id: string | null;
          dupr_rating: number | null;
          dupr_reliability: number | null;
          dupr_synced_at: string | null;
          ld_rating: number | null;
          ld_bracket: string | null;
          eval_status: string | null;
          eval_coach_account_id: string | null;
          eval_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          display_name: string;
          dupr_id?: string | null;
          dupr_rating?: number | null;
          dupr_reliability?: number | null;
          dupr_synced_at?: string | null;
          ld_rating?: number | null;
          ld_bracket?: string | null;
          eval_status?: string | null;
          eval_coach_account_id?: string | null;
          eval_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          dupr_id?: string | null;
          dupr_rating?: number | null;
          dupr_reliability?: number | null;
          dupr_synced_at?: string | null;
          ld_rating?: number | null;
          ld_bracket?: string | null;
          eval_status?: string | null;
          eval_coach_account_id?: string | null;
          eval_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      player_account_links: {
        Row: {
          id: string;
          account_id: string;
          player_id: string;
          link_type: string;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          player_id: string;
          link_type: string;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          player_id?: string;
          link_type?: string;
          verified_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          slug: string;
          title: string;
          starts_at: string;
          ends_at: string | null;
          venue_name: string;
          venue_address: string | null;
          bracket: string;
          format: string;
          entry_fee_cents: number;
          pot_amount_cents: number;
          pot_split: string;
          max_players: number;
          organizer_account_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          starts_at: string;
          ends_at?: string | null;
          venue_name: string;
          venue_address?: string | null;
          bracket: string;
          format?: string;
          entry_fee_cents?: number;
          pot_amount_cents: number;
          pot_split?: string;
          max_players?: number;
          organizer_account_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          starts_at?: string;
          ends_at?: string | null;
          venue_name?: string;
          venue_address?: string | null;
          bracket?: string;
          format?: string;
          entry_fee_cents?: number;
          pot_amount_cents?: number;
          pot_split?: string;
          max_players?: number;
          organizer_account_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          event_id: string;
          player_id: string;
          account_id: string;
          payment_status: string;
          payment_intent_id: string | null;
          paid_at: string | null;
          status: string;
          position: number | null;
          checked_in_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          player_id: string;
          account_id: string;
          payment_status?: string;
          payment_intent_id?: string | null;
          paid_at?: string | null;
          status?: string;
          position?: number | null;
          checked_in_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          player_id?: string;
          account_id?: string;
          payment_status?: string;
          payment_intent_id?: string | null;
          paid_at?: string | null;
          status?: string;
          position?: number | null;
          checked_in_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          event_id: string;
          round: number;
          court: number;
          stage: string;
          team_a_player1_id: string | null;
          team_a_player2_id: string | null;
          team_b_player1_id: string | null;
          team_b_player2_id: string | null;
          team_a_score: number | null;
          team_b_score: number | null;
          submitted_by_account_id: string | null;
          submitted_at: string | null;
          confirmed_at: string | null;
          disputed_at: string | null;
          resolved_by_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          round: number;
          court: number;
          stage: string;
          team_a_player1_id?: string | null;
          team_a_player2_id?: string | null;
          team_b_player1_id?: string | null;
          team_b_player2_id?: string | null;
          team_a_score?: number | null;
          team_b_score?: number | null;
          submitted_by_account_id?: string | null;
          submitted_at?: string | null;
          confirmed_at?: string | null;
          disputed_at?: string | null;
          resolved_by_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          round?: number;
          court?: number;
          stage?: string;
          team_a_player1_id?: string | null;
          team_a_player2_id?: string | null;
          team_b_player1_id?: string | null;
          team_b_player2_id?: string | null;
          team_a_score?: number | null;
          team_b_score?: number | null;
          submitted_by_account_id?: string | null;
          submitted_at?: string | null;
          confirmed_at?: string | null;
          disputed_at?: string | null;
          resolved_by_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      current_account_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      account_in_event: {
        Args: { p_event_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

// Convenience row aliases.
export type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
export type PlayerRow = Database["public"]["Tables"]["players"]["Row"];
export type PlayerAccountLinkRow = Database["public"]["Tables"]["player_account_links"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type RsvpRow = Database["public"]["Tables"]["rsvps"]["Row"];
export type MatchRow = Database["public"]["Tables"]["matches"]["Row"];
