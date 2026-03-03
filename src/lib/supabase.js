import { supabaseAdmin as sharedAdmin, validateSupabaseAdminKey as sharedValidate } from "./supabase";

/**
 * Shared Supabase Admin client instance.
 * This re-exports from supabase.ts to maintain a single point of initialization.
 */
export const supabaseAdmin = sharedAdmin;
export const validateSupabaseAdminKey = sharedValidate;
