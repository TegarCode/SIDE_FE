import {
  ExclamationTriangleIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";

type UnauthorizedAccessNoticeProps = {
  title: string;
  body: string;
};

export function UnauthorizedAccessNotice({
  title,
  body
}: UnauthorizedAccessNoticeProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700 ring-1 ring-amber-200">
            <LockClosedIcon className="h-3.5 w-3.5" />
            Akses Perlu Login
          </div>
          <div className="mt-3 flex items-start gap-3">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Link
            to={APP_ROUTES.LOGIN}
            className="inline-flex items-center justify-center rounded-lg bg-[#384AA0] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#253583]"
          >
            Masuk
          </Link>
          <Link
            to={APP_ROUTES.HOME}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Beranda
          </Link>
        </div>
      </div>
    </section>
  );
}
