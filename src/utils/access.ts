import type { NavLinkItem } from "@/constants/navLinks";
import { env } from "@/constants/env";
import { getAuthUserFromSession } from "@/service/authSession";

export type AccessUser = {
  roles?: string[];
  permissions?: string[];
} | null;

function normalize(value: unknown) {
  return String(value).toLowerCase().trim();
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.map((item) => String(item).trim()).filter(Boolean);
}

export function getUserAccessFromStorage(): AccessUser {
  const authUser = getAuthUserFromSession();
  if (!authUser) return null;

  const roles = toStringArray(authUser.roles);
  const permissions = toStringArray(authUser.permissions);

  if (roles.length === 0 && permissions.length === 0) return null;

  return { roles, permissions };
}

export function hasAnyRole(user: AccessUser, roles: readonly string[] = []) {
  if (!user || roles.length === 0) return false;

  const userSet = new Set((user.roles ?? []).map(normalize));
  return roles.some((role) => userSet.has(normalize(role)));
}

export function hasAnyPermission(
  user: AccessUser,
  permissions: readonly string[] = []
) {
  if (!user || permissions.length === 0) return false;

  const userSet = new Set((user.permissions ?? []).map(normalize));
  return permissions.some((permission) => userSet.has(normalize(permission)));
}

export function canSeeItem(user: AccessUser, item: NavLinkItem) {
  if (!env.requireAuthAccess) return true;

  const needRoles = item.roles;
  const needPermissions = item.permissions;
  const isPublic =
    (!needRoles || needRoles.length === 0) &&
    (!needPermissions || needPermissions.length === 0);

  if (isPublic) return true;

  if (needPermissions?.length) return hasAnyPermission(user, needPermissions);

  return needRoles?.length ? hasAnyRole(user, needRoles) : false;
}

function resolvePathByPermission(user: AccessUser, item: NavLinkItem) {
  if (!env.requireAuthAccess) return item.path;

  if (!item.permissions?.length || !item.permissionPaths) return item.path;

  for (const permission of item.permissions) {
    const permissionPath = item.permissionPaths[permission];
    if (permissionPath && hasAnyPermission(user, [permission])) {
      return permissionPath;
    }
  }

  return item.path;
}

export function filterNavByAccess(
  items: NavLinkItem[] = [],
  user: AccessUser
): NavLinkItem[] {
  const walk = (list: NavLinkItem[]) =>
    list
      .map((item) => {
        const hadChildren =
          Array.isArray(item.children) && item.children.length > 0;
        const next: NavLinkItem = {
          ...item,
          path: resolvePathByPermission(user, item)
        };

        if (hadChildren) {
          next.children = walk(item.children ?? []);
        }

        return { item: next, hadChildren };
      })
      .filter(({ item, hadChildren }) => {
        if (hadChildren)
          return Array.isArray(item.children) && item.children.length > 0;

        return canSeeItem(user, item);
      })
      .map(({ item }) => item);

  return walk(items);
}
