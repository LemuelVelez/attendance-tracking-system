"use client";

import * as React from "react";
import {
  ShieldCheck,
  QrCode,
  UserPlus,
  FileText,
  DollarSign,
  Bell,
  Settings2,
  CheckSquare,
  Layout,
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
        {
          title: "General Attendance",
          url: "/admin/general-attendance",
        },
      ],
    },
    {
      title: "Student Management",
      url: "#",
      icon: UserPlus,
      items: [
        {
          title: "Register Student",
          url: "/admin/register-student",
        },
        {
          title: "View Student Profiles",
          url: "/admin/student-profiles",
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
      title: "Attendance Reports",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Generate Attendance Reports",
          url: "/admin/reports",
        },
        {
          title: "Export Reports (PDF/CSV)",
          url: "/admin/export-reports",
        },
      ],
    },
    {
      title: "Fine Management",
      url: "#",
      icon: DollarSign,
      items: [
        {
          title: "Set Absence Fines",
          url: "/admin/set-fines",
        },
        {
          title: "View Fine Reports",
          url: "/admin/fine-reports",
        },
      ],
    },
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
      items: [
        {
          title: "Send Notifications",
          url: "/admin/send-notifications",
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
