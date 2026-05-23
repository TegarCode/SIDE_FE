import { cn } from "@/utils/cn";

type PageTitleProps = {
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
};

export function PageTitle({
  title,
  description,
  className,
  actions
}: PageTitleProps) {
  return (
    <section className={cn("w-full", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}
