import React from "react";
import {
  ArrowDownTrayIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { Modal } from "@/components/ui/Modal";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import { TradeCompetitionInsight } from "@/components/ui/TradeCompetitionInsight";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { AnalisisKomoditasEksporUtamaResult } from "@/type/analisis";
import type {
  DiplomasiExportProductInsightItem,
  TopProdukItem
} from "@/type/indonesiaDiplomasi";

type CompetitionModalState = {
  item: TopProdukItem;
  group: "asean" | "global";
};

type AnalisisProdukKomoditasTableSectionProps = {
  data: AnalisisKomoditasEksporUtamaResult | null;
  loading?: boolean;
  errorMessage?: string | null;
};

function toInsightProduct(
  item: TopProdukItem
): DiplomasiExportProductInsightItem {
  return {
    ...item,
    neraca: item.neraca ?? {},
    share: item.share ?? {},
    export: item.export ?? item.nilai,
    import: item.import ?? {},
    exportReverse: item.exportReverse ?? {},
    importReverse: item.importReverse ?? {},
    tujuanEkspor: item.tujuanEkspor ?? [],
    tujuanImpor: item.tujuanImpor ?? [],
    kompetitorGlobalTopTujuanEkspor: item.kompetitorGlobalTopTujuanEkspor ?? [],
    kompetitorAseanTopTujuanEkspor: item.kompetitorAseanTopTujuanEkspor ?? [],
    kompetitorGlobalTopTujuanImpor: item.kompetitorGlobalTopTujuanImpor ?? [],
    kompetitorAseanTopTujuanImpor: item.kompetitorAseanTopTujuanImpor ?? []
  };
}

function buildProductOptions(item: TopProdukItem) {
  return [
    {
      value: item.hs,
      label: `${item.hs} - ${item.name}`
    }
  ];
}

export function AnalisisProdukKomoditasTableSection({
  data,
  loading = false,
  errorMessage
}: AnalisisProdukKomoditasTableSectionProps) {
  const [sortColumnLabel, setSortColumnLabel] = React.useState("Produk (HS)");
  const [modalState, setModalState] =
    React.useState<CompetitionModalState | null>(null);
  const downloadHandlerRef = React.useRef<(() => void) | null>(null);
  const [hasDownloadHandler, setHasDownloadHandler] = React.useState(false);

  const yearsAsc = React.useMemo(
    () => data?.meta.years ?? [],
    [data?.meta.years]
  );
  const startYear = yearsAsc[0] ?? null;
  const endYear = yearsAsc[yearsAsc.length - 1] ?? null;
  const yearLabel =
    startYear != null && endYear != null
      ? startYear === endYear
        ? `Tahun ${startYear}`
        : `Tahun ${startYear}-${endYear}`
      : "Tahun -";
  const originLabel = data?.meta.originName ?? data?.meta.origin ?? "-";
  const destinationLabel =
    (data?.meta.destinations ?? [])
      .map((code) => data?.meta.destinationNames[code] ?? code)
      .join(", ") || "-";
  const destinationNames = (data?.meta.destinations ?? []).map(
    (code) => data?.meta.destinationNames[code] ?? code
  );
  const destinationPreview =
    destinationNames.length > 3
      ? `${destinationNames.slice(0, 3).join(", ")} +${destinationNames.length - 3} lainnya`
      : destinationNames.join(", ") || "-";
  const subtitle = `${yearLabel} | Unit: ${data?.meta.unit ?? "-"} | Asal: ${originLabel} | Tujuan: ${destinationLabel} | Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel} | Hover kolom ekspor untuk detail nilai, pangsa, dan indikasi under invoicing. Baris berwarna kuning menandakan indikasi under invoicing. Klik nama negara di kolom kompetitor untuk membuka modal daftar kompetitor.`;

  const columnInfoByKey = React.useMemo(
    () => ({
      produk: (
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-800">HS Produk</p>
          <p>
            Kode HS 4 digit dan deskripsi produk utama yang diekspor negara asal
            ke mitra tujuan.
          </p>
        </div>
      ),
      cagr: (
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-800">CAGR %</p>
          <p>
            Laju pertumbuhan tahunan majemuk ekspor produk pada rentang tahun
            yang tersedia.
          </p>
        </div>
      ),
      "kompetitor-asean": (
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-800">Kompetitor ASEAN</p>
          <p>
            Negara ASEAN dengan nilai ekspor tertinggi untuk produk yang sama ke
            mitra tujuan pada tahun terakhir.
          </p>
        </div>
      ),
      "kompetitor-global": (
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-800">Kompetitor Global</p>
          <p>
            Negara global dengan nilai ekspor tertinggi untuk produk yang sama
            ke mitra tujuan pada tahun terakhir.
          </p>
        </div>
      ),
      ...Object.fromEntries(
        yearsAsc.map((year) => [
          `year-${year}`,
          <div key={year} className="space-y-1 text-xs">
            <p className="font-semibold text-slate-800">Ekspor {year}</p>
            <p>
              Menampilkan nilai ekspor, pangsa, dan perubahan dibanding tahun
              sebelumnya.
            </p>
          </div>
        ])
      )
    }),
    [yearsAsc]
  );

  const modalTitle =
    modalState?.group === "asean"
      ? "Detail Kompetitor ASEAN"
      : modalState?.group === "global"
        ? "Detail Kompetitor Global"
        : "Detail Kompetitor";

  const modalProduct = modalState ? toInsightProduct(modalState.item) : null;
  const listYearLabel = endYear;
  const cardTitle = (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span>{`Daftar Nilai Ekspor Produk Negara/Entitas ${originLabel} ke ${destinationPreview}`}</span>
      {destinationNames.length > 3 ? (
        <HoverInfoTooltip
          content={
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-slate-800">
                Daftar Negara Tujuan
              </p>
              <ul className="max-h-48 overflow-auto space-y-0.5">
                {destinationNames.map((name, index) => (
                  <li key={`${name}-${index}`}>{name}</li>
                ))}
              </ul>
            </div>
          }
        >
          <span className="inline-flex items-center text-slate-400 transition hover:text-slate-600">
            <InformationCircleIcon className="h-4 w-4" />
          </span>
        </HoverInfoTooltip>
      ) : null}
    </span>
  );
  const cardActions = (
    <IconTooltip label="Unduh Excel">
      <span>
        <Button
          type="button"
          className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          onClick={() => downloadHandlerRef.current?.()}
          disabled={!hasDownloadHandler}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
      </span>
    </IconTooltip>
  );

  const handleRegisterDownload = React.useCallback(
    (handler: (() => void) | null) => {
      downloadHandlerRef.current = handler;
      setHasDownloadHandler(Boolean(handler));
    },
    []
  );

  const tableContent = data ? (
    <TopProdukTable
      raw={data.tableRaw}
      unitLabel={data.meta.unit ?? "-"}
      columnMode="analysis_export"
      emptyMessage="Data komoditas ekspor utama belum tersedia."
      downloadTitle={`Daftar Nilai Ekspor Produk Negara/Entitas ${originLabel} ke ${destinationLabel}`}
      downloadFilename={`Daftar_Nilai_Ekspor_Produk_${originLabel}_ke_${destinationNames.join("_") || "Tujuan"}`}
      downloadSource={data.meta.sourceName ?? undefined}
      showLimitControl
      defaultLimit="10"
      limitOptions={["10", "15", "20", "50"]}
      tableViewportClassName="h-[720px] max-h-[720px]"
      onSortColumnChange={setSortColumnLabel}
      columnInfoByKey={columnInfoByKey}
      onCompetitorClick={(item, group) => setModalState({ item, group })}
      invoiceMode="ekspor"
      invoiceHighlightTone="warning"
      onRegisterDownload={handleRegisterDownload}
    />
  ) : null;

  return (
    <section className="space-y-4">
      <Modal
        open={Boolean(modalState && modalProduct)}
        onClose={() => setModalState(null)}
        title={modalTitle}
        subtitle={
          modalState
            ? `HS ${modalState.item.hs} - ${modalState.item.name}`
            : undefined
        }
        size="full"
        bodyClassName="space-y-4"
      >
        {modalProduct && modalState ? (
          <TradeCompetitionInsight
            variant="modal"
            title={modalTitle}
            products={[modalProduct]}
            productOptions={buildProductOptions(modalState.item)}
            selectedHs={modalState.item.hs}
            activeHs={modalState.item.hs}
            onSelectHs={() => {}}
            latestYear={endYear}
            unitLabel={data?.meta.unit ?? "-"}
            sourceLabel={data?.meta.sourceName}
            emptyMessage="Detail kompetitor belum tersedia."
            showHeader={false}
            showProductSelect={false}
            titlePrefixPrimary="Negara Tujuan"
            titlePrefixGlobal="Kompetitor Global ke"
            titlePrefixAsean="Kompetitor ASEAN ke"
            topDestinationLabel="Mitra Tujuan"
            listYearLabel={listYearLabel}
            valueCardTitle="Nilai Ekspor Asal ke Mitra"
            shareCardTitle="Pangsa Asal ke Mitra"
            showPrimaryList={false}
          />
        ) : null}
      </Modal>
      <ExpandableCard
        title={cardTitle}
        subtitle={
          loading ? "Sedang mengambil data komoditas ekspor utama..." : subtitle
        }
        actions={cardActions}
        expandedContent={
          <div className="space-y-3">
            {loading ? (
              <TableSkeleton rows={8} />
            ) : errorMessage ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : (
              tableContent
            )}
            <p className="text-right text-[11px] text-slate-500">
              {data?.meta.sourceName ?? "-"}
            </p>
          </div>
        }
        modalSize="full"
      >
        <div className="flex flex-col">
          {loading ? (
            <TableSkeleton rows={8} className="flex-1" />
          ) : errorMessage ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : (
            tableContent
          )}
          <p className="mt-3 text-right text-[11px] text-slate-500">
            {data?.meta.sourceName ?? "-"}
          </p>
        </div>
      </ExpandableCard>
    </section>
  );
}
