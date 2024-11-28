"use client"; // Ensure this is a client-side component

import { useRouter } from "next/navigation"; // Use next/navigation for client-side routing
import { useState, useEffect } from "react";
import { getSessionForProtectedRoute } from "@/lib/auth/login"; // Import the session retrieval function
import { checkAdminRole } from "@/lib/auth/login"; // Import the checkAdminRole function
import LoadingSpinner from "./LoadingSpinner"; // Import the 3D Loading Spinner
import Swal from "sweetalert2"; // Import SweetAlert2 for error notifications

// Generic interface for the props of the wrapped component
interface ProtectedComponentProps {
  children?: React.ReactNode; // Optional children prop
  [key: string]: unknown; // Allow additional properties if necessary
}

// Higher-Order Component (HOC) for route protection
const WithAuthAdmin = <T extends ProtectedComponentProps>(
  WrappedComponent: React.ComponentType<T>
) => {
  return function ProtectedComponent(props: T) {
    const [loading, setLoading] = useState(true); // State for managing loading spinner
    const [authenticated, setAuthenticated] = useState(false); // State to track authentication status
    const [isAdmin, setIsAdmin] = useState(false); // State to track admin role
    const router = useRouter(); // Next.js router for client-side navigation

    useEffect(() => {
      const checkAuth = async () => {
        try {
          // Fetch the session for protected routes
          const session = await getSessionForProtectedRoute();
          console.log("Session for Protected Route:", session); // Log session for debugging

          if (session) {
            // Check if the user has admin role
            const isAdminRole = await checkAdminRole();
            if (isAdminRole) {
              setIsAdmin(true);
              setAuthenticated(true); // Allow access for admins
            } else {
              // Show error and redirect for unauthorized access
              Swal.fire({
                icon: "error",
                title: "Unauthorized",
                text: "You do not have access to this page.",
                confirmButtonText: "OK",
              }).then(() => {
                router.replace("/"); // Redirect to home page after alert
              });
            }
          } else {
            // Show error and redirect for unauthenticated users
            Swal.fire({
              icon: "error",
              title: "Access Denied",
              text: "You need to be logged in to access this page.",
              confirmButtonText: "OK",
            }).then(() => {
              router.replace("/"); // Redirect to login page after alert
            });
          }
        } catch (error) {
          console.error("Authentication check failed:", error);
          // Redirect to login on error or if session is invalid
          router.replace("/");
        } finally {
          // Ensure loading state ends even if there's an error
          setLoading(false);
        }
      };

      checkAuth();
    }, [router]); // Ensure router is stable for the effect

    // Show loading spinner while checking authentication
    if (loading) {
      return <LoadingSpinner />;
    }

    // Render the protected component if authenticated and admin
    if (authenticated && isAdmin) {
      return <WrappedComponent {...props} />;
    }

    // Render nothing if not authenticated or not admin
    return null;
  };
};

export default WithAuthAdmin;
