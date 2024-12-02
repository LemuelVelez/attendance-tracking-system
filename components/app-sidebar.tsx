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
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Admin Dashboard",
      logo: ShieldCheck,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Event Management",
      url: "#",
      icon: QrCode,
      items: [
        {
          title: "Create Events",
          url: "/admin/create-event",
        },
        {
          title: "Generate Event QR Codes",
          url: "/admin/generate-qr",
        },
        {
          title: "View Event Attendance",
          url: "/admin/event-attendance",
        },
      ],
    },
    {
      title: "Student Management",
      url: "#",
      icon: UserPlus,
      items: [
        {
          title: "Register Students",
          url: "/admin/register-student",
        },
        {
          title: "View Student Profiles",
          url: "/admin/student-profiles",
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
          title: "General Settings",
          url: "/admin/settings",
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
