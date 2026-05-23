function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Gagal memuat visual untuk unduhan PNG."));
    image.src = src;
  });
}

type DownloadComposedPngOptions = {
  imageUrl: string;
  filename: string;
  title?: string;
  subtitle?: string;
  metaLines?: string[];
  legendItems?: Array<{
    label: string;
    color: string;
    disabled?: boolean;
  }>;
  footer?: string;
  backgroundColor?: string;
};

export async function downloadComposedPng({
  imageUrl,
  filename,
  title,
  subtitle,
  metaLines = [],
  legendItems = [],
  footer,
  backgroundColor = "#ffffff"
}: DownloadComposedPngOptions) {
  const image = await loadImage(imageUrl);
  const horizontalPadding = 24;
  const topPadding = 20;
  const bottomPadding = footer ? 20 : 16;
  const titleGap = title ? 24 : 0;
  const subtitleGap = subtitle ? 20 : 0;
  const filteredMetaLines = metaLines.filter(
    (line) => typeof line === "string" && line.trim().length > 0
  );
  const filteredLegendItems = legendItems.filter(
    (item) => item.label.trim().length > 0
  );
  const metaLineHeight = 18;
  const metaGap =
    filteredMetaLines.length > 0
      ? filteredMetaLines.length * metaLineHeight
      : 0;
  const legendRowHeight = 20;
  const legendMaxWidth = image.width;
  const legendFont = "400 12px Arial";
  const legendRows: Array<
    Array<{ label: string; color: string; disabled?: boolean; width: number }>
  > = [];
  if (filteredLegendItems.length > 0) {
    const measureCanvas = document.createElement("canvas");
    const measureContext = measureCanvas.getContext("2d");
    if (measureContext) {
      measureContext.font = legendFont;
      let currentRow: Array<{
        label: string;
        color: string;
        disabled?: boolean;
        width: number;
      }> = [];
      let currentWidth = 0;
      filteredLegendItems.forEach((item) => {
        const itemWidth =
          12 + 8 + measureContext.measureText(item.label).width + 18;
        if (
          currentRow.length > 0 &&
          currentWidth + itemWidth > legendMaxWidth
        ) {
          legendRows.push(currentRow);
          currentRow = [];
          currentWidth = 0;
        }
        currentRow.push({ ...item, width: itemWidth });
        currentWidth += itemWidth;
      });
      if (currentRow.length > 0) {
        legendRows.push(currentRow);
      }
    }
  }
  const legendGap =
    legendRows.length > 0 ? legendRows.length * legendRowHeight + 8 : 0;
  const footerGap = footer ? 22 : 0;
  const chartGapTop =
    title || subtitle || filteredMetaLines.length > 0 ? 12 : 0;

  const width = image.width + horizontalPadding * 2;
  const height =
    topPadding +
    titleGap +
    subtitleGap +
    metaGap +
    chartGapTop +
    image.height +
    legendGap +
    footerGap +
    bottomPadding;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context tidak tersedia untuk unduhan PNG.");
  }

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  let currentY = topPadding;

  if (title) {
    context.fillStyle = "#0f172a";
    context.font = "600 22px Arial";
    context.textBaseline = "top";
    context.fillText(title, horizontalPadding, currentY);
    currentY += titleGap;
  }

  if (subtitle) {
    context.fillStyle = "#64748b";
    context.font = "400 14px Arial";
    context.textBaseline = "top";
    context.fillText(subtitle, horizontalPadding, currentY);
    currentY += subtitleGap;
  }

  if (filteredMetaLines.length > 0) {
    context.fillStyle = "#475569";
    context.font = "400 13px Arial";
    context.textBaseline = "top";
    filteredMetaLines.forEach((line) => {
      context.fillText(line, horizontalPadding, currentY);
      currentY += metaLineHeight;
    });
  }

  if (chartGapTop) {
    currentY += chartGapTop;
  }

  context.drawImage(
    image,
    horizontalPadding,
    currentY,
    image.width,
    image.height
  );
  currentY += image.height;

  if (legendRows.length > 0) {
    currentY += 12;
    context.textBaseline = "middle";
    context.font = legendFont;
    legendRows.forEach((row) => {
      const rowWidth = row.reduce((sum, item) => sum + item.width, 0);
      let currentX =
        horizontalPadding + Math.max((image.width - rowWidth) / 2, 0);
      row.forEach((item) => {
        context.globalAlpha = item.disabled ? 0.4 : 1;
        context.fillStyle = item.color;
        context.beginPath();
        context.arc(currentX + 5, currentY + 8, 5, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = item.disabled ? "#94a3b8" : "#475569";
        context.fillText(item.label, currentX + 18, currentY + 8);
        if (item.disabled) {
          const textWidth = context.measureText(item.label).width;
          context.strokeStyle = "#94a3b8";
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(currentX + 18, currentY + 8);
          context.lineTo(currentX + 18 + textWidth, currentY + 8);
          context.stroke();
        }
        context.globalAlpha = 1;
        currentX += item.width;
      });
      currentY += legendRowHeight;
    });
    context.textBaseline = "top";
  }

  if (footer) {
    currentY += 8;
    context.fillStyle = "#64748b";
    context.font = "italic 12px Arial";
    context.textBaseline = "top";
    const footerWidth = context.measureText(footer).width;
    context.fillText(footer, width - horizontalPadding - footerWidth, currentY);
  }

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
