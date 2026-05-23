import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useMemo, useState, type ComponentType, type SVGProps } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export type SidebarMenuLink = {
  to: string;
  label: string;
  hint: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  roles?: string[];
  permissions?: string[];
};

type SidebarMenuProps = {
  title: string;
  menuLinks: SidebarMenuLink[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function SidebarMenu({
  title,
  menuLinks,
  mobileOpen = false,
  onMobileClose
}: SidebarMenuProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const activeLink = useMemo(() => {
    const sorted = [...menuLinks].sort((a, b) => b.to.length - a.to.length);
    return sorted.find((item) => location.pathname.startsWith(item.to)) ?? null;
  }, [location.pathname, menuLinks]);

  const dynamicHint =
    activeLink?.hint ?? "Pilih menu untuk melihat ringkasan halaman.";

  return (
    <>
      <div
        className={cn(
          "hidden shrink-0 transition-[width] duration-300 lg:block",
          collapsed ? "w-20" : "w-72"
        )}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-slate-200 bg-white shadow-sm transition-[width] duration-300 lg:flex",
          collapsed ? "w-20" : "w-72"
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-20 items-center justify-center border-b border-blue-200 bg-blue-50 px-4">
          {collapsed ? (
            <div className="relative mx-auto">
              <Squares2X2Icon className="h-7 w-7 text-violet-600" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
            </div>
          ) : (
            <div className="min-w-0 px-2 text-center">
              <div className="text-lg font-extrabold leading-tight text-slate-900 uppercase">
                {title}
              </div>
            </div>
          )}
        </div>

        <nav className="custom-scrollbar max-h-[60vh] space-y-1.5 overflow-y-auto px-3 py-4">
          {menuLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className="focus-visible:outline-none">
              {({ isActive }) => (
                <div
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                    collapsed ? "justify-center" : "",
                    isActive
                      ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-transparent bg-white text-slate-800 hover:border-slate-200 hover:bg-slate-50"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  title={collapsed ? label : undefined}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r transition-colors",
                      isActive ? "bg-orange-500" : "bg-transparent"
                    )}
                    aria-hidden
                  />
                  {Icon ? (
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors",
                        isActive
                          ? "border-violet-200 bg-violet-50"
                          : "border-slate-200 bg-white group-hover:bg-slate-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4.5 w-4.5",
                          isActive
                            ? "text-violet-600"
                            : "text-slate-600 group-hover:text-slate-700"
                        )}
                      />
                    </span>
                  ) : null}
                  {!collapsed ? (
                    <span
                      className={cn(
                        "whitespace-normal wrap-break-word leading-snug",
                        isActive ? "font-semibold" : "font-medium"
                      )}
                    >
                      {label}
                    </span>
                  ) : null}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-3 px-3">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            title={collapsed ? "Perlebar" : "Persempit"}
          >
            {collapsed ? (
              <ChevronRightIcon className="mx-auto h-5 w-5" />
            ) : (
              <span className="inline-flex items-center gap-2">
                <ChevronLeftIcon className="h-5 w-5" />
                Persempit
              </span>
            )}
          </button>
        </div>

        <div
          className={cn(
            "m-3 mb-6 rounded-xl border border-violet-200 bg-violet-50 p-3 shadow-sm transition-all duration-300",
            collapsed ? "flex justify-center p-2" : ""
          )}
        >
          {collapsed ? (
            <InformationCircleIcon
              className="h-5 w-5 text-violet-600"
              title={dynamicHint}
            />
          ) : (
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600 ring-1 ring-blue-200">
                <InformationCircleIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="mb-0.5 text-[11px] font-semibold text-slate-800">
                  Tentang halaman ini
                </div>
                <div className="text-[12px] leading-relaxed text-slate-700">
                  {dynamicHint}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-1100 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Tutup sidebar"
          className={cn(
            "absolute inset-0 bg-slate-950/35 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onMobileClose}
        />

        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[88vw] max-w-[320px] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          aria-label="Sidebar"
        >
          <div className="flex h-18 items-center justify-between border-b border-blue-200 bg-blue-50 px-4">
            <div className="min-w-0 pr-3">
              <div className="text-base font-extrabold leading-tight text-slate-900 uppercase">
                {title}
              </div>
            </div>
            <Button
              type="button"
              onClick={onMobileClose}
              className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Tutup sidebar"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          <nav className="custom-scrollbar flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
            {menuLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className="focus-visible:outline-none"
                onClick={onMobileClose}
              >
                {({ isActive }) => (
                  <div
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                      isActive
                        ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-transparent bg-white text-slate-800 hover:border-slate-200 hover:bg-slate-50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r transition-colors",
                        isActive ? "bg-orange-500" : "bg-transparent"
                      )}
                      aria-hidden
                    />
                    {Icon ? (
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors",
                          isActive
                            ? "border-violet-200 bg-violet-50"
                            : "border-slate-200 bg-white group-hover:bg-slate-100"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4.5 w-4.5",
                            isActive
                              ? "text-violet-600"
                              : "text-slate-600 group-hover:text-slate-700"
                          )}
                        />
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "whitespace-normal wrap-break-word leading-snug",
                        isActive ? "font-semibold" : "font-medium"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="m-3 mb-5 rounded-xl border border-violet-200 bg-violet-50 p-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600 ring-1 ring-blue-200">
                <InformationCircleIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="mb-0.5 text-[11px] font-semibold text-slate-800">
                  Tentang halaman ini
                </div>
                <div className="text-[12px] leading-relaxed text-slate-700">
                  {dynamicHint}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.12); border-radius: 8px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.18); }
      `}</style>
    </>
  );
}
