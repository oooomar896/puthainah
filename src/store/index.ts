import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'

interface AuthState {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setIsLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: true,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setProfile: (profile) => set({ profile }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        logout: () => set({ user: null, profile: null, isAuthenticated: false }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          profile: state.profile,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
)

interface NotificationState {
  notifications: Array<{
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    isRead: boolean
    createdAt: string
  }>
  unreadCount: number
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>()(
  devtools((set) => ({
    notifications: [],
    unreadCount: 0,
    addNotification: (notification) =>
      set((state) => ({
        notifications: [
          {
            ...notification,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          },
          ...state.notifications,
        ],
        unreadCount: state.unreadCount + 1,
      })),
    markAsRead: (id) =>
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })),
    markAllAsRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      })),
    clearNotifications: () =>
      set({
        notifications: [],
        unreadCount: 0,
      }),
  }))
)

interface UIState {
  isSidebarOpen: boolean
  isMobileMenuOpen: boolean
  language: 'ar' | 'en'
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  setLanguage: (language: 'ar' | 'en') => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        isSidebarOpen: false,
        isMobileMenuOpen: false,
        language: 'ar',
        theme: 'light',
        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
        setLanguage: (language) => set({ language }),
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
)