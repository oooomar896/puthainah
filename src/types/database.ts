export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone_number: string | null
          role: 'Admin' | 'Provider' | 'Requester'
          entity_type_id: string | null
          city_id: string | null
          commercial_register: string | null
          commercial_register_confirmation_date: string | null
          avatar_url: string | null
          is_blocked: boolean
          is_suspended: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone_number?: string | null
          role: 'Admin' | 'Provider' | 'Requester'
          entity_type_id?: string | null
          city_id?: string | null
          commercial_register?: string | null
          commercial_register_confirmation_date?: string | null
          avatar_url?: string | null
          is_blocked?: boolean
          is_suspended?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone_number?: string | null
          role?: 'Admin' | 'Provider' | 'Requester'
          entity_type_id?: string | null
          city_id?: string | null
          commercial_register?: string | null
          commercial_register_confirmation_date?: string | null
          avatar_url?: string | null
          is_blocked?: boolean
          is_suspended?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name_ar: string
          name_en: string
          description_ar: string | null
          description_en: string | null
          price: number | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_ar: string
          name_en: string
          description_ar?: string | null
          description_en?: string | null
          price?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_ar?: string
          name_en?: string
          description_ar?: string | null
          description_en?: string | null
          price?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          requester_id: string
          service_id: string | null
          title: string
          description: string | null
          status_id: string
          price: number | null
          provider_id: string | null
          admin_notes: string | null
          requester_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          service_id?: string | null
          title: string
          description?: string | null
          status_id?: string
          price?: number | null
          provider_id?: string | null
          admin_notes?: string | null
          requester_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          service_id?: string | null
          title?: string
          description?: string | null
          status_id?: string
          price?: number | null
          provider_id?: string | null
          admin_notes?: string | null
          requester_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          request_id: string
          requester_id: string
          provider_id: string
          title: string
          description: string | null
          status_id: string
          price: number
          started_at: string | null
          completed_at: string | null
          requester_notes: string | null
          provider_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          requester_id: string
          provider_id: string
          title: string
          description?: string | null
          status_id?: string
          price: number
          started_at?: string | null
          completed_at?: string | null
          requester_notes?: string | null
          provider_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          requester_id?: string
          provider_id?: string
          title?: string
          description?: string | null
          status_id?: string
          price?: number
          started_at?: string | null
          completed_at?: string | null
          requester_notes?: string | null
          provider_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          request_id: string | null
          project_id: string | null
          ticket_id: string | null
          uploaded_by: string
          file_name: string
          file_url: string
          file_type: string | null
          file_size: number | null
          storage_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          request_id?: string | null
          project_id?: string | null
          ticket_id?: string | null
          uploaded_by: string
          file_name: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          storage_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string | null
          project_id?: string | null
          ticket_id?: string | null
          uploaded_by?: string
          file_name?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          storage_path?: string | null
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          project_id: string
          rater_id: string
          rated_user_id: string
          score: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          rater_id: string
          rated_user_id: string
          score: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          rater_id?: string
          rated_user_id?: string
          score?: number
          comment?: string | null
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          admin_id: string | null
          title: string
          description: string | null
          status_id: string
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          admin_id?: string | null
          title: string
          description?: string | null
          status_id?: string
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          admin_id?: string | null
          title?: string
          description?: string | null
          status_id?: string
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_id?: string
          message?: string
          created_at?: string
        }
      }
      faqs: {
        Row: {
          id: string
          question_ar: string
          question_en: string
          answer_ar: string
          answer_en: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_ar: string
          question_en: string
          answer_ar: string
          answer_en: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_ar?: string
          question_en?: string
          answer_ar?: string
          answer_en?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      partners: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          website_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          website_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string | null
          related_id: string | null
          related_type: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string | null
          related_id?: string | null
          related_type?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string | null
          related_id?: string | null
          related_type?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          name_ar: string
          name_en: string
          created_at: string
        }
        Insert: {
          id?: string
          name_ar: string
          name_en: string
          created_at?: string
        }
        Update: {
          id?: string
          name_ar?: string
          name_en?: string
          created_at?: string
        }
      }
      entity_types: {
        Row: {
          id: string
          name_ar: string
          name_en: string
          type: 'requester' | 'provider'
          created_at: string
        }
        Insert: {
          id?: string
          name_ar: string
          name_en: string
          type: 'requester' | 'provider'
          created_at?: string
        }
        Update: {
          id?: string
          name_ar?: string
          name_en?: string
          type?: 'requester' | 'provider'
          created_at?: string
        }
      }
      request_statuses: {
        Row: {
          id: string
          name_ar: string
          name_en: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name_ar: string
          name_en: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name_ar?: string
          name_en?: string
          code?: string
          created_at?: string
        }
      }
      project_statuses: {
        Row: {
          id: string
          name_ar: string
          name_en: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name_ar: string
          name_en: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name_ar?: string
          name_en?: string
          code?: string
          created_at?: string
        }
      }
      ticket_statuses: {
        Row: {
          id: string
          name_ar: string
          name_en: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name_ar: string
          name_en?: string
          code?: string
          created_at?: string
        }
        Update: {
          id?: string
          name_ar?: string
          name_en?: string
          code?: string
          created_at?: string
        }
      }
    }
    Views: {
      project_statistics: {
        Row: {
          id: string
          requester_id: string
          provider_id: string
          total_ratings: number
          average_rating: number
        }
      }
    }
    Functions: {
      get_user_statistics: {
        Args: { user_id_param: string }
        Returns: {
          total_projects: number
          completed_projects: number
          average_rating: number
          total_ratings: number
        }[]
      }
      get_admin_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          total_providers: number
          total_requesters: number
          total_requests: number
          total_projects: number
          pending_requests: number
          completed_projects: number
        }[]
      }
    }
  }
}
