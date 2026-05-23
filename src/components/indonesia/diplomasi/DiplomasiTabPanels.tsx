import { InvestasiMasukTab } from "@/components/indonesia/diplomasi/tabs/InvestasiMasukTab";
import { NeracaPerdaganganTab } from "@/components/indonesia/diplomasi/tabs/NeracaPerdaganganTab";
import { NilaiPerdaganganTab } from "@/components/indonesia/diplomasi/tabs/NilaiPerdaganganTab";
import { TotalEksporTab } from "@/components/indonesia/diplomasi/tabs/TotalEksporTab";
import { TotalImporTab } from "@/components/indonesia/diplomasi/tabs/TotalImporTab";
import { TurisMasukTab } from "@/components/indonesia/diplomasi/tabs/TurisMasukTab";
import type {
  DiplomasiOverviewData,
  DiplomasiTabSlug
} from "@/type/indonesiaDiplomasi";

type DiplomasiTabPanelsProps = {
  tab: DiplomasiTabSlug;
  overview: DiplomasiOverviewData | null;
  loading: boolean;
  error: string | null;
  periodLabel: string;
};

export function DiplomasiTabPanels({
  tab,
  overview,
  loading,
  error,
  periodLabel
}: DiplomasiTabPanelsProps) {
  if (tab === "nilai_perdagangan") {
    return (
      <NilaiPerdaganganTab
        overview={overview}
        loading={loading}
        error={error}
        periodLabel={periodLabel}
      />
    );
  }

  if (tab === "total_ekspor") {
    return (
      <TotalEksporTab
        overview={overview}
        loading={loading}
        error={error}
        periodLabel={periodLabel}
      />
    );
  }

  if (tab === "total_impor") {
    return (
      <TotalImporTab
        overview={overview}
        loading={loading}
        error={error}
        periodLabel={periodLabel}
      />
    );
  }

  if (tab === "neraca_perdagangan") {
    return (
      <NeracaPerdaganganTab
        overview={overview}
        loading={loading}
        error={error}
        periodLabel={periodLabel}
      />
    );
  }

  if (tab === "investasi_masuk") {
    return (
      <InvestasiMasukTab
        overview={overview}
        loading={loading}
        error={error}
        periodLabel={periodLabel}
      />
    );
  }

  return (
    <TurisMasukTab
      overview={overview}
      loading={loading}
      error={error}
      periodLabel={periodLabel}
    />
  );
}
