import React from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export type ToastTone = "info" | "success" | "warning" | "error" | "loading";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number | null;
};

type ToastItem = ToastInput & {
  id: string;
  durationMs: number | null;
};

type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback((input: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const item: ToastItem = {
      ...input,
      id,
      durationMs: input.durationMs === null ? null : (input.durationMs ?? 3500)
    };
    setToasts((previous) => [...previous, item]);
    return id;
  }, []);

  const value = React.useMemo(
    () => ({ toast, dismiss: removeToast }),
    [removeToast, toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-2000 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((item) => (
          <ToastCard
            key={item.id}
            item={item}
            onClose={() => removeToast(item.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  onClose
}: {
  item: ToastItem;
  onClose: () => void;
}) {
  const isPersistent = item.durationMs === null;
  const [progress, setProgress] = React.useState(100);
  const [isHover, setIsHover] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);
  const progressRef = React.useRef<number | null>(null);
  const remainingRef = React.useRef(item.durationMs ?? 0);
  const startedAtRef = React.useRef(0);

  const clearTimers = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressRef.current) {
      window.clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  const runTimer = React.useCallback(() => {
    clearTimers();
    startedAtRef.current = Date.now();

    if (isPersistent) return;
    const duration = Math.max(1, item.durationMs ?? 0);

    timerRef.current = window.setTimeout(() => onClose(), remainingRef.current);

    progressRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      const remaining = Math.max(0, remainingRef.current - elapsed);
      setProgress((remaining / duration) * 100);
    }, 50);
  }, [clearTimers, isPersistent, item.durationMs, onClose]);

  React.useEffect(() => {
    runTimer();
    return clearTimers;
  }, [clearTimers, runTimer]);

  const onMouseEnter = () => {
    if (isPersistent) return;
    if (isHover) return;
    setIsHover(true);
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clearTimers();
  };

  const onMouseLeave = () => {
    if (isPersistent) return;
    setIsHover(false);
    runTimer();
  };

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-lg border bg-white shadow-lg ring-1 ring-black/5 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 ${toneClassName(item.tone)}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!isPersistent ? (
        <div className="h-1 w-full bg-slate-100">
          <div
            className={`h-full ${toneProgressClassName(item.tone)} transition-[width] duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toneIconWrapClassName(item.tone)}`}
          >
            {toneIcon(item.tone)}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={onClose}
          aria-label="Dismiss toast"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function toneClassName(tone?: ToastTone) {
  switch (tone) {
    case "success":
      return "border-emerald-200";
    case "warning":
      return "border-amber-200";
    case "error":
      return "border-rose-200";
    case "loading":
      return "border-blue-200";
    default:
      return "border-slate-200";
  }
}

function toneIconWrapClassName(tone?: ToastTone) {
  switch (tone) {
    case "success":
      return "bg-emerald-100 text-emerald-700";
    case "warning":
      return "bg-amber-100 text-amber-700";
    case "error":
      return "bg-rose-100 text-rose-700";
    case "loading":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

function toneProgressClassName(tone?: ToastTone) {
  switch (tone) {
    case "success":
      return "bg-emerald-500";
    case "warning":
      return "bg-amber-500";
    case "error":
      return "bg-rose-500";
    case "loading":
      return "bg-blue-500";
    default:
      return "bg-blue-500";
  }
}

function toneIcon(tone?: ToastTone) {
  switch (tone) {
    case "success":
      return <CheckCircleIcon className="h-5 w-5" />;
    case "warning":
      return <ExclamationTriangleIcon className="h-5 w-5" />;
    case "error":
      return <ExclamationCircleIcon className="h-5 w-5" />;
    case "loading":
      return (
        <svg
          className="h-5 w-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 0 1 8-8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return <InformationCircleIcon className="h-5 w-5" />;
  }
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
