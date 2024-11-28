"use client"; // Ensure this is a client-side component

import { useRouter } from "next/navigation"; // Use next/navigation for client-side routing
import { useState, useEffect } from "react";
import { getSessionForProtectedRoute } from "@/lib/auth/login"; // Import the session retrieval function
import LoadingSpinner from "./LoadingSpinner"; // Import the 3D Loading Spinner
import Swal from "sweetalert2"; // Import SweetAlert2 for error notifications

interface ProtectedComponentProps {
  [key: string]: unknown; // Define the type of props you expect to pass to the WrappedComponent
}

// Higher-Order Component (HOC) for route protection
const withAuth = <T extends ProtectedComponentProps>(
  WrappedComponent: React.ComponentType<T>
) => {
  return function ProtectedComponent(props: T) {
    const [loading, setLoading] = useState(true); // Loading state to prevent rendering before auth check
    const [authenticated, setAuthenticated] = useState(false); // State to track if the user is authenticated
    const router = useRouter(); // useRouter from next/navigation

    useEffect(() => {
      const checkAuth = async () => {
        try {
          // Fetch the session for protected routes
          const session = await getSessionForProtectedRoute();
          console.log("Session for Protected Route:", session); // Log the session

          if (session) {
            setAuthenticated(true); // If a valid session is found, allow access
          } else {
            // Show SweetAlert error for unauthorized access to /student page and redirect
            Swal.fire({
              icon: "error",
              title: "Access Denied",
              text: "You need to be logged in to access this page.",
              confirmButtonText: "OK",
            }).then(() => {
              router.replace("/"); // Redirect to login page after closing alert
            });
          }
        } catch (error) {
          console.error("Authentication check failed:", error);
          router.replace("/"); // Redirect to login on error or if session is invalid
        } finally {
          setTimeout(() => setLoading(false), 1500); // Simulated delay for loading state
        }
      };

      checkAuth();
    }, [router]); // Ensure router is available

    if (loading) {
      return <LoadingSpinner />; // Render the 3D loading spinner while loading
    }

    if (authenticated) {
      return <WrappedComponent {...props} />; // Render the protected component if authenticated
    }

    return null; // Render nothing if not authenticated (prevents flashing of protected content)
  };
};

export default withAuth;