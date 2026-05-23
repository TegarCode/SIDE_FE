import {
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import type { AdminSidebarLink } from "@/constants/adminDashboard";
import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

type AdminSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  visibleLinks: AdminSidebarLink[];
  activeHint: string;
  onToggleCollapsed: () => void;
  onMobileClose: () => void;
};

type SidebarContentProps = {
  collapsed: boolean;
  visibleLinks: AdminSidebarLink[];
  activeHint: string;
  onToggleCollapsed: () => void;
  onNavigate: () => void;
};

type SidebarSection = {
  id: "main-menu" | "data-management";
  title: string;
  links: AdminSidebarLink[];
};

function getDefaultExpandedSections(
  sections: SidebarSection[],
  pathname: string
): Record<SidebarSection["id"], boolean> {
  const defaults: Record<SidebarSection["id"], boolean> = {
    "main-menu": false,
    "data-management": true
  };
  const activeSection = sections.find((section) =>
    section.links.some((link) => pathname.startsWith(link.to))
  );

  if (!activeSection) {
    return defaults;
  }

  return {
    ...defaults,
    [activeSection.id]: true
  };
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="border-b border-slate-200 px-5 py-5">
      <Link
        to={APP_ROUTES.HOME}
        className={cn("flex items-center gap-3", collapsed && "justify-center")}
      >
        <span className="grid h-11 w-11 place-items-center rounded-md bg-slate-100 text-[#223B8F] ring-1 ring-slate-200">
          <Squares2X2Icon className="h-5 w-5" />
        </span>
        {!collapsed ? (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              Beranda Admin
            </div>
            <div className="truncate text-xs text-slate-500">
              SIDE Control Panel
            </div>
          </div>
        ) : null}
      </Link>
    </div>
  );
}

function SidebarLinkItem({
  collapsed,
  link,
  onNavigate
}: {
  collapsed: boolean;
  link: AdminSidebarLink;
  onNavigate: () => void;
}) {
  const { to, label, icon: Icon } = link;

  return (
    <NavLink to={to} onClick={onNavigate}>
      {({ isActive }) => (
        <div
          className={cn(
            "group relative flex items-center gap-3 border px-3 py-2 mb-1 text-sm transition-all",
            collapsed ? "justify-center rounded-md px-2" : "rounded-lg",
            isActive
              ? "border-[#223B8F]/25 bg-[#223B8F]/8 text-[#223B8F] shadow-sm"
              : "border-[#223B8F]/0 bg-white text-slate-800 hover:border-[#223B8F]/25 hover:bg-slate-50"
          )}
          title={collapsed ? label : undefined}
        >
          <span
            className={cn(
              "absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r transition-colors",
              isActive ? "bg-[#223B8F]" : "bg-transparent"
            )}
            aria-hidden
          />
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-md border transition-colors",
              isActive
                ? "border-[#223B8F]/15 bg-[#223B8F]/8 text-[#223B8F]"
                : "border-slate-200 bg-white text-slate-600 group-hover:border-[#223B8F]/15 group-hover:bg-slate-100 group-hover:text-slate-700"
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span
                className={cn(
                  "block text-sm leading-snug",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {label}
              </span>
              <span className="block text-[11px] text-slate-500">
                Navigasi admin
              </span>
            </span>
          ) : null}
        </div>
      )}
    </NavLink>
  );
}

function SidebarSectionGroup({
  collapsed,
  section,
  expanded,
  onToggle,
  onNavigate
}: {
  collapsed: boolean;
  section: SidebarSection;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  if (section.links.length === 0) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "group relative flex w-full items-center justify-between overflow-hidden rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition-all duration-200 hover:border-[#223B8F]/25 hover:bg-slate-50",
          collapsed && "justify-center rounded-md px-2 py-2"
        )}
        aria-expanded={expanded}
        aria-label={`${expanded ? "Tutup" : "Buka"} ${section.title}`}
        title={collapsed ? section.title : undefined}
      >
        <span
          className={cn(
            "absolute inset-y-1 left-1 w-1 rounded-full bg-[#223B8F] transition-all duration-300",
            expanded ? "opacity-100" : "opacity-0"
          )}
          aria-hidden
        />
        {!collapsed ? (
          <>
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-all duration-200",
                  expanded
                    ? "border-[#223B8F]/20 bg-[#223B8F] text-white"
                    : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-[#223B8F]/20 group-hover:bg-[#223B8F]/10 group-hover:text-[#223B8F]"
                )}
              >
                <ChevronDownIcon
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    expanded ? "rotate-0" : "-rotate-90"
                  )}
                />
              </span>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {section.title}
                </span>
                <span className="block text-xs text-slate-500">
                  {expanded
                    ? "Klik untuk menyembunyikan menu"
                    : "Klik untuk melihat menu"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md border transition-all duration-200",
              expanded
                ? "border-[#223B8F]/20 bg-[#223B8F] text-white"
                : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-[#223B8F]/20 group-hover:bg-[#223B8F]/10 group-hover:text-[#223B8F]"
            )}
          >
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                expanded ? "rotate-0" : "-rotate-90"
              )}
            />
          </span>
        )}
      </button>

      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300 ease-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <nav className="min-h-0 space-y-2 pt-0.5">
          {section.links.map((link) => (
            <SidebarLinkItem
              key={link.to}
              collapsed={collapsed}
              link={link}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

function SidebarSectionsList({
  collapsed,
  sections,
  defaultExpandedSections,
  onNavigate
}: {
  collapsed: boolean;
  sections: SidebarSection[];
  defaultExpandedSections: Record<SidebarSection["id"], boolean>;
  onNavigate: () => void;
}) {
  const [expandedSections, setExpandedSections] = useState(
    defaultExpandedSections
  );

  const toggleSection = (sectionId: SidebarSection["id"]) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId]
    }));
  };

  return sections.map((section) => (
    <SidebarSectionGroup
      key={section.id}
      collapsed={collapsed}
      section={section}
      expanded={expandedSections[section.id]}
      onToggle={() => toggleSection(section.id)}
      onNavigate={onNavigate}
    />
  ));
}

function SidebarContent({
  collapsed,
  visibleLinks,
  activeHint,
  onToggleCollapsed,
  onNavigate
}: SidebarContentProps) {
  const location = useLocation();
  const sections = useMemo<SidebarSection[]>(() => {
    const isDataManagementLink = (to: string) =>
      to === APP_ROUTES.ADMIN_MANAGEMENT.ECONOMIC_INDICATORS ||
      to === APP_ROUTES.ADMIN_MANAGEMENT.INVESTMENT_DATA ||
      to === APP_ROUTES.ADMIN_MANAGEMENT.TOURISM_DATA ||
      to === APP_ROUTES.ADMIN_MANAGEMENT.TRADE_DATA;
    const mainMenuLinks = visibleLinks.filter(
      (link) =>
        link.to !== APP_ROUTES.ADMIN_MANAGEMENT.DASHBOARD &&
        !isDataManagementLink(link.to)
    );
    const dataManagementLinks = visibleLinks.filter((link) =>
      isDataManagementLink(link.to)
    );

    return [
      {
        id: "main-menu",
        title: "Menu Utama",
        links: mainMenuLinks
      },
      {
        id: "data-management",
        title: "Manajemen Data",
        links: dataManagementLinks
      }
    ];
  }, [visibleLinks]);
  const dashboardLink = useMemo(
    () =>
      visibleLinks.find(
        (link) => link.to === APP_ROUTES.ADMIN_MANAGEMENT.DASHBOARD
      ),
    [visibleLinks]
  );
  const defaultExpandedSections = useMemo(
    () => getDefaultExpandedSections(sections, location.pathname),
    [location.pathname, sections]
  );

  return (
    <>
      <SidebarBrand collapsed={collapsed} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1.5">
          {dashboardLink ? (
            <div className="space-y-1">
              {!collapsed ? (
                <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Beranda
                </div>
              ) : null}
              <SidebarLinkItem
                collapsed={collapsed}
                link={dashboardLink}
                onNavigate={onNavigate}
              />
            </div>
          ) : null}

          <SidebarSectionsList
            key={location.pathname}
            collapsed={collapsed}
            sections={sections}
            defaultExpandedSections={defaultExpandedSections}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-sm">
        <Button
          type="button"
          variant="outline"
          onClick={onToggleCollapsed}
          className={cn(
            "hidden w-full items-center justify-center gap-2 px-3 py-2 text-sm font-medium lg:inline-flex",
            collapsed ? "rounded-md" : "rounded-lg"
          )}
          aria-label={collapsed ? "Buka sidebar" : "Kecilkan sidebar"}
          title={collapsed ? "Buka sidebar" : "Kecilkan sidebar"}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeftIcon className="h-4 w-4" />
              Kecilkan sidebar
            </>
          )}
        </Button>
        <div className="mt-4">
          <div
            className={cn(
              "border border-slate-200 bg-slate-50",
              collapsed
                ? "flex justify-center rounded-md p-2"
                : "rounded-lg p-4"
            )}
          >
            {collapsed ? (
              <Cog6ToothIcon
                className="h-5 w-5 text-[#223B8F]"
                title={activeHint}
              />
            ) : (
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white text-[#223B8F] ring-1 ring-slate-200">
                  <Cog6ToothIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    Tentang halaman ini
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-600">
                    {activeHint}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function AdminSidebar({
  collapsed,
  mobileOpen,
  visibleLinks,
  activeHint,
  onToggleCollapsed,
  onMobileClose
}: AdminSidebarProps) {
  return (
    <>
      <div
        className={cn("hidden shrink-0 lg:block", collapsed ? "w-24" : "w-80")}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white shadow-sm lg:flex",
          collapsed ? "w-24" : "w-80"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          visibleLinks={visibleLinks}
          activeHint={activeHint}
          onToggleCollapsed={onToggleCollapsed}
          onNavigate={onMobileClose}
        />
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
            "absolute inset-0 bg-slate-950/45 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onMobileClose}
        />

        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[88vw] max-w-[320px] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-[#223B8F] ring-1 ring-slate-200">
                <Squares2X2Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  Beranda Admin
                </div>
                <div className="truncate text-xs text-slate-500">
                  SIDE Control Panel
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onMobileClose}
              className="rounded-md p-2 text-slate-600"
              aria-label="Tutup sidebar"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          <SidebarContent
            collapsed={false}
            visibleLinks={visibleLinks}
            activeHint={activeHint}
            onToggleCollapsed={onToggleCollapsed}
            onNavigate={onMobileClose}
          />
        </aside>
      </div>
    </>
  );
}
