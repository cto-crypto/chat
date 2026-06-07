export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  VIEWER: 0,
  STAFF: 1,
  MANAGER: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canCreate(role: UserRole): boolean {
  return hasRole(role, "STAFF");
}

export function canUpdate(role: UserRole): boolean {
  return hasRole(role, "STAFF");
}

export function canDelete(role: UserRole): boolean {
  return hasRole(role, "ADMIN");
}

export function canManageUsers(role: UserRole): boolean {
  return hasRole(role, "OWNER");
}

export function canAccessAdmin(role: UserRole): boolean {
  return hasRole(role, "ADMIN");
}

export function canViewReports(role: UserRole): boolean {
  return hasRole(role, "VIEWER");
}

export function canManageIntegrations(role: UserRole): boolean {
  return hasRole(role, "ADMIN");
}

export function canManageBackups(role: UserRole): boolean {
  return hasRole(role, "ADMIN");
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    OWNER: "Owner",
    ADMIN: "Administrator",
    MANAGER: "Manager",
    STAFF: "Staff",
    VIEWER: "Viewer",
  };
  return labels[role];
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    OWNER: "bg-purple-100 text-purple-800",
    ADMIN: "bg-red-100 text-red-800",
    MANAGER: "bg-blue-100 text-blue-800",
    STAFF: "bg-green-100 text-green-800",
    VIEWER: "bg-gray-100 text-gray-800",
  };
  return colors[role];
}
