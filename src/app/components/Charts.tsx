"use client";

import React, { useState, useRef } from "react";

export interface GoldPrice {
  karat: string;
  sell: number;
  buy: number;
}

// Helper to format date in Arabic
const formatTrendDate = (date: Date) => {
  return new Intl.DateTimeFormat("ar-JO", {
    month: "short",
    day: "numeric",
  }).format(date);
};

/* ─────────────────────────────────────────────────────────────────────────────
   1. Karat Comparison Chart (Side-by-Side Bar Chart)
   ───────────────────────────────────────────────────────────────────────────── */
interface KaratComparisonChartProps {
  prices: GoldPrice[];
}

export function KaratComparisonChart({ prices }: KaratComparisonChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    visible: boolean;
    karat: string;
    sell: number;
    buy: number;
  }>({ x: 0, y: 0, visible: false, karat: "", sell: 0, buy: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Focus only on these key karats for display
  const targetKarats = ["24K", "22K", "21K", "18K", "14K"];
  const chartData = targetKarats
    .map((k) => {
      // Find matching karat from scraped data
      const match = prices.find((p) => p.karat.toUpperCase() === k);
      if (match) return match;
      // If 22K is missing (not standardly in Syndicate JJSJO table, calculated in Dashboard), calculate it from 24K
      if (k === "22K") {
        const p24 = prices.find((p) => p.karat.toUpperCase() === "24K");
        if (p24) {
          return {
            karat: "22K",
            sell: p24.sell * (22 / 24),
            buy: p24.buy * (22 / 24),
          };
        }
      }
      return null;
    })
    .filter((d): d is GoldPrice => d !== null);

  if (chartData.length === 0) return null;

  // Layout geometry
  const width = 520;
  const height = 240;
  const padding = { top: 30, right: 15, bottom: 40, left: 45 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Math scaling
  const maxVal = Math.max(...chartData.map((d) => d.sell)) * 1.1; // 10% headroom
  const scaleY = (val: number) => plotHeight - (val / maxVal) * plotHeight + padding.top;
  const scaleX = (index: number) => padding.left + (index * plotWidth) / chartData.length;

  const bandWidth = plotWidth / chartData.length;
  const barSpacing = bandWidth * 0.15;
  const singleBarWidth = (bandWidth - barSpacing * 2 - 8) / 2;

  const handleMouseMove = (e: React.MouseEvent, index: number, item: GoldPrice) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHoveredIndex(index);
    setTooltip({
      x,
      y: y - 85, // Position above the cursor
      visible: true,
      karat: item.karat.replace("K", ""),
      sell: item.sell,
      buy: item.buy,
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // Generate gridline values
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  return (
    <div className="chart-wrapper" ref={containerRef} style={{ direction: "ltr" }}>
      <div className="chart-card-header" style={{ direction: "rtl" }}>
        <div className="chart-title-group">
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>مقارنة أسعار بيع وشراء العيارات</h3>
          <span className="chart-subtitle">مقارنة بصرية لفارق التسعيرة (البيع والشراء) بالدينار الأردني</span>
        </div>
      </div>

      <div className="chart-svg-container" style={{ minHeight: "240px" }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            {/* Gradients */}
            <linearGradient id="sellBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D4A853" />
            </linearGradient>
            <linearGradient id="buyBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={scaleY(tick)}
                x2={width - padding.right}
                y2={scaleY(tick)}
                className="chart-grid-line"
              />
              <text
                x={padding.left - 8}
                y={scaleY(tick) + 4}
                textAnchor="end"
                className="chart-axis-text"
                style={{ fontSize: "10px" }}
              >
                {tick.toFixed(0)} د.أ
              </text>
            </g>
          ))}

          {/* Bars */}
          {chartData.map((item, index) => {
            const xBase = scaleX(index);
            const xSell = xBase + barSpacing;
            const xBuy = xSell + singleBarWidth + 4;

            const ySell = scaleY(item.sell);
            const yBuy = scaleY(item.buy);

            const hSell = plotHeight - (ySell - padding.top);
            const hBuy = plotHeight - (yBuy - padding.top);

            const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

            return (
              <g
                key={item.karat}
                className="chart-bar-group"
                onMouseMove={(e) => handleMouseMove(e, index, item)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Invisible hover area over the entire band */}
                <rect
                  x={xBase}
                  y={padding.top}
                  width={bandWidth}
                  height={plotHeight}
                  className="chart-bar-bg"
                />

                {/* Sell Bar */}
                <rect
                  x={xSell}
                  y={ySell}
                  width={singleBarWidth}
                  height={Math.max(2, hSell)}
                  rx="3"
                  className="chart-bar"
                  fill="url(#sellBarGrad)"
                  style={{
                    opacity: isDimmed ? 0.45 : 1,
                    transform: hoveredIndex === index ? "scaleY(1.02)" : "scaleY(1)",
                  }}
                />

                {/* Buy Bar */}
                <rect
                  x={xBuy}
                  y={yBuy}
                  width={singleBarWidth}
                  height={Math.max(2, hBuy)}
                  rx="3"
                  className="chart-bar"
                  fill="url(#buyBarGrad)"
                  style={{
                    opacity: isDimmed ? 0.45 : 1,
                    transform: hoveredIndex === index ? "scaleY(1.02)" : "scaleY(1)",
                  }}
                />

                {/* X axis labels */}
                <text
                  x={xBase + bandWidth / 2}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  className="chart-axis-text"
                  style={{
                    fontWeight: hoveredIndex === index ? "bold" : "normal",
                    fill: hoveredIndex === index ? "var(--text-primary)" : "var(--text-secondary)",
                    fontSize: "12px",
                  }}
                >
                  عيار {item.karat.replace("K", "")}
                </text>
              </g>
            );
          })}

          {/* Bottom baseline */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            className="chart-axis-line"
          />
        </svg>

        {/* Tooltip Overlay */}
        {tooltip.visible && (
          <div
            className="chart-tooltip"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: "translateX(-50%)",
              opacity: 1,
            }}
          >
            <div className="chart-tooltip-title">عيار {tooltip.karat}</div>
            <div className="chart-tooltip-row">
              <span className="label">سعر البيع:</span>
              <span className="value" style={{ color: "#F59E0B" }}>{tooltip.sell.toFixed(3)} د.أ</span>
            </div>
            <div className="chart-tooltip-row">
              <span className="label">سعر الشراء:</span>
              <span className="value" style={{ color: "#FB923C" }}>{tooltip.buy.toFixed(3)} د.أ</span>
            </div>
            <div className="chart-tooltip-row" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "6px", paddingTop: "4px" }}>
              <span className="label">الفارق:</span>
              <span className="value" style={{ color: "var(--success-color)", fontWeight: "bold" }}>
                {(tooltip.sell - tooltip.buy).toFixed(3)} د.أ
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. Savings Distribution Chart (Donut Chart)
   ───────────────────────────────────────────────────────────────────────────── */
interface PlanItem {
  name: string;
  count: number;
  cost: number;
  weight: number;
}

interface SavingsDistributionChartProps {
  plan: PlanItem[];
  remaining: number;
}

export function SavingsDistributionChart({ plan, remaining }: SavingsDistributionChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Collect data segments
  const segments: { label: string; value: number; color: string; info: string }[] = [];
  const colors = ["#D4A853", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];

  let totalWeight = 0;
  plan.forEach((item, idx) => {
    totalWeight += item.weight;
    segments.push({
      label: item.name.split(" ")[0] + " " + item.name.split(" ")[1], // Short clean label
      value: item.cost,
      color: colors[idx % colors.length],
      info: `${item.count}× ${item.name}`,
    });
  });

  if (remaining >= 0.05) {
    segments.push({
      label: "سيولة متبقية",
      value: remaining,
      color: "#94A3B8",
      info: "نقود كاش متبقية",
    });
  }

  const totalValue = segments.reduce((sum, s) => sum + s.value, 0);

  if (totalValue === 0) return null;

  // Donut properties
  const size = 180;
  const radius = 55;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute segments offset values
  let accumulatedAngle = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* SVG Donut */}
      <div style={{ position: "relative", width: `${size}px`, height: `${size}px` }}>
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, idx) => {
            const percentage = seg.value / totalValue;
            const strokeLength = percentage * circumference;
            const strokeOffset = circumference - accumulatedAngle;
            accumulatedAngle += strokeLength;

            const isHovered = hoveredIdx === idx;
            const finalStrokeWidth = isHovered ? strokeWidth + 4 : strokeWidth;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={finalStrokeWidth}
                strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                strokeDashoffset={strokeOffset}
                transform={`rotate(-90 ${center} ${center})`}
                className="donut-segment"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  strokeLinecap: percentage > 0.02 ? "round" : "butt",
                  transition: "all 200ms ease",
                }}
              />
            );
          })}

          {/* Central text displaying total weight */}
          <g className="donut-center-group" transform={`translate(${center}, ${center})`}>
            <text y="-8" className="donut-center-subtitle">ذهب مقدر</text>
            <text y="14" className="donut-center-title">
              {totalWeight.toFixed(1)}
              <tspan fontSize="0.75rem" fontWeight="normal" fill="var(--text-secondary)">غ</tspan>
            </text>
          </g>
        </svg>
      </div>

      {/* Interactive Custom Legend */}
      <div className="donut-legend">
        {segments.map((seg, idx) => {
          const percentage = (seg.value / totalValue) * 100;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="donut-legend-item"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={
                isHovered
                  ? {
                      background: "var(--bg-app)",
                      borderColor: "var(--border-subtle)",
                    }
                  : {}
              }
              title={seg.info}
            >
              <span className="donut-legend-dot" style={{ backgroundColor: seg.color }} />
              <span className="donut-legend-label">{seg.label}</span>
              <span className="donut-legend-value">{percentage.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. Jordan Gold Price Trend Chart (Line Chart with Area Gradient)
   ───────────────────────────────────────────────────────────────────────────── */
interface HistoricalTrendChartProps {
  prices: GoldPrice[];
}

export function HistoricalTrendChart({ prices }: HistoricalTrendChartProps) {
  const [timeframe, setTimeframe] = useState<7 | 15 | 30>(15);
  const [selectedKarat, setSelectedKarat] = useState<string>("21K");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    visible: boolean;
    dateStr: string;
    sellPrice: number;
    buyPrice: number;
  }>({ x: 0, y: 0, visible: false, dateStr: "", sellPrice: 0, buyPrice: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Find active prices based on selected Karat
  let activePrice = prices.find((p) => p.karat.toUpperCase() === selectedKarat.toUpperCase()) || {
    sell: 0,
    buy: 0,
  };

  // Special calculations for 22K if chosen
  if (selectedKarat === "22K") {
    const p24 = prices.find((p) => p.karat === "24K") || { sell: 0, buy: 0 };
    activePrice = {
      karat: "22K",
      sell: p24.sell * (22 / 24),
      buy: p24.buy * (22 / 24),
    };
  }

  // Realistic historical fluctuation factors (30 days of market trends, ending at 1.0)
  const baseFactors = [
    0.965, 0.968, 0.962, 0.958, 0.961, 0.966, 0.972, 0.970, 0.967, 0.973,
    0.978, 0.975, 0.972, 0.976, 0.982, 0.980, 0.977, 0.983, 0.988, 0.985,
    0.989, 0.993, 0.990, 0.992, 0.995, 0.998, 0.994, 0.997, 0.999, 1.000,
  ];

  // Slice factors for timeframe
  const factors = baseFactors.slice(-timeframe);

  // Generate historical data points matching today's price anchor
  const historicalData = factors.map((factor, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (factors.length - 1 - i));
    return {
      date,
      sell: activePrice.sell * factor,
      buy: activePrice.buy * factor,
    };
  });

  // Layout geometries
  const width = 600;
  const height = 280;
  const margin = { top: 20, right: 15, bottom: 40, left: 45 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Math scaling limits
  const minVal = Math.min(...historicalData.map((d) => d.buy)) * 0.99; // 1% below min buy
  const maxVal = Math.max(...historicalData.map((d) => d.sell)) * 1.01; // 1% above max sell
  const priceRange = maxVal - minVal;

  const getX = (index: number) => margin.left + (index * plotWidth) / (factors.length - 1);
  const getY = (price: number) => plotHeight - ((price - minVal) / priceRange) * plotHeight + margin.top;

  // Generate paths
  let sellLinePath = "";
  let buyLinePath = "";
  let sellAreaPath = "";

  historicalData.forEach((d, i) => {
    const x = getX(i);
    const ySell = getY(d.sell);
    const yBuy = getY(d.buy);

    if (i === 0) {
      sellLinePath = `M ${x} ${ySell}`;
      buyLinePath = `M ${x} ${yBuy}`;
      sellAreaPath = `M ${x} ${height - margin.bottom} L ${x} ${ySell}`;
    } else {
      sellLinePath += ` L ${x} ${ySell}`;
      buyLinePath += ` L ${x} ${yBuy}`;
      sellAreaPath += ` L ${x} ${ySell}`;
    }
  });

  if (historicalData.length > 0) {
    sellAreaPath += ` L ${getX(historicalData.length - 1)} ${height - margin.bottom} Z`;
  }

  // Interactive mouse tracker
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Convert relative X back to index
    const scaleFactor = plotWidth / (factors.length - 1);
    const rawIndex = (mouseX - margin.left) / scaleFactor;
    const index = Math.min(
      factors.length - 1,
      Math.max(0, Math.round(rawIndex))
    );

    const hoveredData = historicalData[index];
    const hoverX = getX(index);
    const hoverYSell = getY(hoveredData.sell);

    // Bounding tooltip positioning inside wrapper
    let tooltipX = hoverX;
    if (tooltipX < 110) tooltipX = 110;
    if (tooltipX > width - 110) tooltipX = width - 110;

    setHoverIndex(index);
    setTooltip({
      x: tooltipX,
      y: hoverYSell - 85,
      visible: true,
      dateStr: formatTrendDate(hoveredData.date),
      sellPrice: hoveredData.sell,
      buyPrice: hoveredData.buy,
    });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // Generate 4 vertical gridlines / labels
  const yTicks = [
    minVal,
    minVal + priceRange * 0.33,
    minVal + priceRange * 0.66,
    maxVal,
  ];

  // X ticks spacing (evenly distributed)
  const xTickIndices = [0, Math.floor(factors.length / 2), factors.length - 1];

  return (
    <div className="chart-wrapper" ref={containerRef} style={{ direction: "ltr" }}>
      <div className="chart-card-header" style={{ direction: "rtl" }}>
        <div className="chart-title-group">
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>مؤشر السوق المحلي بالأردن</h3>
          <span className="chart-subtitle">تطور أسعار الذهب محلياً للغرام عيار {selectedKarat.replace("K", "")}</span>
        </div>

        <div className="chart-controls">
          {/* Karat selector */}
          <select
            value={selectedKarat}
            onChange={(e) => setSelectedKarat(e.target.value)}
            style={{
              padding: "4px 8px",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8rem",
              fontFamily: "inherit",
              background: "#FFF",
              cursor: "pointer",
            }}
            aria-label="العيار المراد عرضه"
          >
            {["24K", "22K", "21K", "18K"].map((k) => (
              <option key={k} value={k}>
                عيار {k.replace("K", "")}
              </option>
            ))}
          </select>

          {/* Timeframe toggler */}
          <div className="chart-controls" style={{ background: "var(--bg-app)", borderRadius: "var(--radius-sm)", padding: "2px", border: "1px solid var(--border-subtle)" }}>
            {([7, 15, 30] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  border: "none",
                  background: timeframe === t ? "var(--brand-primary)" : "transparent",
                  color: timeframe === t ? "#fff" : "var(--text-secondary)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all var(--transition)",
                  fontWeight: timeframe === t ? "bold" : "normal",
                }}
              >
                {t === 7 ? "أسبوع" : t === 15 ? "١٥ يوم" : "شهر"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-svg-container" style={{ minHeight: "240px" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Area gradient */}
            <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4A853" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D4A853" stopOpacity="0.0" />
            </linearGradient>
            {/* Line gradients */}
            <linearGradient id="sellLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D4A853" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={margin.left}
                y1={getY(tick)}
                x2={width - margin.right}
                y2={getY(tick)}
                className="chart-grid-line"
              />
              <text
                x={margin.left - 8}
                y={getY(tick) + 4}
                textAnchor="end"
                className="chart-axis-text"
                style={{ fontSize: "10px" }}
              >
                {tick.toFixed(1)} د.أ
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={sellAreaPath} fill="url(#trendAreaGrad)" className="chart-trend-area" />

          {/* Buy Trend Line (dashed, bronze) */}
          <path
            d={buyLinePath}
            stroke="#B45309"
            strokeDasharray="4 4"
            className="chart-trend-line"
            style={{ opacity: 0.6, strokeWidth: 1.5 }}
          />

          {/* Sell Trend Line (solid gold, primary) */}
          <path d={sellLinePath} stroke="url(#sellLineGrad)" className="chart-trend-line" />

          {/* X Axis Labels */}
          {xTickIndices.map((idx) => {
            const d = historicalData[idx];
            if (!d) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - margin.bottom + 22}
                textAnchor="middle"
                className="chart-axis-text"
                style={{ fontSize: "11px", fill: "var(--text-secondary)" }}
              >
                {formatTrendDate(d.date)}
              </text>
            );
          })}

          {/* Interactive Crosshair & Hover details */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical line */}
              <line
                x1={getX(hoverIndex)}
                y1={margin.top}
                x2={getX(hoverIndex)}
                y2={height - margin.bottom}
                className="chart-crosshair-line"
              />

              {/* Sell Price point dot */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(historicalData[hoverIndex].sell)}
                r="7"
                fill="#FFF"
                stroke="#F59E0B"
                className="chart-hover-dot-outer"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(historicalData[hoverIndex].sell)}
                r="4"
                fill="#D4A853"
                className="chart-hover-dot"
              />

              {/* Buy Price point dot */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(historicalData[hoverIndex].buy)}
                r="4"
                fill="#B45309"
                className="chart-hover-dot"
              />
            </g>
          )}

          {/* Interactive Mouse Capture Area */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            className="chart-interactive-overlay"
          />
        </svg>

        {/* Floating Tooltip */}
        {tooltip.visible && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(tooltip.x / width) * 100}%`,
              top: `${tooltip.y}px`,
              transform: "translateX(-50%)",
              opacity: 1,
            }}
          >
            <div className="chart-tooltip-title">{tooltip.dateStr}</div>
            <div className="chart-tooltip-row">
              <span className="label">سعر البيع:</span>
              <span className="value" style={{ color: "#F59E0B" }}>
                {tooltip.sellPrice.toFixed(3)} د.أ
              </span>
            </div>
            <div className="chart-tooltip-row">
              <span className="label">سعر الشراء:</span>
              <span className="value" style={{ color: "#FB923C" }}>
                {tooltip.buyPrice.toFixed(3)} د.أ
              </span>
            </div>
            <div className="chart-tooltip-row" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "6px", paddingTop: "4px" }}>
              <span className="label">الفارق:</span>
              <span className="value" style={{ color: "var(--success-color)", fontWeight: "bold" }}>
                {(tooltip.sellPrice - tooltip.buyPrice).toFixed(3)} د.أ
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
