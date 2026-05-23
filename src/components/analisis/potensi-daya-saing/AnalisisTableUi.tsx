import React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";

export type AnalisisSortDirection = "asc" | "desc";

type SortIconProps = {
  active: boolean;
  direction: AnalisisSortDirection;
};

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
};

type LimitSelectProps = {
  value: number;
  onChange: (value: number) => void;
  options: number[];
  itemLabel?: string;
  className?: string;
};

export function AnalisisTableSortIcon({ active, direction }: SortIconProps) {
  if (!active) {
    return <ArrowsUpDownIcon className="h-3 w-3 text-slate-400" />;
  }

  return direction === "asc" ? (
    <ArrowUpIcon className="h-3 w-3 text-slate-700" />
  ) : (
    <ArrowDownIcon className="h-3 w-3 text-slate-700" />
  );
}

export function AnalisisTableSearchInput({
  value,
  onChange,
  placeholder = "Cari produk/HS...",
  containerClassName = "max-w-[230px]"
}: SearchInputProps) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      containerClassName={containerClassName}
      className="h-8 rounded-md py-1 text-xs"
      leftSlot={<MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />}
    />
  );
}

export function AnalisisTableLimitSelect({
  value,
  onChange,
  options,
  itemLabel = "produk",
  className = "w-32"
}: LimitSelectProps) {
  return (
    <DataLimitSelect
      value={value === -1 ? "ALL" : String(value)}
      onChange={(next) => onChange(next === "ALL" ? -1 : Number(next))}
      className={className}
      itemLabel={itemLabel}
      options={options.map((item) => (item === -1 ? "ALL" : String(item)))}
    />
  );
}

export const analisisHeaderButtonClass =
  "inline-flex items-center gap-1 transition hover:text-slate-900";

export const analisisHeaderButtonRightClass =
  "ml-auto inline-flex items-center gap-1 text-right transition hover:text-slate-900";

export const analisisDownloadButtonClass =
  "shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50";
