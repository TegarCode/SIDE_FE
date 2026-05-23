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
import type { InfrastrukturOverviewData } from "@/type/indonesiaInfrastruktur";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { cn } from "@/utils/cn";

type SortDirection = "asc" | "desc";
type SortKey = "perwakilan" | "negara" | "kategori" | "alamat" | "website";

function CountryChip({
  country,
  alpha2,
  alpha3
}: {
  country: string;
  alpha2: string | null;
  alpha3: string | null;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold leading-none text-slate-800">
      <CountryFlag
        alpha2={alpha2}
        countryName={alpha3 || country}
        className="h-3.5 w-3.5 rounded-none bg-transparent! p-0 text-[14px]"
      />
      <span className="inline-flex items-center">{country}</span>
    </span>
  );
}

export function PerwakilanIndonesiaTab({
  overview
}: {
  overview: InfrastrukturOverviewData;
}) {
  const [search, setSearch] = React.useState("");
  const [limit, setLimit] = React.useState("10");
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<SortKey>("perwakilan");
  const [direction, setDirection] = React.useState<SortDirection>("asc");

  const filteredItems = React.useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return overview.items;

    return overview.items.filter((item) => {
      const countries = item.countries
        .map((country) => country.country)
        .join(" ");
      return [
        item.perwakilan,
        item.kategori,
        item.alamat ?? "",
        item.situsWeb ?? "",
        countries
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [overview.items, search]);

  const sortedItems = React.useMemo(() => {
    const next = [...filteredItems];
    next.sort((left, right) => {
      const leftValue =
        sortKey === "negara"
          ? left.countries.map((country) => country.country).join(", ")
          : sortKey === "alamat"
            ? (left.alamat ?? "")
            : sortKey === "website"
              ? (left.situsWeb ?? "")
              : left[sortKey];
      const rightValue =
        sortKey === "negara"
          ? right.countries.map((country) => country.country).join(", ")
          : sortKey === "alamat"
            ? (right.alamat ?? "")
            : sortKey === "website"
              ? (right.situsWeb ?? "")
              : right[sortKey];

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
  }, [limit, search, sortKey, direction]);

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
    if (sortKey === "negara") return "Negara";
    if (sortKey === "kategori") return "Kategori";
    if (sortKey === "alamat") return "Alamat";
    return "Website";
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

  const sortIcon = React.useCallback(
    (key: SortKey) => {
      if (sortKey !== key)
        return <ArrowsUpDownIcon className="h-3 w-3 text-slate-400" />;
      return direction === "asc" ? (
        <ArrowUpIcon className="h-3 w-3 text-slate-700" />
      ) : (
        <ArrowDownIcon className="h-3 w-3 text-slate-700" />
      );
    },
    [direction, sortKey]
  );

  const handleDownload = React.useCallback(() => {
    const exportItems = visibleItems.map((item) => ({
      perwakilan: item.perwakilan,
      negara: item.countries.map((country) => country.country).join(", "),
      kategori: item.kategori,
      alamat: item.alamat ?? "-",
      website: item.situsWeb ?? "-"
    }));

    downloadTableAsExcel({
      title: "Perwakilan Indonesia",
      subtitle: `Data ditampilkan ${exportItems.length} baris | Sorting berdasarkan kolom ${sortColumnLabel} | Data perwakilan Indonesia di luar negeri (sesuai filter Ditjen / Wilayah / Kategori pada bagian atas halaman).`,
      columns: [
        {
          key: "no",
          label: "No",
          selector: (_row, index) => index + 1,
          exportValue: (_row, index) => index + 1,
          numeric: true
        },
        { key: "perwakilan", label: "Perwakilan" },
        { key: "negara", label: "Negara" },
        { key: "kategori", label: "Kategori" },
        { key: "alamat", label: "Alamat" },
        { key: "website", label: "Website" }
      ],
      rows: exportItems,
      filename: "perwakilan_indonesia"
    });
  }, [sortColumnLabel, visibleItems]);

  const tableContent = (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari perwakilan, negara, kategori..."
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
                  className="sticky top-0 z-20 min-w-52 bg-slate-100 px-3 py-2 text-left font-semibold"
                  style={{ left: "3rem" }}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("perwakilan")}
                  >
                    Perwakilan
                    {sortIcon("perwakilan")}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-64 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("negara")}
                  >
                    Negara
                    {sortIcon("negara")}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-44 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("kategori")}
                  >
                    Kategori
                    {sortIcon("kategori")}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-80 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("alamat")}
                  >
                    Alamat
                    {sortIcon("alamat")}
                  </button>
                </th>
                <th className="sticky top-0 z-10 min-w-32 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("website")}
                  >
                    Website
                    {sortIcon("website")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleItems.map((item, index) => (
                <tr key={`${item.perwakilan}-${index}`}>
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
                    <div className="flex flex-wrap gap-1.5">
                      {item.countries.map((country, countryIndex) => (
                        <CountryChip
                          key={`${item.perwakilan}-${country.alpha3 ?? country.country}-${countryIndex}`}
                          country={country.country}
                          alpha2={country.alpha2}
                          alpha3={country.alpha3}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="line-clamp-3 font-semibold text-slate-700">
                      {item.alamat ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {item.situsWeb ? (
                      <a
                        href={item.situsWeb}
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
      title="Perwakilan Indonesia"
      subtitle={`${filteredItems.length.toLocaleString("id-ID")} data | Sorting berdasarkan kolom ${sortColumnLabel} | Data perwakilan Indonesia di luar negeri (sesuai filter Ditjen / Wilayah / Kategori pada bagian atas halaman).`}
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
