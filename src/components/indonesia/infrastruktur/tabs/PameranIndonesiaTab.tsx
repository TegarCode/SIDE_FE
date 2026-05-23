import React from "react";
import {
  ArrowDownIcon,
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { Pagination } from "@/components/ui/Pagination";
import type { InfrastrukturPameranIndonesiaData } from "@/type/indonesiaInfrastruktur";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { cn } from "@/utils/cn";

type SortDirection = "asc" | "desc";
type SortKey =
  | "agenda"
  | "kategori"
  | "provinsi"
  | "tanggalMulai"
  | "tanggalBerakhir";

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

export function PameranIndonesiaTab({
  data
}: {
  data: InfrastrukturPameranIndonesiaData;
}) {
  const [search, setSearch] = React.useState("");
  const [limit, setLimit] = React.useState("10");
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<SortKey>("agenda");
  const [direction, setDirection] = React.useState<SortDirection>("asc");

  const filteredItems = React.useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return data.items;
    return data.items.filter((item) =>
      [
        item.agenda,
        item.kategori ?? "",
        item.provinsi ?? "",
        item.tanggalMulai ?? "",
        item.tanggalBerakhir ?? ""
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
    if (sortKey === "agenda") return "Agenda";
    if (sortKey === "kategori") return "Kategori";
    if (sortKey === "provinsi") return "Provinsi";
    if (sortKey === "tanggalMulai") return "Tanggal Mulai";
    return "Tanggal Berakhir";
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
      title: "Pameran di Indonesia",
      subtitle: `Data ditampilkan ${visibleItems.length} baris | Sorting berdasarkan kolom ${sortColumnLabel}. | Data pameran-pameran yang berlangsung di Indonesia (sesuai filter Ditjen / Wilayah / Kategori pada bagian atas halaman).`,
      columns: [
        {
          key: "no",
          label: "No",
          selector: (_row, index) => index + 1,
          exportValue: (_row, index) => index + 1,
          numeric: true
        },
        { key: "agenda", label: "Agenda" },
        { key: "kategori", label: "Kategori" },
        { key: "provinsi", label: "Provinsi" },
        { key: "tanggalMulai", label: "Tanggal Mulai" },
        { key: "tanggalBerakhir", label: "Tanggal Berakhir" }
      ],
      rows: visibleItems.map((item) => ({
        agenda: item.agenda,
        kategori: item.kategori ?? "-",
        provinsi: item.provinsi ?? "-",
        tanggalMulai: item.tanggalMulai ?? "-",
        tanggalBerakhir: item.tanggalBerakhir ?? "-"
      })),
      filename: "pameran_indonesia"
    });
  }, [sortColumnLabel, visibleItems]);

  const tableContent = (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari agenda, kategori, provinsi..."
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
                  className="sticky top-0 z-20 min-w-80 bg-slate-100 px-3 py-2 text-left font-semibold"
                  style={{ left: "3rem" }}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("agenda")}
                  >
                    Agenda
                    {sortIcon("agenda", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-44 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("kategori")}
                  >
                    Kategori
                    {sortIcon("kategori", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-40 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("provinsi")}
                  >
                    Provinsi
                    {sortIcon("provinsi", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-36 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("tanggalMulai")}
                  >
                    Tgl Mulai
                    {sortIcon("tanggalMulai", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-36 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("tanggalBerakhir")}
                  >
                    Tgl Berakhir
                    {sortIcon("tanggalBerakhir", sortKey, direction)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleItems.map((item, index) => (
                <tr key={`${item.agenda}-${index}`}>
                  <td className="sticky left-0 z-20 bg-white px-3 py-2 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td
                    className="sticky z-1 bg-white px-3 py-2"
                    style={{ left: "3rem" }}
                  >
                    <span className="font-semibold text-slate-900">
                      {item.agenda}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">
                      {item.kategori ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">
                      {item.provinsi ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-700">
                      {item.tanggalMulai ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-700">
                      {item.tanggalBerakhir ?? "-"}
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
      title="Pameran di Indonesia"
      subtitle={`${filteredItems.length.toLocaleString("id-ID")} data | Sorting berdasarkan kolom ${sortColumnLabel}. | Data pameran-pameran yang berlangsung di Indonesia (sesuai filter Ditjen / Wilayah / Kategori pada bagian atas halaman).`}
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
