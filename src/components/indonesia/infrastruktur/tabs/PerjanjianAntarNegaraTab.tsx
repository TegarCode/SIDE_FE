import React from "react";
import {
  ArrowDownIcon,
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import type {
  InfrastrukturPerjanjianAntarNegaraData,
  InfrastrukturPerjanjianAntarNegaraItem
} from "@/type/indonesiaInfrastruktur";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { cn } from "@/utils/cn";

type SortDirection = "asc" | "desc";
type SortKey =
  | "kode"
  | "hpi"
  | "namaWilKemlu"
  | "bidangKerjasama"
  | "judulPerjanjianIdn";

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

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="text-[15px] leading-7 text-slate-900">{value || "-"}</div>
    </div>
  );
}

export function PerjanjianAntarNegaraTab({
  data
}: {
  data: InfrastrukturPerjanjianAntarNegaraData;
}) {
  const [search, setSearch] = React.useState("");
  const [limit, setLimit] = React.useState("10");
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<SortKey>("kode");
  const [direction, setDirection] = React.useState<SortDirection>("asc");
  const [selectedBidang, setSelectedBidang] = React.useState<string>("ALL");
  const [selectedItem, setSelectedItem] =
    React.useState<InfrastrukturPerjanjianAntarNegaraItem | null>(null);

  const bidangOptions = React.useMemo(
    () => [
      { value: "ALL", label: "Semua Bidang Kerjasama" },
      ...Array.from(
        new Set(
          data.items
            .map((item) => item.bidangKerjasama)
            .filter((value): value is string => Boolean(value))
        )
      )
        .sort((left, right) =>
          left.localeCompare(right, "id-ID", { sensitivity: "base" })
        )
        .map((value) => ({ value, label: value }))
    ],
    [data.items]
  );

  const filteredItems = React.useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return data.items.filter((item) => {
      const bidangMatch =
        selectedBidang === "ALL" || item.bidangKerjasama === selectedBidang;
      if (!bidangMatch) return false;
      if (!keyword) return true;

      return [
        item.kode,
        item.hpi ?? "",
        item.namaWilKemlu ?? "",
        item.bidangKerjasama ?? "",
        item.judulPerjanjianIdn ?? ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [data.items, search, selectedBidang]);

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
  }, [direction, limit, search, selectedBidang, sortKey]);

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
    if (sortKey === "kode") return "Kode";
    if (sortKey === "hpi") return "HPI";
    if (sortKey === "namaWilKemlu") return "Wilayah Kemlu";
    if (sortKey === "bidangKerjasama") return "Bidang Kerjasama";
    return "Judul Perjanjian";
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
      title: "Perjanjian Antar Negara",
      subtitle: `Data ditampilkan ${visibleItems.length} baris | Sorting berdasarkan kolom ${sortColumnLabel} | Bidang Kerjasama: ${selectedBidang === "ALL" ? "Semua" : selectedBidang}`,
      columns: [
        {
          key: "no",
          label: "No",
          selector: (_row, index) => index + 1,
          exportValue: (_row, index) => index + 1,
          numeric: true
        },
        { key: "kode", label: "Kode" },
        { key: "hpi", label: "HPI" },
        { key: "wilayah", label: "Wilayah Kemlu" },
        { key: "bidang", label: "Bidang Kerjasama" },
        { key: "judul", label: "Judul Perjanjian (IDN)" }
      ],
      rows: visibleItems.map((item) => ({
        kode: item.kode,
        hpi: item.hpi ?? "-",
        wilayah: item.namaWilKemlu ?? "-",
        bidang: item.bidangKerjasama ?? "-",
        judul: item.judulPerjanjianIdn ?? "-"
      })),
      filename: "perjanjian_antar_negara"
    });
  }, [selectedBidang, sortColumnLabel, visibleItems]);

  const tableContent = (
    <>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari kode, HPI, judul..."
            containerClassName="w-full sm:w-[260px]"
            className="h-8 rounded-md py-1 text-xs"
            leftSlot={
              <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
            }
          />
          <Select
            value={selectedBidang}
            options={bidangOptions}
            onChange={setSelectedBidang}
            placeholder="Pilih bidang kerjasama..."
            className="w-full sm:w-[320px] text-sm"
            isSearchable
            size="sm"
          />
        </div>
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
                  className="sticky top-0 z-20 min-w-40 bg-slate-100 px-3 py-2 text-left font-semibold"
                  style={{ left: "3rem" }}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("kode")}
                  >
                    Kode
                    {sortIcon("kode", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-28 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("hpi")}
                  >
                    HPI
                    {sortIcon("hpi", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-40 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("namaWilKemlu")}
                  >
                    Wilayah Kemlu
                    {sortIcon("namaWilKemlu", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-44 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("bidangKerjasama")}
                  >
                    Bidang Kerjasama
                    {sortIcon("bidangKerjasama", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-md bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("judulPerjanjianIdn")}
                  >
                    Judul Perjanjian
                    {sortIcon("judulPerjanjianIdn", sortKey, direction)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-28 bg-slate-100 px-3 py-2 text-center font-semibold">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleItems.map((item, index) => (
                <tr key={`${item.kode}-${index}`}>
                  <td className="sticky left-0 z-20 bg-white px-3 py-2 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td
                    className="sticky z-1 bg-white px-3 py-2"
                    style={{ left: "3rem" }}
                  >
                    <span className="font-semibold text-slate-900">
                      {item.kode}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">
                      {item.hpi ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">
                      {item.namaWilKemlu ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-700">
                      {item.bidangKerjasama ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="line-clamp-3 font-semibold text-slate-700">
                      {item.judulPerjanjianIdn ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-600"
                      onClick={() => setSelectedItem(item)}
                    >
                      <EyeIcon className="h-4 w-4" />
                      Detail
                    </Button>
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
    <>
      <ExpandableCard
        title="Perjanjian Antar Negara"
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

      <Modal
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Agreement Details"
        size="2xl"
        bodyClassName="bg-white p-0"
      >
        {selectedItem ? (
          <div className="overflow-hidden rounded-b-2xl bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  Kode: {selectedItem.kode}
                </span>
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  HPI: {selectedItem.hpi ?? "-"}
                </span>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Bidang: {selectedItem.bidangKerjasama ?? "-"}
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Wilayah Kemlu: {selectedItem.namaWilKemlu ?? "-"}
                </span>
              </div>
            </div>

            <div className="grid gap-8 px-5 py-5 sm:px-6 lg:grid-cols-2">
              <DetailRow
                label="Judul (IDN)"
                value={selectedItem.judulPerjanjianIdn}
              />
              <DetailRow
                label="Judul (ENG)"
                value={selectedItem.judulPerjanjianEng}
              />
              <DetailRow
                label="Wilayah Kemlu"
                value={selectedItem.namaWilKemlu}
              />
              <DetailRow
                label="Kode Wilayah Kemlu"
                value={selectedItem.idWilKemlu}
              />
              <DetailRow
                label="Tempat & Tgl TTD"
                value={selectedItem.tempatTglTtd}
              />
              <DetailRow
                label="Catatan Pengesahan"
                value={selectedItem.catatanPengesahan}
              />
              <DetailRow
                label="Mulai Berlaku"
                value={selectedItem.mulaiBerlaku}
              />
              <DetailRow label="UU" value={selectedItem.uu} />
              <DetailRow
                label="Masa Berlaku"
                value={selectedItem.masaBerlaku}
              />
              <DetailRow
                label="Pengakhiran (IDN)"
                value={selectedItem.caraPengakhiranIdn}
              />
              <DetailRow
                label="Pengakhiran (ENG)"
                value={selectedItem.caraPengakhiranEng}
              />
              <DetailRow
                label="Catatan Khusus"
                value={selectedItem.catatanKhusus}
              />
              <DetailRow label="K/L" value={selectedItem.kl} />
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="primary"
                className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
