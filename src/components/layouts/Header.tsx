import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type SVGProps
} from "react";
import {
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  Bars3Icon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentChartBarIcon,
  GlobeAltIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapIcon,
  Squares2X2Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import navLinks, { type NavLinkItem } from "@/constants/navLinks";
import { PERMISSIONS } from "@/constants/permissions";
import { APP_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/Button";
import { logoutAuthSession } from "@/service/authSession";
import { useAuthAccess } from "@/hooks/auth/useAuthAccess";
import { isAccessControlEnabled } from "@/service/accessControl";
import { filterNavByAccess, hasAnyPermission } from "@/utils/access";

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Beranda: HomeIcon,
  Indonesia: GlobeAltIcon,
  "Negara Mitra": MapIcon,
  Mitra: MapIcon,
  Sektor: Squares2X2Icon,
  Analisis: ChartBarIcon,
  Databank: DocumentChartBarIcon
};

type FlatItem = {
  label: string;
  path: string;
  external?: boolean;
  context: string | null;
  topLabel: string;
};

function normalizePath(path: string) {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function basePrefix(path: string) {
  if (!path || path === "/") return "/";
  const parts = path.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "/";
}

export function Header() {
  const accessControlEnabled = isAccessControlEnabled();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { accessUser, authUser, isAuthenticated } = useAuthAccess();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setIsUserMenuOpen(false);
    }
  }, [isAuthenticated]);

  const filteredNavLinks = useMemo(
    () => filterNavByAccess(navLinks, accessUser),
    [accessUser]
  );

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (mobileNavOpen) {
      mobilePanelRef.current?.focus();
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    return;
  }, [mobileNavOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isLinkActive = (path: string) => {
    if (!path || path.startsWith("http")) return false;

    const currentPath = normalizePath(location.pathname);
    const targetPath = normalizePath(path);

    if (
      currentPath === targetPath ||
      currentPath.startsWith(`${targetPath}/`)
    ) {
      return true;
    }

    const base = basePrefix(targetPath);
    if (
      base !== "/" &&
      (currentPath === base || currentPath.startsWith(`${base}/`))
    ) {
      return true;
    }

    return false;
  };

  const isMenuActive = (menu: NavLinkItem): boolean => {
    if (menu.path === APP_ROUTES.HOME) return isLinkActive(menu.path);
    if (menu.path && isLinkActive(menu.path)) return true;

    if (Array.isArray(menu.children)) {
      return menu.children.some((child) => isMenuActive(child));
    }

    return false;
  };

  const flatItems = useMemo(() => {
    const output: FlatItem[] = [];

    const walk = (node: NavLinkItem, parents: string[] = []) => {
      const context = parents.length > 0 ? parents.join(" > ") : null;

      if (node.path) {
        output.push({
          label: node.label,
          path: node.path,
          external: node.external,
          context,
          topLabel: parents[0] || node.label
        });
      }

      if (Array.isArray(node.children) && node.children.length > 0) {
        node.children.forEach((child) => walk(child, [...parents, node.label]));
      }
    };

    filteredNavLinks.forEach((item) => walk(item, []));

    const seen = new Set<string>();
    return output.filter((item) => {
      if (seen.has(item.path)) return false;
      seen.add(item.path);
      return true;
    });
  }, [filteredNavLinks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flatItems;

    const hit = (value = "") => value.toLowerCase().includes(q);
    return flatItems.filter(
      (item) => hit(item.label) || hit(item.context ?? "") || hit(item.path)
    );
  }, [query, flatItems]);

  const nonActiveClass =
    "text-white/90 hover:text-white hover:underline hover:underline-offset-8";
  const activeClass = "text-white font-bold underline underline-offset-8";

  const closeMobile = () => {
    setMobileNavOpen(false);
    setQuery("");
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logoutAuthSession();
      setOpenMenu(null);
      setIsUserMenuOpen(false);
      closeMobile();
      void navigate(APP_ROUTES.HOME);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName =
    typeof authUser?.name === "string" && authUser.name.trim()
      ? authUser.name.trim()
      : "Admin";
  const displayEmail =
    typeof authUser?.email === "string" && authUser.email.trim()
      ? authUser.email.trim()
      : "admin@gmail.com";
  const avatarLabel = displayName.charAt(0).toUpperCase();
  const canAccessAdminManagement =
    !accessControlEnabled ||
    hasAnyPermission(accessUser, [
      PERMISSIONS.ADMIN_DASHBOARD_MAIN,
      PERMISSIONS.ADMIN_ROLES_READ,
      PERMISSIONS.ADMIN_ROLES_CREATE,
      PERMISSIONS.ADMIN_ROLES_UPDATE,
      PERMISSIONS.ADMIN_ROLES_DELETE
    ]);

  return (
    <header className="sticky top-0 z-999 bg-linear-to-r from-[#5E7ADD] to-[#384AA0] text-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3.5 lg:px-8">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2"
          aria-label="Beranda"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15 text-[11px] font-bold tracking-[0.2em] text-white ring-1 ring-white/20">
            PF
          </span>
          <span className="truncate text-base font-semibold sm:text-lg">
            SIDE
          </span>
        </Link>

        <nav
          ref={menuRef}
          className="relative hidden items-center gap-6 font-medium md:flex"
          aria-label="Navigasi utama"
        >
          {filteredNavLinks.map((menu) => {
            const hasChildren =
              Array.isArray(menu.children) && menu.children.length > 0;
            const active = isMenuActive(menu);

            if (menu.path === APP_ROUTES.HOME) {
              return (
                <NavLink
                  key={menu.label}
                  to={APP_ROUTES.HOME}
                  className={({ isActive }) =>
                    isActive ? activeClass : nonActiveClass
                  }
                >
                  {menu.label}
                </NavLink>
              );
            }

            if (hasChildren) {
              return (
                <div key={menu.label} className="relative">
                  <Button
                    type="button"
                    onClick={() =>
                      setOpenMenu(openMenu === menu.label ? null : menu.label)
                    }
                    className={active ? activeClass : nonActiveClass}
                    aria-expanded={openMenu === menu.label}
                    aria-haspopup="menu"
                  >
                    {menu.label}
                  </Button>

                  {openMenu === menu.label && (
                    <div
                      role="menu"
                      className="absolute right-0 z-50 mt-3 w-72 rounded-xl border border-gray-100 bg-white p-2 text-gray-800 shadow-lg"
                    >
                      {menu.children?.map((child) => {
                        if (
                          Array.isArray(child.children) &&
                          child.children.length > 0
                        ) {
                          return (
                            <div key={child.label} className="mb-2">
                              <div className="px-4 py-2 font-semibold text-gray-500">
                                {child.label}
                              </div>
                              {child.children.map((grand) => {
                                if (
                                  grand.external ||
                                  grand.path.startsWith("http")
                                ) {
                                  return (
                                    <a
                                      key={`${grand.label}-${grand.path}`}
                                      href={grand.path}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => setOpenMenu(null)}
                                      className="block rounded px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                                    >
                                      {grand.label}
                                    </a>
                                  );
                                }

                                return (
                                  <NavLink
                                    key={`${grand.label}-${grand.path}`}
                                    to={grand.path}
                                    onClick={() => setOpenMenu(null)}
                                    className={({ isActive }) =>
                                      `block rounded px-4 py-2 text-sm ${
                                        isActive
                                          ? "bg-gray-100 font-semibold text-[#162360]"
                                          : "text-gray-800 hover:bg-gray-50"
                                      }`
                                    }
                                  >
                                    {grand.label}
                                  </NavLink>
                                );
                              })}
                            </div>
                          );
                        }

                        if (child.external || child.path.startsWith("http")) {
                          return (
                            <a
                              key={`${child.label}-${child.path}`}
                              href={child.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setOpenMenu(null)}
                              className="block rounded px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                            >
                              {child.label}
                            </a>
                          );
                        }

                        return (
                          <NavLink
                            key={`${child.label}-${child.path}`}
                            to={child.path}
                            onClick={() => setOpenMenu(null)}
                            className={({ isActive }) =>
                              `block rounded px-4 py-2 text-sm ${
                                isActive
                                  ? "bg-gray-100 font-semibold text-[#162360]"
                                  : "text-gray-800 hover:bg-gray-50"
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (menu.external || menu.path.startsWith("http")) {
              return (
                <a
                  key={menu.label}
                  href={menu.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={active ? activeClass : nonActiveClass}
                >
                  {menu.label}
                </a>
              );
            }

            return (
              <NavLink
                key={menu.label}
                to={menu.path}
                className={({ isActive }) =>
                  isActive || active ? activeClass : nonActiveClass
                }
              >
                {menu.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {accessControlEnabled && isAuthenticated ? (
            <div ref={userMenuRef} className="relative">
              <Button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setIsUserMenuOpen((open) => !open)}
                className="inline-flex min-w-32 items-center justify-start gap-2.5 rounded-md bg-white/5 px-3 py-2 text-left text-white shadow-[0_10px_24px_rgba(10,25,80,0.18)] ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/20"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-base font-bold text-[#223B8F]">
                  {avatarLabel}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold leading-tight">
                    {displayName}
                  </span>
                  <span className="block truncate text-[11px] text-white/85">
                    {displayEmail}
                  </span>
                </span>
                {isUserMenuOpen ? (
                  <ChevronUpIcon className="h-4 w-4 shrink-0 text-white" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-white" />
                )}
              </Button>

              {isUserMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 z-1200 mt-3 w-64 rounded-md bg-white p-1 text-[#142B70] shadow-[0_14px_32px_rgba(27,44,88,0.25)] ring-1 ring-slate-100"
                >
                  {canAccessAdminManagement ? (
                    <Link
                      to={APP_ROUTES.ADMIN_MANAGEMENT.DASHBOARD}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block rounded-sm px-3 py-2 text-sm font-medium transition hover:bg-slate-50"
                    >
                      Beranda Admin
                    </Link>
                  ) : null}
                  <Link
                    to={APP_ROUTES.UNDER_CONSTRUCTION}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block rounded-sm px-3 py-2 text-sm font-medium transition hover:bg-slate-50"
                  >
                    Profil
                  </Link>
                  <div className="my-2 border-t border-slate-200" />
                  <Button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    className="block w-full justify-start rounded-sm px-3 py-2 text-left text-sm font-semibold text-[#F0354A] transition hover:bg-rose-50"
                  >
                    {isLoggingOut ? (
                      <span className="inline-flex items-center gap-2">
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        Keluar...
                      </span>
                    ) : (
                      "Keluar"
                    )}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : accessControlEnabled ? (
            <Link
              to={APP_ROUTES.LOGIN}
              className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 font-semibold text-black transition hover:bg-blue-100"
            >
              Masuk
            </Link>
          ) : null}
        </div>

        <div className="md:hidden">
          <Button
            onClick={() => setMobileNavOpen((open) => !open)}
            className="rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label="Buka menu"
            aria-controls="mobile-nav"
            aria-expanded={mobileNavOpen}
            type="button"
          >
            {mobileNavOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </Button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`fixed inset-0 z-100 transition-opacity md:hidden ${
          mobileNavOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileNavOpen}
      >
        <Button
          type="button"
          aria-label="Tutup menu"
          className={`absolute inset-0 bg-black/35 transition-opacity ${
            mobileNavOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobile}
        />

        <div
          ref={mobilePanelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          className={`absolute bottom-0 left-0 right-0 flex h-[85vh] max-h-[85vh] w-screen flex-col rounded-t-xl bg-white text-gray-900 shadow-2xl transition-transform duration-300 ease-out ${
            mobileNavOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex justify-center pt-2">
            <div className="h-1.5 w-12 rounded-full bg-gray-300" />
          </div>

          <div className="border-b border-slate-200 px-4 pb-3 pt-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#384AA0] text-[10px] font-bold tracking-[0.2em] text-white">
                  PF
                </span>
                <span className="truncate text-base font-semibold text-[#162360]">
                  Menu
                </span>
              </div>
              <Button
                onClick={closeMobile}
                className="rounded-md p-2 hover:bg-gray-100"
                aria-label="Tutup menu"
                type="button"
              >
                <XMarkIcon className="h-6 w-6 text-gray-700" />
              </Button>
            </div>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari halaman..."
                className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#5E7ADD]/30"
                inputMode="search"
                aria-label="Cari halaman"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {filtered.map((item) => {
                const TopIcon = iconMap[item.topLabel] ?? Squares2X2Icon;
                const active = isLinkActive(item.path);
                const title = item.context
                  ? `${item.context} > ${item.label}`
                  : item.label;

                if (item.external || item.path.startsWith("http")) {
                  return (
                    <a
                      key={`${item.label}-${item.path}`}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMobile}
                      title={title}
                      className="group flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 hover:bg-gray-50"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-100">
                          <TopIcon className="h-5 w-5 text-[#384AA0]" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-semibold text-gray-900">
                            {item.label}
                          </div>
                          {item.context && (
                            <div className="truncate text-[11px] text-gray-500">
                              {item.context}
                            </div>
                          )}
                        </div>
                      </div>
                    </a>
                  );
                }

                return (
                  <NavLink
                    key={`${item.label}-${item.path}`}
                    to={item.path}
                    onClick={closeMobile}
                    title={title}
                    className={({ isActive }) =>
                      `group flex flex-col gap-2 rounded-lg border px-3 py-3 ${
                        isActive || active
                          ? "border-[#384AA0] bg-[#384AA0]/5"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`
                    }
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-100">
                        <TopIcon className="h-5 w-5 text-[#384AA0]" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-gray-900">
                          {item.label}
                        </div>
                        {item.context && (
                          <div className="truncate text-[11px] text-gray-500">
                            {item.context}
                          </div>
                        )}
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              {accessControlEnabled && isAuthenticated ? (
                <Button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 font-semibold text-[#384AA0] transition hover:bg-blue-100"
                >
                  {isLoggingOut ? (
                    <>
                      <ArrowPathIcon className="mr-2 h-5 w-5 animate-spin" />
                      Logout...
                    </>
                  ) : (
                    <>
                      <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                      Logout
                    </>
                  )}
                </Button>
              ) : accessControlEnabled ? (
                <Link
                  to={APP_ROUTES.LOGIN}
                  onClick={closeMobile}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 font-semibold text-[#384AA0] transition hover:bg-blue-100"
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                  Masuk
                </Link>
              ) : null}
            </div>
          </div>

          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </header>
  );
}
