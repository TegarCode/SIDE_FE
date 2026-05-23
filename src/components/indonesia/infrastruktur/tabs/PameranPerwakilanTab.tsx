import React from "react";
import {
  ArrowDownIcon,
  ArrowDownTrayIcon,
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
import type { InfrastrukturPameranPerwakilanData } from "@/type/indonesiaInfrastruktur";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { cn } from "@/utils/cn";

type SortDirection = "asc" | "desc";
type SortKey =
  | "perwakilan"
  | "country"
  | "wilayahKerja"
  | "tempat"
  | "tanggal"
  | "exhibitionPromosi";

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

export function PameranPerwakilanTab({
  data
}: {
  data: InfrastrukturPameranPerwakilanData;
}) {
  const [search, setSearch] = React.useState("");
  const [limit, setLimit] = React.useState("10");
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<SortKey>("perwakilan");
  const [direction, setDirection] = React.useState<SortDirection>("asc");

  const filteredItems = React.useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return data.items;
    return data.items.filter((item) =>
      [
        item.perwakilan,
        item.country,
        item.wilayahKerja ?? "",
        item.tempat ?? "",
        item.tanggal ?? "",
        item.exhibitionPromosi ?? ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [data.items, search]);

  const sortedItems = React.useMemo(() => {
    const next = [...filteredItems];
    next.sort((left, right) => {
      const leftValue = left[sortKey] ?? "";
      const rightValue = right[sortKey] ?? "";
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
    if (sortKey === "perwakilan") return "Perwakilan";
    if (sortKey === "country") return "Negara";
    if (sortKey === "wilayahKerja") return "Wilayah Kerja";
    if (sortKey === "tempat") return "Tempat";
    if (sortKey === "tanggal") return "Tanggal";
    return "Exhibition / Promosi";
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
      title: "Pameran di Perwakilan",
      subtitle: `Data ditampilkan ${visibleItems.length} baris | Sorting berdasarkan kolom ${sortColumnLabel} | Data pameran/promosi yang diselenggarakan oleh perwakilan RI di negara sahabat (sesuai filter Ditjen / Wilayah / Kategori pada bagian atas halaman). | Data diperoleh berdasarkan Masukan Perwakilan terkait.`,
      columns: [
        {
          key: "no",
          label: "No",
          selector: (_row, index) => index + 1,
          exportValue: (_row, index) => index + 1,
          numeric: true
        },
        { key: "perwakilan", label: "Perwakilan" },
        { key: "country", label: "Negara" },
        { key: "wilayahKerja", label: "Wilayah Kerja" },
        { key: "tempat", label: "Tempat" },
        { key: "tanggal", label: "Tanggal" },
        { key: "exhibitionPromosi", label: "Exhibition / Promosi" }
      ],
      rows: visibleItems.map((item) => ({
        perwakilan: item.perwakilan,
        country: item.country,
        wilayahKerja: item.wilayahKerja ?? "-",
        tempat: item.tempat ?? "-",
        tanggal: item.tanggal ?? "-",
        exhibitionPromosi: item.exhibitionPromosi ?? "-"
      })),
      filename: "pameran_perwakilan"
    });
  }, [sortColumnLabel, visibleItems]);

  const tableContent = (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari perwakilan, negara, promosi..."
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
                    onClick={() => toggleSort("perwakilan")}
                  >
                    Perwakilan
                    {sortIcon("perwakilan", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-52 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("country")}
                  >
                    Negara
                    {sortIcon("country", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-40 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("wilayahKerja")}
                  >
                    Wilayah Kerja
                    {sortIcon("wilayahKerja", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-80 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("tempat")}
                  >
                    Tempat
                    {sortIcon("tempat", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-32 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("tanggal")}
                  >
                    Tanggal
                    {sortIcon("tanggal", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-96 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("exhibitionPromosi")}
                  >
                    Exhibition / Promosi
                    {sortIcon("exhibitionPromosi", sortKey, direction)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleItems.map((item, index) => (
                <tr key={`${item.perwakilan}-${item.country}-${index}`}>
                  <td className="sticky left-0 z-20 bg-white px-3 py-2 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td
                    className="sticky z-1 bg-white px-3 py-2"
                    style={{ left: "3rem" }}
                  >
                    <span className="font-semibold text-slate-900">
                      {item.perwakilan}
                    </span>
                  </td>
                  <td className="px-3 py-2">
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
                      {item.wilayahKerja ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="line-clamp-3 font-semibold text-slate-700">
                      {item.tempat ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-700">
                      {item.tanggal ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="line-clamp-3 font-semibold text-slate-700">
                      {item.exhibitionPromosi ?? "-"}
                    </span>
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
      title="Pameran di Perwakilan"
      subtitle={`${filteredItems.length.toLocaleString("id-ID")} data | Sorting berdasarkan kolom ${sortColumnLabel}. | Data pameran/promosi yang diselenggarakan oleh perwakilan RI di negara sahabat (sesuai filter Ditjen / Wilayah / Kategori pada bagian atas halaman). | Data diperoleh berdasarkan Masukan Perwakilan terkait.`}
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
