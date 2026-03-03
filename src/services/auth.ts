import { supabase } from '@/lib/supabase'
import type { User, AuthError, PostgrestError } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'

export interface AuthResponse {
  user: User | null
  profile: Profile | null
  error: AuthError | PostgrestError | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
  role: 'Provider' | 'Requester'
  entityTypeId?: string
  cityId?: string
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const client = supabase as any
      if (!client) {
        return { user: null, profile: null, error: { message: 'Supabase client not initialized' } as AuthError }
      }
      const { data, error } = await client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { user: null, profile: null, error }
      }

      if (data.user) {
        const { data: profileData, error: profileError } = await client
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          return { user: data.user, profile: null, error: profileError }
        }

        return { user: data.user, profile: profileData, error: null }
      }

      return { user: null, profile: null, error: null }
    } catch (error) {
      return { user: null, profile: null, error: error as AuthError }
    }
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const client = supabase as any
      if (!client) {
        return { user: null, profile: null, error: { message: 'Supabase client not initialized' } as AuthError }
      }
      const { data, error } = await client.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            role: credentials.role,
            full_name: credentials.fullName,
          }
        }
      })

      if (error) {
        return { user: null, profile: null, error }
      }

      if (data.user) {
        const { data: profileData, error: profileError } = await client
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: credentials.fullName,
            email: credentials.email,
            phone_number: credentials.phoneNumber,
            role: credentials.role,
            entity_type_id: credentials.entityTypeId,
            city_id: credentials.cityId,
            is_active: true,
          })
          .select()
          .single()

        if (profileError) {
          return { user: data.user, profile: null, error: profileError }
        }

        return { user: data.user, profile: profileData, error: null }
      }

      return { user: null, profile: null, error: null }
    } catch (error) {
      return { user: null, profile: null, error: error as AuthError }
    }
  }

  async logout(): Promise<{ error: AuthError | null }> {
    try {
      const client = supabase as any
      if (!client) {
        return { error: { message: 'Supabase client not initialized' } as AuthError }
      }
      const { error } = await client.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const client = supabase as any
      if (!client) {
        return { user: null, profile: null, error: { message: 'Supabase client not initialized' } as AuthError }
      }
      const { data: { user }, error } = await client.auth.getUser()

      if (error || !user) {
        return { user: null, profile: null, error }
      }

      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return { user, profile: null, error: profileError }
      }

      return { user, profile: profileData, error: null }
    } catch (error) {
      return { user: null, profile: null, error: error as AuthError }
    }
  }

  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: AuthError | PostgrestError | null }> {
    try {
      const client = supabase as any
      if (!client) {
        return { profile: null, error: { message: 'Supabase client not initialized' } as AuthError }
      }
      const { data, error } = await client
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single()

      return { profile: data, error }
    } catch (error) {
      return { profile: null, error: error as AuthError }
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const client = supabase as any
    if (!client) {
      return { data: { subscription: { unsubscribe: () => { } } } }
    }
    return client.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()
