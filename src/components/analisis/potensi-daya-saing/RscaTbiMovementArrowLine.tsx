type Props = {
  x1?: number | string;
  y1?: number | string;
  x2?: number | string;
  y2?: number | string;
  stroke?: string;
  strokeOpacity?: number | string;
  strokeWidth?: number | string;
  className?: string;
  clipPath?: string;
};

function toFiniteNumber(value: number | string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function RscaTbiMovementArrowLine({
  x1,
  y1,
  x2,
  y2,
  stroke = "#384AA0",
  strokeOpacity = 0.72,
  strokeWidth = 1.4,
  className,
  clipPath
}: Props) {
  const startX = toFiniteNumber(x1);
  const startY = toFiniteNumber(y1);
  const endX = toFiniteNumber(x2);
  const endY = toFiniteNumber(y2);

  if (startX == null || startY == null || endX == null || endY == null) {
    return <g />;
  }

  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);

  if (length < 2) {
    return (
      <g className={className} clipPath={clipPath}>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={stroke}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  }

  const angle = Math.atan2(deltaY, deltaX);
  const arrowSize = 7;
  const arrowSpread = Math.PI / 7;
  const arrowX1 = endX - arrowSize * Math.cos(angle - arrowSpread);
  const arrowY1 = endY - arrowSize * Math.sin(angle - arrowSpread);
  const arrowX2 = endX - arrowSize * Math.cos(angle + arrowSpread);
  const arrowY2 = endY - arrowSize * Math.sin(angle + arrowSpread);
  const lineEndX = endX - 3 * Math.cos(angle);
  const lineEndY = endY - 3 * Math.sin(angle);

  return (
    <g className={className} clipPath={clipPath}>
      <line
        x1={startX}
        y1={startY}
        x2={lineEndX}
        y2={lineEndY}
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M${endX},${endY} L${arrowX1},${arrowY1} L${arrowX2},${arrowY2} Z`}
        fill={stroke}
        fillOpacity={strokeOpacity}
      />
    </g>
  );
}
