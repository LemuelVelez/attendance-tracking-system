"use client";

import * as React from "react";
import {
  CheckSquare,
  GraduationCap,
  History,
  Settings2,
  Timer,
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

// Updated data for the Student Dashboard
const data = {
  user: {
    name: "John Doe", // Example student name
    email: "john.doe@example.com", // Example email
    avatar: "/avatars/student-avatar.jpg", // Example avatar
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
      icon: GraduationCap,
      isActive: true,
      items: [
        {
          title: "Event Attendance",
          url: "#",
        },
        {
          title: "Upcoming Events",
          url: "#",
        },
      ],
    },
    {
      title: "Attendance History",
      url: "#",
      icon: History,
      items: [
        {
          title: "Past Events",
          url: "#",
        },
        {
          title: "Export Report",
          url: "#",
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
          url: "#",
        },
        {
          title: "Scan QR Code",
          url: "#",
        },
      ],
    },
    {
      title: "Notifications",
      url: "#",
      icon: Timer,
      items: [
        {
          title: "Reminders",
          url: "#",
        },
        {
          title: "Event Alerts",
          url: "#",
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
          url: "#",
        },
        {
          title: "Account Security",
          url: "#",
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
