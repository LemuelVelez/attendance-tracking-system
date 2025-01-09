"use client";

import * as React from "react";
import {
  CheckSquare,
  GraduationCap,
  History,
  Layout,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Updated data for the Student Dashboard
const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  teams: [
    {
      name: "Student Dashboard",
      logo: GraduationCap,
      plan: "Attendance Tracker",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: Layout,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/student",
        },
      ],
    },
    {
      title: "Attendance History",
      url: "#",
      icon: History,
      items: [
        {
          title: "View Attendance",
          url: "/student/attendance-history",
        },
      ],
    },
    {
      title: "QR Code",
      url: "#",
      icon: CheckSquare,
      items: [
        {
          title: "My QR Code",
          url: "/student/my-qr-code",
        },
        {
          title: "Scan QR Code",
          url: "/student/qr-code-scanner",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/student/profile",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <NavMain items={data.navMain} />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
