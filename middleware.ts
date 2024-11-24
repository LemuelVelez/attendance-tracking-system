import { NextResponse } from 'next/server';
import { verifySession, getUserBySession } from '@/lib/users/auth'; // Import the session check and user fetching functions
import type { NextRequest } from 'next/server';

// Middleware to protect /dashboard/admin and /dashboard/student
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Check if the user is authenticated
  const session = await verifySession();  // Check for an active session

  if (!session) {
    // If not authenticated, redirect to login page with an authError query parameter
    url.pathname = '/';
    url.searchParams.set('authError', 'true'); // Add the query param to trigger SweetAlert on client-side
    return NextResponse.redirect(url);
  }

  // Fetch the user details from Appwrite using the session's userId
  const user = await getUserBySession(session.userId);  // Assuming session has userId property

  if (!user) {
    // If user details cannot be fetched, redirect to login page
    url.pathname = '/';
    url.searchParams.set('authError', 'true');
    return NextResponse.redirect(url);
  }

  // Special protection for /dashboard/admin - Only users with the 'admin' role can access it
  if (url.pathname === '/dashboard/admin' && user.role !== 'admin') {
    url.pathname = '/'; // Redirect to the homepage or login
    url.searchParams.set('roleError', 'true'); // Add a query parameter for unauthorized access attempt
    return NextResponse.redirect(url);
  }

  // Allow access if authenticated and authorized
  return NextResponse.next();
}

// Specify paths to protect
export const config = {
  matcher: ['/dashboard/admin', '/dashboard/student'], // Apply middleware to these routes
};
