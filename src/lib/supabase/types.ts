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
      coach_up_applications: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          phone: string | null;
          neighborhood: string | null;
          dupr: string | null;
          years_played: string | null;
          where_play: string | null;
          why: string;
          hours_per_week: string | null;
          weekend_availability: string | null;
          commit_12wk: string | null;
          honesty: string | null;
          source: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          phone?: string | null;
          neighborhood?: string | null;
          dupr?: string | null;
          years_played?: string | null;
          where_play?: string | null;
          why: string;
          hours_per_week?: string | null;
          weekend_availability?: string | null;
          commit_12wk?: string | null;
          honesty?: string | null;
          source?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          neighborhood?: string | null;
          dupr?: string | null;
          years_played?: string | null;
          where_play?: string | null;
          why?: string;
          hours_per_week?: string | null;
          weekend_availability?: string | null;
          commit_12wk?: string | null;
          honesty?: string | null;
          source?: string | null;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          display_name: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          venmo_handle: string | null;
          email: string | null;
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
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          venmo_handle?: string | null;
          email?: string | null;
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
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          venmo_handle?: string | null;
          email?: string | null;
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
          pot_funder: string | null;
          pot_split: string;
          max_players: number;
          game_length: number | null;
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
          pot_funder?: string | null;
          pot_split?: string;
          max_players?: number;
          game_length?: number | null;
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
          pot_funder?: string | null;
          pot_split?: string;
          max_players?: number;
          game_length?: number | null;
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
          account_id: string | null;
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
          account_id?: string | null;
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
          account_id?: string | null;
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
          pool: string | null;
          team_a_id: string | null;
          team_b_id: string | null;
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
          locked_at: string | null;
          locked_by_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          round: number;
          court: number;
          stage: string;
          pool?: string | null;
          team_a_id?: string | null;
          team_b_id?: string | null;
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
          locked_at?: string | null;
          locked_by_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          round?: number;
          court?: number;
          stage?: string;
          pool?: string | null;
          team_a_id?: string | null;
          team_b_id?: string | null;
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
          locked_at?: string | null;
          locked_by_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          event_id: string;
          player1_id: string;
          player2_id: string;
          label: string | null;
          seed: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          player1_id: string;
          player2_id: string;
          label?: string | null;
          seed?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          player1_id?: string;
          player2_id?: string;
          label?: string | null;
          seed?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      round_byes: {
        Row: {
          id: string;
          event_id: string;
          round: number;
          player_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          round: number;
          player_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          round?: number;
          player_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      playoff_pairings: {
        Row: {
          event_id: string;
          rule: string;
          qualifier_count: number;
          teams_json: Json;
          locked_at: string;
          locked_by_account_id: string | null;
        };
        Insert: {
          event_id: string;
          rule: string;
          qualifier_count: number;
          teams_json: Json;
          locked_at?: string;
          locked_by_account_id?: string | null;
        };
        Update: {
          event_id?: string;
          rule?: string;
          qualifier_count?: number;
          teams_json?: Json;
          locked_at?: string;
          locked_by_account_id?: string | null;
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
      account_is_organizer: {
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
export type TeamRow = Database["public"]["Tables"]["teams"]["Row"];
export type RoundByeRow = Database["public"]["Tables"]["round_byes"]["Row"];
export type PlayoffPairingRow = Database["public"]["Tables"]["playoff_pairings"]["Row"];
