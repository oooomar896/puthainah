import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-application-name': 'buthaina-platform',
        },
      },
    })
    : null

export const supabaseAdmin =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '') && (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '')
    ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
    : null

/**
 * Validate Supabase admin key by doing a lightweight query.
 * Returns { ok: boolean, message?: string }
 */
export async function validateSupabaseAdminKey() {
  if (!supabaseAdmin) return { ok: false, message: "supabaseAdmin not initialized" };
  try {
    const { data, error } = await supabaseAdmin.from("attachment_groups").select("id").limit(1);
    if (error) {
      console.error("Supabase key validation error:", error);
      return { ok: false, message: error.message || String(error) };
    }
    return { ok: true };
  } catch (e) {
    console.error("Supabase key validation unexpected error:", e);
    return { ok: false, message: String(e) };
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Profile = Tables<'profiles'>
export type Service = Tables<'services'>
export type Request = Tables<'requests'>
export type Project = Tables<'projects'>
export type Attachment = Tables<'attachments'>
export type Rating = Tables<'ratings'>
export type Ticket = Tables<'tickets'>
export type TicketMessage = Tables<'ticket_messages'>
export type FAQ = Tables<'faqs'>
export type Partner = Tables<'partners'>
export type Customer = Tables<'customers'>
export type Notification = Tables<'notifications'>
export type City = Tables<'cities'>
export type EntityType = Tables<'entity_types'>
export type RequestStatus = Tables<'request_statuses'>
export type ProjectStatus = Tables<'project_statuses'>
export type TicketStatus = Tables<'ticket_statuses'>

export type UserRole = 'Admin' | 'Provider' | 'Requester'
export type EntityTypeType = 'requester' | 'provider'
