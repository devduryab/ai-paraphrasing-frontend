import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  hasSubmenu?: boolean;
  isActive?: boolean;
}

export interface SidebarProps {
  userRole: "student" | "faculty" | "super_admin";
}

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showFilters?: boolean;
  showExport?: boolean;
  user?: {
    name: string;
    avatar?: string;
    role: string;
  };
}

export interface StatsCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    type: "increase" | "decrease";
    period: string;
  };
  icon: LucideIcon;
  iconColor?: string;
  showViewReport?: boolean;
  className?: string;
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showTimeFilter?: boolean;
  className?: string;
}

export interface ActivityItem {
  id: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: "completed" | "pending" | "failed" | "new";
  customerId: string;
  timeAgo: string;
  amount?: string;
}

export interface RecentActivityTableProps {
  title?: string;
  data?: ActivityItem[];
  showTimeFilter?: boolean;
  className?: string;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'student' | 'faculty' | 'super_admin';
  pageTitle: string;
  pageSubtitle?: string;
  user?: {
    name: string;
    avatar?: string;
    role: string;
  };
  showFilters?: boolean;
  showExport?: boolean;
}


export interface DashboardContentProps {
  userRole: 'student' | 'faculty' | 'super_admin';
}

export interface DashboardWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'faculty' | 'super_admin';
  pageTitle: string;
  pageSubtitle?: string;
  showFilters?: boolean;
  showExport?: boolean;
}
