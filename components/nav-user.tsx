"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { logoutStudentUser } from "@/lib/auth/login";
import { getUserAvatar, getCurrentSessionUser } from "@/lib/profile/profile";

export function NavUser({
  user: userProp, // Renaming the prop to avoid conflict
}: {
  user: { name: string; email: string; avatar: string };
}) {
  const router = useRouter();
  const { isMobile } = useSidebar();

  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch current session user data
        const currentUser = await getCurrentSessionUser();
        const avatarUrl = await getUserAvatar();

        setUser({
          name: currentUser.name || userProp.name || "Unknown User",
          email: currentUser.email || userProp.email || "Unknown Email",
          avatar: avatarUrl || userProp.avatar || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to fetch user data",
          text: "Unable to retrieve user information. Please try again.",
          confirmButtonText: "OK",
        });
      }
    };

    fetchUserData();
  }, [userProp]); // Include `userProp` as a dependency

  const handleLogout = async () => {
    try {
      await logoutStudentUser();
      Swal.fire({
        icon: "success",
        title: "Logged out successfully!",
        text: "You have been logged out.",
        showConfirmButton: false,
        timer: 3500,
      }).then(() => {
        router.push("/"); // Redirect to the login page
      });
    } catch (error) {
      console.error("Error logging out:", error);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "An error occurred while logging out. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
