import {
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  HomeIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ADMIN_NOTIFICATIONS } from "@/constants/adminDashboard";
import { APP_ROUTES } from "@/constants/routes";
import { logoutAuthSession } from "@/service/authSession";

function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void
) {
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onOutsideClick, ref]);
}

type AdminTopbarProps = {
  title: string;
  description: string;
  displayName: string;
  onOpenMobileSidebar: () => void;
};

function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-md px-3 py-2.5 text-slate-700"
        aria-label="Lihat notifikasi"
        aria-expanded={open}
      >
        <BellIcon className="h-5 w-5" />
        <span className="absolute right-2.5 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
      </Button>

      {open ? (
        <div className="absolute right-0 mt-2 w-[min(92vw,360px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheckIcon className="h-4 w-4 text-[#223B8F]" />
                  Notifikasi Admin
                </div>
                <div className="text-xs text-slate-500">
                  3 item membutuhkan perhatian
                </div>
              </div>
              <span className="rounded-full bg-[#223B8F] px-2 py-1 text-[11px] font-semibold text-white">
                3 baru
              </span>
            </div>
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto p-3">
            {ADMIN_NOTIFICATIONS.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-slate-200 bg-white p-3 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#223B8F]" />
                    <div className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </div>
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-500">
                    {item.description}
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-400">
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProfileDropdown({
  displayName,
  isLoggingOut,
  onLogout
}: {
  displayName: string;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-3 rounded-lg px-3 py-2"
        aria-expanded={open}
        aria-label="Buka menu profil admin"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#223B8F] text-sm font-semibold text-white">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {displayName}
          </span>
          <span className="block truncate text-xs text-slate-500">
            Area pengelolaan admin
          </span>
        </span>
        <ChevronDownIcon className="h-4 w-4 text-slate-500" />
      </Button>

      {open ? (
        <div className="absolute right-0 mt-2 w-60 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
          <div className="px-2 py-2">
            <div className="text-sm font-semibold text-slate-900">
              {displayName}
            </div>
            <div className="text-xs text-slate-500">
              Navigasi cepat area admin
            </div>
          </div>
          <div className="my-1 border-t border-slate-200" />
          <Link
            to={APP_ROUTES.HOME}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <HomeIcon className="h-4 w-4 text-slate-500" />
            Kembali ke Beranda
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="mt-1 flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            )}
            {isLoggingOut ? "Keluar..." : "Logout"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function AdminTopbar({
  title,
  description,
  displayName,
  onOpenMobileSidebar
}: AdminTopbarProps) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutAuthSession();
      void navigate(APP_ROUTES.HOME);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onOpenMobileSidebar}
            className="rounded-md p-2 text-slate-700 lg:hidden"
            aria-label="Buka sidebar admin"
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {title}
            </div>
            <div className="truncate text-xs text-slate-500">{description}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationDropdown />
          <ProfileDropdown
            displayName={displayName}
            isLoggingOut={isLoggingOut}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}
