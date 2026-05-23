import { useMemo, useState, type PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import {
  ADMIN_SIDEBAR_LINKS,
  type AdminSidebarLink
} from "@/constants/adminDashboard";
import { useAuthAccess } from "@/hooks/auth/useAuthAccess";
import { hasAnyPermission, type AccessUser } from "@/utils/access";
import { AdminSidebar } from "./admin-management/AdminSidebar";
import { AdminTopbar } from "./admin-management/AdminTopbar";

type AdminManagementLayoutProps = PropsWithChildren<{
  title: string;
  description: string;
}>;

function getVisibleAdminLinks(accessUser: AccessUser) {
  return ADMIN_SIDEBAR_LINKS.filter((item) => {
    if (!item.permissions?.length) return true;
    return hasAnyPermission(accessUser, item.permissions);
  });
}

function getActiveHint(links: AdminSidebarLink[], pathname: string) {
  const activeLink = links.find((item) => pathname.startsWith(item.to)) ?? null;
  return activeLink?.hint ?? "Pilih menu untuk membuka area pengelolaan admin.";
}

export function AdminManagementLayout({
  title,
  description,
  children
}: AdminManagementLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { accessUser, authUser } = useAuthAccess();
  const location = useLocation();

  const displayName = useMemo(() => {
    if (typeof authUser?.name === "string" && authUser.name.trim()) {
      return authUser.name.trim();
    }

    return "Admin";
  }, [authUser]);

  const visibleLinks = useMemo(
    () => getVisibleAdminLinks(accessUser),
    [accessUser]
  );
  const activeHint = useMemo(
    () => getActiveHint(visibleLinks, location.pathname),
    [location.pathname, visibleLinks]
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        visibleLinks={visibleLinks}
        activeHint={activeHint}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <AdminTopbar
          title={title}
          description={description}
          displayName={displayName}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="px-4 py-5 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
