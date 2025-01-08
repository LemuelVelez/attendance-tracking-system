"use client";

import * as React from "react";
import {
  ShieldCheck,
  QrCode,
  FileText,
  Archive,
  Settings2,
  CheckSquare,
  Layout,
  Users,
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

// Sample data
const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "https://github.com/shadcn.png",
  },
  teams: [
    {
      name: "Admin Dashboard",
      logo: ShieldCheck,
      plan: "Access to all features",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: Layout,
      items: [
        {
          title: "Overview",
          url: "/admin",
        },
      ],
    },
    {
      title: "Event Management",
      url: "#",
      icon: QrCode,
      items: [
        {
          title: "Create Event",
          url: "/admin/create-event",
        },
        {
          title: "Events",
          url: "/admin/events",
        },
      ],
    },
    {
      title: "Student Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Students",
          url: "/admin/students",
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
          url: "/admin/my-qr-code",
        },
        {
          title: "Scan QR Code",
          url: "/admin/qr-code-scanner",
        },
      ],
    },
    {
      title: "Attendance Reports",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "General Attendance",
          url: "/admin/general-attendance",
        },
        {
          title: "College Attendance",
          url: "/admin/college-attendance",
        },
        {
          title: "Print Attendance",
          url: "/admin/print-attendance",
        },
      ],
    },
    {
      title: "Fine Management",
      url: "#",
      icon: Archive,
      items: [
        {
          title: "General Records",
          url: "/admin/attendance-penalties-management",
        },
        {
          title: "Personal Records",
          url: "/admin/my-attendance-penalties",
        },
      ],
    },

    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Profile Settings",
          url: "/admin/profile-settings",
        },
      ],
    },
  ],
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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
