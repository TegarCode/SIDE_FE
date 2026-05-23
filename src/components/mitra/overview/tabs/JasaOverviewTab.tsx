import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { useToast } from "@/components/ui/Toast";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { useMitraOverviewTopServiceQuery } from "@/hooks/mitra/useMitraOverviewTopServiceQuery";

type JasaOverviewTabProps = {
  countryCode: string | null;
  countryName: string;
};

function toTopMitraRaw(
  rows: Array<{
    label: string;
    latestValue: number | null;
    prevValue: number | null;
  }>,
  latestYear: number | null,
  prevYear: number | null
) {
  return {
    data: {
      items: rows.map((item) => ({
        negara: item.label,
        kode_alpha2: null,
        kode_alpha3: null,
        nilai_perdagangan: {
          ...(prevYear != null && item.prevValue != null
            ? { [prevYear]: item.prevValue }
            : {}),
          ...(latestYear != null && item.latestValue != null
            ? { [latestYear]: item.latestValue }
            : {})
        }
      }))
    }
  };
}

export function JasaOverviewTab({
  countryCode,
  countryName
}: JasaOverviewTabProps) {
  const { toast, dismiss } = useToast();
  const query = useMitraOverviewTopServiceQuery(countryCode);
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastCompletedToastKeyRef = React.useRef<string | null>(null);

  const data = query.data;
  const normalizedCountryCode = countryCode?.toUpperCase() ?? null;
  const isDataAligned =
    !normalizedCountryCode ||
    !data?.tujuan ||
    data.tujuan.toUpperCase() === normalizedCountryCode ||
    countryName.toUpperCase() === data.tujuan.toUpperCase();
  const toastKey = React.useMemo(() => {
    if (!normalizedCountryCode) return null;
    return `mitra-top-service-${normalizedCountryCode}`;
  }, [normalizedCountryCode]);
  const registerDownload = React.useCallback((handler: (() => void) | null) => {
    setDownloadHandler(() => handler);
  }, []);

  React.useEffect(() => {
    if (!toastKey) return;
    if (query.isFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Sedang tarik data jasa negara mitra",
        description: `Memuat data jasa untuk ${countryName}.`,
        tone: "loading",
        durationMs: null
      });
      return;
    }
    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [countryName, dismiss, query.isFetching, toast, toastKey]);

  React.useEffect(() => {
    if (
      !toastKey ||
      query.isFetching ||
      !query.isSuccess ||
      !data ||
      !isDataAligned
    )
      return;
    if (lastCompletedToastKeyRef.current === toastKey) return;
    lastCompletedToastKeyRef.current = toastKey;
    toast({
      title: "Data jasa negara mitra siap",
      description: `Data jasa untuk ${countryName} berhasil dimuat.`,
      tone: "success"
    });
  }, [
    countryName,
    data,
    isDataAligned,
    query.isFetching,
    query.isSuccess,
    toast,
    toastKey
  ]);

  const serviceRaw = React.useMemo(
    () =>
      toTopMitraRaw(
        data?.rows ?? [],
        data?.latestYear ?? null,
        data?.prevYear ?? null
      ),
    [data?.latestYear, data?.prevYear, data?.rows]
  );

  if ((query.isLoading && !data) || (query.isFetching && !isDataAligned)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold tracking-tight text-slate-900">
          Tenaga Kerja Indonesia di {countryName}
        </h3>
        <div className="mt-4">
          <TableSkeleton rows={8} />
        </div>
      </div>
    );
  }

  if (query.error) {
    return (
      <FilterFallbackCard
        title="Data overview jasa gagal dimuat"
        body={`Terjadi kesalahan saat mengambil data jasa untuk ${countryName}.`}
      />
    );
  }

  if (!data) {
    return (
      <FilterFallbackCard
        title="Data overview jasa belum tersedia"
        body={`Data jasa untuk ${countryName} belum tersedia.`}
      />
    );
  }

  const tableContent = (
    <TopMitraTable
      raw={serviceRaw}
      unitLabel=""
      downloadTitle={`Tenaga Kerja Indonesia di ${countryName}`}
      downloadFilename={`Tenaga_Kerja_Indonesia_di_${countryName.replace(/\s+/g, "_")}_${data.latestYear ?? "-"}`}
      downloadSource={data.source ?? undefined}
      onRegisterDownload={registerDownload}
      emptyMessage={`Data tenaga kerja Indonesia di ${countryName} belum tersedia.`}
      firstColumnLabel="Aktivitas/Profesi"
      valueLabel="Jumlah TKI"
      totalLabel="Total tenaga kerja"
      changeLabel="Perubahan tenaga kerja YoY"
      showShareDetail={false}
      showLimitControl={false}
      displayZeroAsDash
      maximumFractionDigits={0}
    />
  );

  return (
    <ExpandableCard
      title={`Tenaga Kerja Indonesia di ${countryName}`}
      subtitle={`Tahun ${data.latestYear ?? "-"}${data.prevYear != null ? `-${data.prevYear}` : ""} | Unit: Orang`}
      className="min-w-0 min-h-152"
      contentClassName="flex h-full flex-col"
      modalSize="full"
      actions={
        <IconTooltip label="Unduh tabel">
          <span>
            <Button
              type="button"
              disabled={!downloadHandler}
              onClick={() => downloadHandler?.()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Unduh tabel jasa"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      expandedContent={
        <div className="flex min-h-[65vh] flex-col">
          <div className="min-h-0 flex-1">{tableContent}</div>
          <p className="mt-2 text-right text-[11px] text-slate-500">
            Sumber: {data.source ?? "-"}
          </p>
        </div>
      }
    >
      <div className="flex h-128 min-h-0 flex-col">
        <div className="min-h-0 flex-1">{tableContent}</div>
        <p className="mt-2 text-right text-[11px] text-slate-500">
          Sumber: {data.source ?? "-"}
        </p>
      </div>
    </ExpandableCard>
  );
}
