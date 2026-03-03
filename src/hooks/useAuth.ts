import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store'
import { authService } from '@/services/auth'
import type { LoginCredentials, SignupCredentials } from '@/services/auth'
import { useRouter } from 'next/navigation'
import { safeReplace, safePush } from '@/utils/safeNavigate'
import { toast } from 'sonner'

export const useAuth = () => {
  const router = useRouter()
  const { user, profile, isAuthenticated, isLoading, setUser, setProfile, setIsLoading, logout: storeLogout } = useAuthStore()

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const { user: authUser, profile: userProfile, error } = await authService.login(credentials)

      if (error) {
        toast.error(error.message || 'فشل تسجيل الدخول')
        return { success: false, error }
      }

      if (authUser && userProfile) {
        setUser(authUser)
        setProfile(userProfile)
        toast.success('تم تسجيل الدخول بنجاح')

        // Redirect based on role
        if (userProfile.role === 'Admin') {
          safeReplace(router, '/admin')
        } else if (userProfile.role === 'Provider') {
          safeReplace(router, '/provider')
        } else {
          safeReplace(router, '/profile')
        }

        return { success: true }
      } else {
        // Handle case where authUser or userProfile is missing
        toast.error('بيانات تسجيل الدخول غير مكتملة')
        return { success: false, error: new Error('Missing user data') }
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع')
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true)
    try {
      const { user: authUser, profile: userProfile, error } = await authService.signup(credentials)

      if (error) {
        toast.error(error.message || 'فشل إنشاء الحساب')
        return { success: false, error }
      }

      if (authUser && userProfile) {
        setUser(authUser)
        setProfile(userProfile)
        toast.success('تم إنشاء الحساب بنجاح')
        safeReplace(router, '/profile')
        return { success: true }
      } else {
        // Handle case where authUser or userProfile is missing
        toast.error('بيانات إنشاء الحساب غير مكتملة')
        return { success: false, error: new Error('Missing user data') }
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع')
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      const { error } = await authService.logout()
      if (error) {
        toast.error(error.message || 'فشل تسجيل الخروج')
        return { success: false, error }
      }

      storeLogout()
      safeReplace(router, '/login')
      toast.success('تم تسجيل الخروج بنجاح')
      return { success: true }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع')
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuth = async () => {
    setIsLoading(true)

    // Add a safety timeout for checkAuth (5 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth check timed out')), 5000)
    )

    try {
      const { user: authUser, profile: userProfile, error } = await Promise.race([
        authService.getCurrentUser(),
        timeoutPromise
      ]) as any

      if (error || !authUser) {
        storeLogout()
        return { success: false, error }
      }

      setUser(authUser)
      setProfile(userProfile)
      return { success: true }
    } catch (error) {
      console.error('CheckAuth error:', error)
      storeLogout()
      return { success: false, error: error as any }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    checkAuth,
  }
}

export const useRequireAuth = (allowedRoles?: string[]) => {
  const { isAuthenticated, profile, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      safePush(router, '/login')
      return
    }

    if (!isLoading && isAuthenticated && allowedRoles && profile) {
      if (!allowedRoles.includes(profile.role)) {
        // Redirect to appropriate dashboard based on role
        if (profile.role === 'Admin') {
          router.push('/admin')
        } else if (profile.role === 'Provider') {
          router.push('/provider')
        } else {
          router.push('/profile')
        }
      }
    }
  }, [isAuthenticated, profile, isLoading, router, allowedRoles])

  return { isAuthenticated, profile, isLoading }
}
