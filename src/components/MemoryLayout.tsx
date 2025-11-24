const COLORS = {
  red: { box: "fill-red-900/50 stroke-red-600", text: "fill-red-300" },
  blue: { box: "fill-blue-900/50 stroke-blue-700", text: "fill-blue-300" },
  green: { box: "fill-green-900/50 stroke-green-700", text: "fill-green-300" },
  gray: { box: "fill-slate-800/50 stroke-slate-600", text: "fill-slate-300" },
  cyan: { box: "fill-cyan-900/50 stroke-cyan-700", text: "fill-cyan-300" },
  purple: {
    box: "fill-purple-900/50 stroke-purple-700",
    text: "fill-purple-300",
  },
};

// Memory layout configuration - percentages for SVG
const MEMORY_LAYOUT = {
  chartHeight: 56,
  barHeight: 40,
  rowSpacing: 16,
  // Width percentages
  ipc: 0.35,
  kernel: 0.1,
  conflict: 0.05,
  reserved: 0.2,
  user: 0.25,
  segments: [
    {
      id: "ipc",
      label: "IPC Message buffer",
      range: "0x0-0x100",
      boxClass: COLORS.cyan.box,
      textClass: COLORS.cyan.text,
    },
    {
      id: "kernel",
      label: "Kernel",
      range: "0x100-0x108",
      boxClass: COLORS.blue.box,
      textClass: COLORS.blue.text,
      tooltip: "Various fields written by the kernel",
    },
    {
      id: "conflict",
      label: "New!",
      boxClass: COLORS.purple.box,
      textClass: COLORS.purple.text,
      tooltip: "0x108-0x110: Added in 21.0.0 (CPU Time)",
    },
    {
      id: "reserved",
      label: "Reserved",
      range: "0x110-0x180",
      boxClass: COLORS.gray.box,
      textClass: COLORS.gray.text,
    },
    {
      id: "user",
      label: "User TLS",
      range: "0x180-0x200",
      boxClass: COLORS.green.box,
      textClass: COLORS.green.text,
    },
  ],
} as const;

// Generate background path (fill only, no stroke)
const backgroundPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  topLeft: boolean,
  topRight: boolean,
  bottomRight: boolean,
  bottomLeft: boolean,
): string => {
  const tl = topLeft ? radius : 0;
  const tr = topRight ? radius : 0;
  const br = bottomRight ? radius : 0;
  const bl = bottomLeft ? radius : 0;

  return `M ${x + tl} ${y}
            L ${x + width - tr} ${y}
            ${tr > 0 ? `Q ${x + width} ${y} ${x + width} ${y + tr}` : `L ${x + width} ${y}`}
            L ${x + width} ${y + height - br}
            ${br > 0 ? `Q ${x + width} ${y + height} ${x + width - br} ${y + height}` : `L ${x + width} ${y + height}`}
            L ${x + bl} ${y + height}
            ${bl > 0 ? `Q ${x} ${y + height} ${x} ${y + height - bl}` : `L ${x} ${y + height}`}
            L ${x} ${y + tl}
            ${tl > 0 ? `Q ${x} ${y} ${x + tl} ${y}` : `L ${x} ${y}`}
            Z`;
};

// Generate stroke path (no inner strokes between segments)
// Case 1: leftmost segment - start at top right, go left, rounded corner, go down, rounded corner, go right
// Case 2: inner segment - two horizontal lines (top and bottom)
// Case 3: rightmost segment - start at top left, go right, rounded corner, go down, rounded corner, go left
const strokePath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  isFirst: boolean,
  isLast: boolean,
): string => {
  if (isFirst) {
    // Leftmost segment: start at top right, go left, rounded corner, go down, rounded corner, go right
    return `M ${x + width} ${y}
            L ${x + radius} ${y}
            Q ${x} ${y} ${x} ${y + radius}
            L ${x} ${y + height - radius}
            Q ${x} ${y + height} ${x + radius} ${y + height}
            L ${x + width} ${y + height}`;
  } else if (isLast) {
    // Rightmost segment: start at top left, go right, rounded corner, go down, rounded corner, go left
    return `M ${x} ${y}
            L ${x + width - radius} ${y}
            Q ${x + width} ${y} ${x + width} ${y + radius}
            L ${x + width} ${y + height - radius}
            Q ${x + width} ${y + height} ${x + width - radius} ${y + height}
            L ${x} ${y + height}`;
  } else {
    // Inner segment: two horizontal lines (top and bottom)
    return `M ${x} ${y}
            L ${x + width} ${y}
            M ${x} ${y + height}
            L ${x + width} ${y + height}`;
  }
};

export function MemoryLayout() {
  const { chartHeight, barHeight, rowSpacing, segments } = MEMORY_LAYOUT;
  const { ipc, kernel, conflict, reserved } = MEMORY_LAYOUT;

  // Calculate absolute positions for 5 segments
  const x0 = 0;
  const x1 = ipc; // 0x100
  const x2 = ipc + kernel; // 0x110
  const x3 = ipc + kernel + conflict; // 0x110 (conflict overlaps)
  const x4 = ipc + kernel + conflict + reserved; // 0x180
  const x5 = 1; // 0x200

  // SVG viewBox dimensions (will scale to container width)
  const svgWidth = 800;
  // Remove labelHeight from calculation since we're integrating labels into bars
  const svgHeight = chartHeight + rowSpacing + barHeight + rowSpacing + barHeight;

  // Padding to prevent stroke clipping at edges
  const padding = 1;
  const viewBoxWidth = svgWidth + padding * 2;
  const viewBoxHeight = svgHeight + padding * 2;

  // Helper to convert percentage to pixel (with padding offset)
  const px = (percent: number) => percent * svgWidth + padding;

  // Calculate segment width based on index (supports 5 segments)
  const getSegmentWidth = (index: number): number => {
    if (index === 0) return px(x1) - px(x0);
    if (index === 1) return px(x2) - px(x1);
    if (index === 2) return px(x3) - px(x2);
    if (index === 3) return px(x4) - px(x3);
    return px(x5) - px(x4);
  };

  // Calculate segment start position based on index (supports 5 segments)
  const getSegmentStart = (index: number): number => {
    if (index === 0) return px(x0);
    if (index === 1) return px(x1);
    if (index === 2) return px(x2);
    if (index === 3) return px(x3);
    return px(x4);
  };

  return (
    <div className="space-y-6 not-prose font-sans text-xs mt-6 select-none">
      {/* Header */}
      <div className="space-y-2">
        <div className="text-switch-text-info font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-switch-text-info"></span>
          <span>ThreadLocalRegion Memory Layout (non-linear, for visual reference only)</span>
        </div>

        {/* SVG Chart - Seamless, maintains aspect ratio */}
        <div className="w-full bg-switch-surface-1" style={{ aspectRatio: viewBoxWidth / viewBoxHeight }}>
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="w-full h-full block"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: "block" }}
          >
            {/* Main Memory Layout Chart */}
            <g id="main-chart">
              {/* Background segments */}
              {segments.map((segment, index) => {
                const xStart = getSegmentStart(index);
                const width = getSegmentWidth(index);
                const isFirst = index === 0;
                const isLast = index === segments.length - 1;
                const borderRadius = 4;

                // Extract fill and stroke classes
                const classes = segment.boxClass.split(" ");
                const fillClass = classes.find((c) => c.startsWith("fill-")) || "";
                const strokeClass = classes.find((c) => c.startsWith("stroke-")) || "";

                return (
                  <g key={segment.id}>
                    {/* Background (fill only) */}
                    {isFirst || isLast ? (
                      <path
                        d={backgroundPath(
                          xStart,
                          padding,
                          width,
                          chartHeight,
                          borderRadius,
                          isFirst, // topLeft
                          isLast, // topRight
                          isLast, // bottomRight
                          isFirst, // bottomLeft
                        )}
                        className={fillClass}
                        fillRule="evenodd"
                      />
                    ) : (
                      <rect x={xStart} y={padding} width={width} height={chartHeight} className={fillClass} />
                    )}

                    {/* Stroke (no inner strokes) */}
                    <path
                      d={strokePath(xStart, padding, width, chartHeight, borderRadius, isFirst, isLast)}
                      className={strokeClass}
                      fill="none"
                      strokeWidth={1}
                    />

                    {segment.id === "conflict" ? (
                      <text
                        x={xStart + width / 2}
                        y={padding + chartHeight / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={segment.textClass}
                        fontSize="9"
                        fontWeight="bold"
                        transform={`rotate(-90 ${xStart + width / 2} ${padding + chartHeight / 2})`}
                      >
                        {segment.label}
                      </text>
                    ) : (
                      <>
                        <text
                          x={xStart + width / 2}
                          y={padding + chartHeight / 2 - 6}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={segment.textClass}
                          fontSize="11"
                          fontWeight="bold"
                        >
                          {segment.label}
                        </text>
                        <text
                          x={xStart + width / 2}
                          y={padding + chartHeight / 2 + 6}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={segment.textClass}
                          fontSize="9"
                          opacity={0.6}
                        >
                          {segment.range}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Vertical Guide Lines */}
            <g id="guide-lines" strokeDasharray="4,4" opacity={0.4}>
              <line
                x1={px(x1)}
                y1={padding + chartHeight}
                x2={px(x1)}
                y2={padding + svgHeight}
                stroke="currentColor"
                className="text-switch-border"
                strokeWidth={1}
              />
              <line
                x1={px(x2)}
                y1={padding + chartHeight}
                x2={px(x2)}
                y2={padding + svgHeight}
                stroke="currentColor"
                className="text-switch-border"
                strokeWidth={1}
              />
              <line
                x1={px(x3)}
                y1={padding + chartHeight}
                x2={px(x3)}
                y2={padding + svgHeight}
                stroke="rgb(239 68 68)"
                strokeWidth={1}
                opacity={0.3}
              />
              <line
                x1={px(x4)}
                y1={padding + chartHeight}
                x2={px(x4)}
                y2={padding + svgHeight}
                stroke="currentColor"
                className="text-switch-border"
                strokeWidth={1}
              />
            </g>

            <g id="comparison-rows">
              <g id="old-libnx">
                <rect
                  x={px(x2)}
                  y={padding + chartHeight + rowSpacing}
                  width={px(x5) - px(x2)}
                  height={barHeight}
                  className={COLORS.red.box}
                  strokeWidth={1}
                  rx={4}
                />
                <text
                  x={px(x2 + (x5 - x2) / 2)}
                  y={padding + chartHeight + rowSpacing + barHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={COLORS.red.text}
                  fontSize="10"
                  fontWeight="600"
                >
                  libnx before v4.10.0
                </text>
              </g>

              <g id="new-libnx">
                <rect
                  x={px(x4)}
                  y={padding + chartHeight + rowSpacing + barHeight + rowSpacing}
                  width={px(x5) - px(x4)}
                  height={barHeight}
                  className={COLORS.green.box}
                  strokeWidth={1}
                  rx={4}
                />
                <text
                  x={px(x4 + (x5 - x4) / 2)}
                  y={padding + chartHeight + rowSpacing + barHeight + rowSpacing + barHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={COLORS.green.text}
                  fontSize="10"
                  fontWeight="600"
                >
                  New libnx / Patched / Official software
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
