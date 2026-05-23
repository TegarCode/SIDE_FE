import { useRef, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { FiDownload } from "react-icons/fi";
import type { TooltipItem } from "chart.js";
import type { ChatSector } from "@/hooks/ChatBot/useChatbot";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

type BubbleChartProps = {
  dataset: Record<string, unknown>[];
  sector: ChatSector;
};

type ChartVariant = "bar" | "line" | "pie";

export default function BubbleChart({ dataset, sector }: BubbleChartProps) {
  const barChartRef = useRef<ChartJS<"bar", number[], string> | null>(null);
  const lineChartRef = useRef<ChartJS<"line", number[], string> | null>(null);
  const pieChartRef = useRef<ChartJS<"pie", number[], string> | null>(null);
  const [chartType, setChartType] = useState<ChartVariant>("bar");

  const isValidDataset = Array.isArray(dataset) && dataset.length > 0;

  const configBySector = {
    Perdagangan: {
      valueFields: ["Nilai"],
      labelFields: [
        "HsCode",
        "Tahun",
        "Kode_Alpha3_Partner",
        "Kode_Alpha3_Reporter"
      ]
    },
    Pariwisata: {
      valueFields: ["Jumlah_Wisatawan", "Total_Wisatawan"],
      labelFields: ["Tahun", "Kode_Alpha3_Asal", "Kode_Alpha3_Tujuan"]
    },
    Jasa: {
      valueFields: ["Jumlah", "Total_Jumlah"],
      labelFields: ["Tahun", "Jenis_Jasa", "Negara_Partner"]
    },
    Investasi: {
      valueFields: [
        "Nilai_Investasi",
        "Total_Investasi",
        "Total_Investasi_Outbound",
        "Total_Investasi_Inbound"
      ],
      labelFields: [
        "Tahun",
        "Kategori",
        "Kode_Alpha3_Tujuan",
        "Kode_Alpha3_Asal"
      ]
    },
    default: {
      valueFields: ["Nilai", "Jumlah"],
      labelFields: ["Tahun"]
    }
  } as const;

  const config = sector ? configBySector[sector] : configBySector.default;
  const firstRow = isValidDataset ? dataset[0] : null;

  const valueKey = firstRow
    ? (config.valueFields.find((key) => key in firstRow) ??
      Object.keys(firstRow).find((key) => {
        const value = firstRow[key];
        return (
          typeof value === "number" || /^\d[\d.,]*$/.test(String(value ?? ""))
        );
      }))
    : null;

  const labelKey = firstRow
    ? (config.labelFields.find((key) => key in firstRow) ?? null)
    : null;

  const dataPoints = valueKey
    ? dataset.map((row) =>
        parseFloat(
          String(row[valueKey] ?? "0")
            .replace(",", ".")
            .replace(/[^\d.-]/g, "")
        )
      )
    : [];

  const unitBySector = {
    Perdagangan: "(US$)",
    Pariwisata: "(Orang)",
    Jasa: "(Orang)",
    Investasi: "(Ribu US$)"
  } as const;

  const labels = labelKey
    ? dataset.map((row) => {
        if (labelKey === "HsCode") {
          return String(row.HsCode ?? "-");
        }

        const rawValue = row[labelKey];
        return typeof rawValue === "string" || typeof rawValue === "number"
          ? String(rawValue)
          : JSON.stringify(rawValue);
      })
    : [];

  const descriptions =
    labelKey === "HsCode"
      ? dataset.map((row) => String(row.hs_description ?? ""))
      : [];

  const backgroundColors = dataset.map((_, index) => {
    const palette = [
      "rgba(56, 74, 160, 0.8)",
      "rgba(14, 165, 233, 0.8)",
      "rgba(16, 185, 129, 0.8)",
      "rgba(245, 158, 11, 0.8)",
      "rgba(239, 68, 68, 0.8)"
    ];

    return palette[index % palette.length];
  });

  const borderColors = backgroundColors.map((color) =>
    color.replace("0.8", "1")
  );

  const chartData =
    valueKey && labelKey
      ? {
          labels,
          datasets: [
            {
              label:
                `${valueKey.replace(/_/g, " ")} ${sector ? (unitBySector[sector] ?? "") : ""}`.trim(),
              data: dataPoints,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
              descriptions
            }
          ]
        }
      : null;

  const getTooltipLabel = (label: string | undefined, raw: unknown) => {
    const datasetLabel = label ?? "Nilai";
    const value = Number(raw ?? 0).toLocaleString("id-ID");
    return `${datasetLabel}: ${value}`;
  };

  const getTooltipDescription = (dataset: unknown, dataIndex: number) => {
    const description = (dataset as { descriptions?: string[] }).descriptions?.[
      dataIndex
    ];
    return description ? `Deskripsi: ${description}` : undefined;
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) =>
            getTooltipLabel(context.dataset.label, context.raw),
          afterLabel: (context: TooltipItem<"bar">) =>
            getTooltipDescription(context.dataset, context.dataIndex)
        }
      }
    }
  };

  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"line">) =>
            getTooltipLabel(context.dataset.label, context.raw),
          afterLabel: (context: TooltipItem<"line">) =>
            getTooltipDescription(context.dataset, context.dataIndex)
        }
      }
    }
  };

  const pieChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"pie">) =>
            getTooltipLabel(context.dataset.label, context.raw),
          afterLabel: (context: TooltipItem<"pie">) =>
            getTooltipDescription(context.dataset, context.dataIndex)
        }
      }
    }
  };

  const downloadChart = () => {
    const chart =
      chartType === "line"
        ? lineChartRef.current
        : chartType === "pie"
          ? pieChartRef.current
          : barChartRef.current;
    if (!chart) {
      return;
    }

    const base64Image = chart.toBase64Image();
    const link = document.createElement("a");
    link.href = base64Image;
    link.download = `chart-${Date.now()}.png`;
    link.click();
  };

  if (!chartData) {
    return (
      <p className="mt-2 text-xs text-rose-500">
        Data tidak dapat divisualisasikan karena label atau nilai tidak
        ditemukan.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <select
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
          value={chartType}
          onChange={(event) => setChartType(event.target.value as ChartVariant)}
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="pie">Pie Chart</option>
        </select>

        <button
          type="button"
          onClick={downloadChart}
          className="inline-flex items-center gap-2 rounded-lg bg-[#384AA0] px-3 py-1 text-sm text-white transition hover:bg-[#253583]"
        >
          <FiDownload />
          Download
        </button>
      </div>

      {chartType === "line" ? (
        <Line ref={lineChartRef} data={chartData} options={lineChartOptions} />
      ) : chartType === "pie" ? (
        <Pie ref={pieChartRef} data={chartData} options={pieChartOptions} />
      ) : (
        <Bar ref={barChartRef} data={chartData} options={barChartOptions} />
      )}
    </div>
  );
}
