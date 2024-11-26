"use client"; // Ensure this is a client-side component

import { useRouter } from "next/navigation"; // Use next/navigation for client-side routing
import { useState, useEffect } from "react";
import { getSessionForProtectedRoute } from "@/lib/users/login"; // Import the session retrieval function
import { checkAdminRole } from "@/lib/users/login"; // Import the checkAdminRole function
import LoadingSpinner from "./LoadingSpinner"; // Import the 3D Loading Spinner
import Swal from "sweetalert2"; // Import SweetAlert2 for error notifications

interface ProtectedComponentProps {
  [key: string]: unknown; // Define the type of props you expect to pass to the WrappedComponent
}

// Higher-Order Component (HOC) for route protection
const WithAuthAdmin = <T extends ProtectedComponentProps>(
  WrappedComponent: React.ComponentType<T>
) => {
  return function ProtectedComponent(props: T) {
    const [loading, setLoading] = useState(true); // Loading state to prevent rendering before auth check
    const [authenticated, setAuthenticated] = useState(false); // State to track if the user is authenticated
    const [isAdmin, setIsAdmin] = useState(false); // State to track if the user is an admin
    const router = useRouter(); // useRouter from next/navigation

    useEffect(() => {
      const checkAuth = async () => {
        try {
          // Fetch the session for protected routes
          const session = await getSessionForProtectedRoute();
          console.log("Session for Protected Route:", session); // Log the session

          if (session) {
            // Check if the user has admin role
            const isAdminRole = await checkAdminRole();
            if (isAdminRole) {
              setIsAdmin(true);
              setAuthenticated(true); // If the user is an admin, allow access
            } else {
              // Show SweetAlert error for unauthorized access and redirect
              Swal.fire({
                icon: "error",
                title: "Unauthorized",
                text: "You do not have access to this page.",
                confirmButtonText: "OK",
              }).then(() => {
                router.replace("/"); // Redirect to home page after closing alert
              });
            }
          } else {
            // Show SweetAlert error if the user is not authenticated
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

    if (authenticated && isAdmin) {
      return <WrappedComponent {...props} />; // Render the protected component if authenticated and admin
    }

    return null; // Render nothing if not authenticated or not admin (prevents flashing of protected content)
  };
};

export default WithAuthAdmin;
