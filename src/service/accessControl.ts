import { env } from "@/constants/env";
import { hasActiveAuthSession } from "@/service/authSession";
import { hasAnyPermission, type AccessUser } from "@/utils/access";

export function isAccessControlEnabled() {
  return env.requireAuthAccess;
}

export function canAccessProtectedPages() {
  return !isAccessControlEnabled() || hasActiveAuthSession();
}

export function canAccessPermissions(
  user: AccessUser,
  permissions: readonly string[] = []
) {
  if (!isAccessControlEnabled()) {
    return true;
  }

  if (permissions.length === 0) {
    return true;
  }

  return hasAnyPermission(user, permissions);
}
