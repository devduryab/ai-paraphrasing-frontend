"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  // Target,
  Settings,
  HelpCircle,
  ChevronDown,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import {
  SidebarItem,
  SidebarProps,
} from "@/interfaces/dashboard/dashboardInterface";

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const pathname = usePathname();

  // Base navigation items that are common
  const baseNavItems: SidebarItem[] = [
    {
      icon: BarChart3,
      label: "Dashboard",
      href: `/${userRole === "super_admin" ? "admin" : userRole}/dashboard`,
    },
  ];

  // Role-specific navigation items
  const roleSpecificItems: Record<string, SidebarItem[]> = {
    student: [
      // { icon: Users, label: "Assignments", href: "/student/assignments" },
      { icon: BookOpen, label: "Course Registration", href: "/student/courses" },
      {
        icon: MessageSquare,
        label: "Submissions",
        href: "/student/submissions",
      },
      { icon: TrendingUp, label: "Reports", href: "/student/reports" },
    ],
    faculty: [
      { icon: Users, label: "Students", href: "/faculty/students" },
      { icon: BookOpen, label: "My Courses", href: "/faculty/courses" },
      // {
      //   icon: MessageSquare,
      //   label: "Assignments",
      //   href: "/faculty/assignments",
      //   badge: 3,
      // },
      // { icon: TrendingUp, label: "Analytics", href: "/faculty/analytics" },
      // { icon: Target, label: "Reports", href: "/faculty/reports" },
    ],
    super_admin: [
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: BookOpen, label: "Courses", href: "/admin/courses" },
      // { icon: MessageSquare, label: "System", href: "/admin/system", badge: 2 },
      // { icon: TrendingUp, label: "Analytics", href: "/admin/analytics" },
      // { icon: Target, label: "Reports", href: "/admin/reports" },
      // { icon: Globe, label: "Settings", href: "/admin/settings" },
      // { icon: MessageSquare, label: "System", href: "/admin/system", badge: 2 },
    ],
  };

  const settingsItems: SidebarItem[] = [
    {
      icon: Settings,
      label: "Settings",
      href: `/${userRole === "super_admin" ? "admin" : userRole}/settings`,
    },
    {
      icon: HelpCircle,
      label: "Help Center",
      href: `/${userRole === "super_admin" ? "admin" : userRole}/help`,
    },
  ];

  const navItems = [
    ...baseNavItems,
    ...roleSpecificItems[userRole],
    ...settingsItems,
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">AI Paraphrase</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive
                      ? "text-blue-700"
                      : "text-gray-500 group-hover:text-gray-700"
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </div>

              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
                {item.hasSubmenu && (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>System Active</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
