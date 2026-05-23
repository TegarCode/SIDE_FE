import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export type TabItem<TValue extends string = string> = {
  value: TValue;
  label: string;
  disabled?: boolean;
};

type TabsProps<TValue extends string = string> = {
  items: TabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  listClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
};

export function Tabs<TValue extends string = string>({
  items,
  value,
  onChange,
  className,
  listClassName,
  tabClassName,
  activeTabClassName,
  inactiveTabClassName
}: TabsProps<TValue>) {
  return (
    <div className={className}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={cn("inline-flex gap-2", listClassName)}
      >
        {items.map((item) => {
          const isActive = item.value === value;

          return (
            <Button
              key={item.value}
              type="button"
              variant={isActive ? "primary" : "secondary"}
              rounded="full"
              role="tab"
              aria-selected={isActive}
              disabled={item.disabled}
              onClick={() => onChange(item.value)}
              className={cn(
                "whitespace-nowrap px-3 py-1.5 text-xs font-semibold transition-colors",
                isActive ? activeTabClassName : inactiveTabClassName,
                tabClassName
              )}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
