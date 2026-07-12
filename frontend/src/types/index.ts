export type AppPage =
  | "landing"
  | "login"
  | "register"
  | "user-dashboard"
  | "user-room"
  | "user-payments"
  | "user-complaints"
  | "user-announcements"
  | "user-notifications"
  | "user-profile"
  | "admin-dashboard"
  | "admin-rooms"
  | "admin-tenants"
  | "admin-payments"
  | "admin-complaints"
  | "admin-announcements"
  | "admin-users"
  | "admin-reports"
  | "admin-settings"
  | "admin-audit-logs";

export interface UserSession {
  userId: string;
  email: string;
  role: "admin" | "user";
  name?: string;
  avatar?: string;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalTenants: number;
  totalRevenue: number;
  pendingPayments: number;
  openComplaints: number;
  occupancyRate: number;
}

export interface RoomWithDetails {
  id: string;
  name: string;
  number: string;
  floor: number;
  price: number;
  capacity: number;
  description: string | null;
  status: string;
  imageUrl: string | null;
  category: { id: string; name: string; description: string | null } | null;
  facilities: { id: string; name: string; icon: string | null }[];
  _count: { tenants: number };
}

export interface PaymentWithDetails {
  id: string;
  amount: number;
  month: number;
  year: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
  proofUrl: string | null;
  notes: string | null;
  tenant?: { id: string; user: { id: string; email: string; profile: { name: string | null } | null } };
  room: { id: string; name: string; number: string } | null;
}

export interface ComplaintWithDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  imageUrl: string | null;
  resolvedAt: string | null;
  createdAt: string;
  tenant: { id: string; user: { id: string; email: string; profile: { name: string | null } | null } };
  room: { id: string; name: string; number: string } | null;
  comments: {
    id: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    user: { id: string; profile: { name: string | null } | null };
  }[];
  _count: { comments: number };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; email: string; profile: { name: string | null } | null } | null;
}

export interface TenantWithDetails {
  id: string;
  status: string;
  moveInDate: string | null;
  moveOutDate: string | null;
  user: {
    id: string;
    email: string;
    active: boolean;
    profile: { name: string; phone: string | null; avatar: string | null } | null;
  };
  room: { id: string; name: string; number: string; price: number } | null;
  lease: { id: string; startDate: string; endDate: string | null; monthlyRent: number; status: string } | null;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}