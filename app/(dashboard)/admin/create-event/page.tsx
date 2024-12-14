"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { AdminSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import WithAuthAdmin from "@/components/hoc/WithAuthAdmin"; // Import the HOC
import { Button } from "@/components/ui/button";
import { getCurrentUserFirstname } from "@/lib/users/getFirstname";
import CreateEvent from "./create-event";

const Page = () => {
  const { setTheme } = useTheme();
  const [firstname, setFirstname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFirstname = async () => {
      try {
        const name = await getCurrentUserFirstname();
        setFirstname(name);
      } catch (error) {
        console.error("Failed to fetch user's firstname:", error);
        setFirstname("User"); // Default to "User" if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchFirstname();
  }, []);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b-2 border-primary">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
            {loading ? "Loading..." : `Welcome, ${firstname}!`}
          </div>

          {/* Theme toggle dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div></div>
        <CreateEvent />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default WithAuthAdmin(Page); // Protect the page with the HOC
