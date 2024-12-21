"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
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
        setAlertState({
          isOpen: true,
          title: "Failed to fetch user data",
          description: "Unable to retrieve user information. Please try again.",
          onConfirm: () =>
            setAlertState((prev) => ({ ...prev, isOpen: false })),
        });
      }
    };

    fetchUserData();
  }, [userProp]); // Include `userProp` as a dependency

  const handleLogout = async () => {
    try {
      await logoutStudentUser();
      setAlertState({
        isOpen: true,
        title: "Logged out successfully!",
        description: "You have been logged out.",
        onConfirm: () => {
          setAlertState((prev) => ({ ...prev, isOpen: false }));
          router.push("/"); // Redirect to the login page
        },
      });
    } catch (error) {
      console.error("Error logging out:", error);
      setAlertState({
        isOpen: true,
        title: "Logout Failed",
        description: "An error occurred while logging out. Please try again.",
        onConfirm: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  return (
    <>
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

      <AlertDialog
        open={alertState.isOpen}
        onOpenChange={(isOpen) =>
          setAlertState((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={alertState.onConfirm}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
