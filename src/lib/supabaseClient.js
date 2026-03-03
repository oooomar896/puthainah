import { supabase as supabaseShared } from "./supabase";

/**
 * Shared Supabase client instance to avoid multiple GoTrueClient warnings.
 * This re-exports the main instance from supabase.ts to ensure a singleton pattern.
 */
export const supabase = supabaseShared;
