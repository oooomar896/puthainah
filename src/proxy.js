import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server.js'

export async function proxy(request) {
    // Update the session and get the user
    const { response, user } = await updateSession(request)

    const { pathname } = request.nextUrl

    // Define public routes that don't need authentication
    const isPublicRoute =
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/about-us') ||
        pathname.startsWith('/faqs') ||
        pathname.startsWith('/how-it-work') ||
        pathname.startsWith('/our-services') ||
        pathname.startsWith('/partners') ||
        pathname.startsWith('/projects') ||
        pathname.startsWith('/callback') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')

    // 1. If it's a protected route and no user is found, redirect to login
    if (!isPublicRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    // 2. Role-based protection (requires role in user metadata)
    if (user) {
        const rawRole = user.user_metadata?.role
        const role = rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase() : null

        // Admin only pages
        if (pathname.startsWith('/admin') && role !== 'Admin') {
            if (role) {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }

        // Provider only pages
        if (pathname.startsWith('/provider') && role && role !== 'Provider' && role !== 'Admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        // 3. Redirect logged-in users away from login/signup pages
        if ((pathname.startsWith('/login') || pathname.startsWith('/signup')) && user) {
            const url = request.nextUrl.clone()
            if (role === 'Admin') url.pathname = '/admin'
            else if (role === 'Provider') url.pathname = '/provider'
            else url.pathname = '/profile'
            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
