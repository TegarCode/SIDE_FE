import { Bars3Icon } from "@heroicons/react/24/outline";
import { useState, type PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import { APP_ROUTES, isProtectedAppPath } from "@/constants/routes";
import { getSidebarLayoutConfig } from "@/constants/sidebarLinks";
import { canAccessProtectedPages } from "@/service/accessControl";
import { Footer } from "@/components/layouts/Footer";
import { Header } from "@/components/layouts/Header";
import { SidebarMenu } from "@/components/layouts/SidebarMenu";
import { Button } from "@/components/ui/Button";

export function Layout({ children }: PropsWithChildren) {
  const location = useLocation();
  const isHome = location.pathname === APP_ROUTES.HOME;
  const canAccessProtected = canAccessProtectedPages();
  const shouldShowSidebar =
    canAccessProtected || !isProtectedAppPath(location.pathname);
  const sidebarConfig = shouldShowSidebar
    ? getSidebarLayoutConfig(location.pathname)
    : null;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (sidebarConfig) {
    return (
      <div className="flex min-h-screen bg-[#f1f4f8]">
        <SidebarMenu
          title={sidebarConfig.title}
          menuLinks={sidebarConfig.menuLinks}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1">
            <div className="px-3 pt-3 lg:hidden">
              <Button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                aria-label={`Buka sidebar ${sidebarConfig.title}`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-slate-500">
                    Navigasi sidebar
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {sidebarConfig.title}
                  </div>
                </div>
                <span className="ml-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                  <Bars3Icon className="h-5 w-5" />
                </span>
              </Button>
            </div>
            {children}
          </main>
        </div>
      </div>
    );
  }

  if (isHome) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="w-full flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}
