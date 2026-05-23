import React from "react";
import {
  ArrowDownIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { Pagination } from "@/components/ui/Pagination";
import type { InfrastrukturPerwakilanAsingData } from "@/type/indonesiaInfrastruktur";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { cn } from "@/utils/cn";

type SortDirection = "asc" | "desc";
type SortKey = "country" | "email" | "address" | "map";

function sortIcon(
  activeKey: SortKey,
  sortKey: SortKey,
  direction: SortDirection
) {
  if (activeKey !== sortKey)
    return <ArrowsUpDownIcon className="h-3 w-3 text-slate-400" />;
  return direction === "asc" ? (
    <ArrowUpIcon className="h-3 w-3 text-slate-700" />
  ) : (
    <ArrowDownIcon className="h-3 w-3 text-slate-700" />
  );
}

function buildMapsUrl(coordinates: string | null) {
  if (!coordinates) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(coordinates)}`;
}

export function PerwakilanAsingTab({
  data
}: {
  data: InfrastrukturPerwakilanAsingData;
}) {
  const [search, setSearch] = React.useState("");
  const [limit, setLimit] = React.useState("10");
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<SortKey>("country");
  const [direction, setDirection] = React.useState<SortDirection>("asc");

  const filteredItems = React.useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return data.items;
    return data.items.filter((item) =>
      [item.country, item.email ?? "", item.address ?? "", item.koordinat ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [data.items, search]);

  const sortedItems = React.useMemo(() => {
    const next = [...filteredItems];
    next.sort((left, right) => {
      const leftValue =
        sortKey === "email"
          ? (left.email ?? "")
          : sortKey === "address"
            ? (left.address ?? "")
            : sortKey === "map"
              ? (left.koordinat ?? "")
              : left.country;
      const rightValue =
        sortKey === "email"
          ? (right.email ?? "")
          : sortKey === "address"
            ? (right.address ?? "")
            : sortKey === "map"
              ? (right.koordinat ?? "")
              : right.country;

      const compared = String(leftValue).localeCompare(
        String(rightValue),
        "id-ID",
        {
          sensitivity: "base",
          numeric: true
        }
      );
      return direction === "asc" ? compared : -compared;
    });
    return next;
  }, [direction, filteredItems, sortKey]);

  React.useEffect(() => {
    setPage(1);
  }, [direction, limit, search, sortKey]);

  const itemsPerPage = React.useMemo(() => {
    if (limit === "ALL") return sortedItems.length || 1;
    const numericLimit = Number(limit);
    return Number.isFinite(numericLimit) && numericLimit > 0
      ? numericLimit
      : 10;
  }, [limit, sortedItems.length]);

  const totalPages = React.useMemo(() => {
    if (limit === "ALL") return 1;
    return Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));
  }, [itemsPerPage, limit, sortedItems.length]);

  const visibleItems = React.useMemo(() => {
    if (limit === "ALL") return sortedItems;
    const startIndex = (page - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [itemsPerPage, limit, page, sortedItems]);

  const sortColumnLabel = React.useMemo(() => {
    if (sortKey === "country") return "Negara";
    if (sortKey === "email") return "Email";
    if (sortKey === "address") return "Alamat";
    return "Map";
  }, [sortKey]);

  const toggleSort = React.useCallback(
    (nextKey: SortKey) => {
      if (sortKey === nextKey) {
        setDirection((current) => (current === "asc" ? "desc" : "asc"));
        return;
      }
      setSortKey(nextKey);
      setDirection("desc");
    },
    [sortKey]
  );

  const handleDownload = React.useCallback(() => {
    downloadTableAsExcel({
      title: "Perwakilan Asing di Indonesia",
      subtitle: `Data ditampilkan ${visibleItems.length} baris | Sorting berdasarkan kolom ${sortColumnLabel}`,
      columns: [
        {
          key: "no",
          label: "No",
          selector: (_row, index) => index + 1,
          exportValue: (_row, index) => index + 1,
          numeric: true
        },
        { key: "country", label: "Negara" },
        { key: "email", label: "Email" },
        { key: "address", label: "Alamat" },
        { key: "map", label: "Map" }
      ],
      rows: visibleItems.map((item) => ({
        country: item.country,
        email: item.email ?? "-",
        address: item.address ?? "-",
        map: buildMapsUrl(item.koordinat) ?? "-"
      })),
      filename: "perwakilan_asing"
    });
  }, [sortColumnLabel, visibleItems]);

  const tableContent = (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari negara, email, alamat..."
          containerClassName="max-w-[260px]"
          className="h-8 rounded-md py-1 text-xs"
          leftSlot={<MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />}
        />
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-slate-600">Tampilkan</label>
          <DataLimitSelect
            value={limit}
            onChange={setLimit}
            options={["10", "25", "50", "100", "ALL"]}
            className="w-32"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-slate-200">
        <div
          className={cn(
            "h-full overflow-x-auto",
            limit !== "10" ? "max-h-136 overflow-y-auto" : "overflow-y-visible"
          )}
        >
          <table className="w-full border-collapse divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="sticky top-0 left-0 z-30 w-12 bg-slate-100 px-3 py-2 text-center font-semibold">
                  No
                </th>
                <th
                  className="sticky top-0 z-20 min-w-56 bg-slate-100 px-3 py-2 text-left font-semibold"
                  style={{ left: "3rem" }}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("country")}
                  >
                    Negara
                    {sortIcon("country", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-56 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("email")}
                  >
                    Email
                    {sortIcon("email", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-96 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("address")}
                  >
                    Alamat
                    {sortIcon("address", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-32 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("map")}
                  >
                    Map
                    {sortIcon("map", sortKey, direction)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleItems.map((item, index) => (
                <tr key={`${item.alpha3 ?? item.country}-${index}`}>
                  <td className="sticky left-0 z-20 bg-white px-3 py-2 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td
                    className="sticky z-1 bg-white px-3 py-2"
                    style={{ left: "3rem" }}
                  >
                    <div className="flex items-center gap-2">
                      <CountryFlag
                        alpha2={item.alpha2}
                        countryName={item.country}
                        className="h-5 w-5 rounded-none bg-transparent! text-[14px]"
                      />
                      <span className="font-semibold text-slate-900">
                        {item.country}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">
                      {item.email ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="line-clamp-3 font-semibold text-slate-700">
                      {item.address ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {buildMapsUrl(item.koordinat) ? (
                      <a
                        href={buildMapsUrl(item.koordinat) ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Kunjungi
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );

  return (
    <ExpandableCard
      title="Perwakilan Asing di Indonesia"
      subtitle={`${filteredItems.length.toLocaleString("id-ID")} data | Sorting berdasarkan kolom ${sortColumnLabel}`}
      expandedContent={<div className="space-y-3">{tableContent}</div>}
      modalSize="full"
      actions={
        <IconTooltip label="Unduh Excel">
          <span>
            <Button
              type="button"
              variant="outline"
              className="rounded-md p-2 text-slate-600"
              onClick={handleDownload}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      contentClassName="space-y-3"
    >
      {tableContent}
    </ExpandableCard>
  );
}
