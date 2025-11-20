import { useAdminInfo } from "./useAdminInfo";

type AdminRole = "super_admin" | "support" | "analyst";

interface Permissions {
  canViewDashboard: boolean;
  canViewOrganizations: boolean;
  canEditOrganizationPlan: boolean;
  canViewSubscriptions: boolean;
  canCancelSubscription: boolean;
  canViewAdmins: boolean;
  canManageAdmins: boolean;
  canViewUserDetails: boolean;
}

export function useAdminPermissions() {
  const { adminInfo, loading } = useAdminInfo();

  const role = adminInfo?.role as AdminRole | null;

  const permissions: Permissions = {
    canViewDashboard: true,
    canViewOrganizations: true,
    canEditOrganizationPlan: role === "super_admin" || role === "support",
    canViewSubscriptions: true,
    canCancelSubscription: role === "super_admin" || role === "support",
    canViewAdmins: role === "super_admin" || role === "support",
    canManageAdmins: role === "super_admin",
    canViewUserDetails: true,
  };

  return {
    permissions,
    role,
    loading,
    isSuperAdmin: role === "super_admin",
    isSupport: role === "support",
    isAnalyst: role === "analyst",
  };
}
