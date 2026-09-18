import React, { useMemo } from "react";
import {
  LuDollarSign,
  LuCar,
  LuGauge,
  LuStar,
  LuTrendingUp,
  LuChartColumn,
} from "react-icons/lu";
import { usePreferences } from "../../context/PreferencesContext";
import {
  mockVehicles,
  mockMotorbikes,
  mockBicycles,
} from "../../services/vehicleServices";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CHART_WIDTH = 560;
const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 20, bottom: 30, left: 50 };

function buildMonthlyRevenue(vehicles) {
  const totals = new Array(12).fill(0);
  vehicles.forEach((v) => {
    const d = new Date(v.created_at);
    const month = d.getMonth();
    totals[month] += v.price_per_day * 30;
  });
  for (let i = 1; i < totals.length; i++) {
    totals[i] += totals[i - 1] * 0.3;
  }
  return totals.map((v) => Math.round(v));
}

function MonthlyRevenueChart({ data, isDark }) {
  const max = Math.max(...data, 1);
  const plotW = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const step = plotW / (data.length - 1);

  const points = data.map((val, i) => {
    const x = CHART_PADDING.left + i * step;
    const y = CHART_PADDING.top + plotH - (val / max) * plotH;
    return `${x},${y}`;
  });
  const linePath = `M${points.join(" L")}`;

  const areaPath = `${linePath} L${CHART_PADDING.left + plotW},${CHART_PADDING.top + plotH} L${CHART_PADDING.left},${CHART_PADDING.top + plotH} Z`;

  const gridLines = 4;
  const gridColor = isDark ? "rgba(148,163,184,0.15)" : "rgba(148,163,184,0.25)";
  const textColor = isDark ? "#94a3b8" : "#94a3b8";

  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full h-auto">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = CHART_PADDING.top + (plotH / gridLines) * i;
        const val = Math.round(max - (max / gridLines) * i);
        return (
          <g key={i}>
            <line
              x1={CHART_PADDING.left}
              y1={y}
              x2={CHART_WIDTH - CHART_PADDING.right}
              y2={y}
              stroke={gridColor}
              strokeWidth="1"
            />
            <text
              x={CHART_PADDING.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill={textColor}
            >
              {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
            </text>
          </g>
        );
      })}

      {MONTHS.map((m, i) => {
        const x = CHART_PADDING.left + i * step;
        return (
          <text
            key={m}
            x={x}
            y={CHART_HEIGHT - 6}
            textAnchor="middle"
            fontSize="10"
            fill={textColor}
          >
            {m}
          </text>
        );
      })}

      <path d={areaPath} fill="url(#areaGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((val, i) => {
        const x = CHART_PADDING.left + i * step;
        const y = CHART_PADDING.top + plotH - (val / max) * plotH;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3.5"
            fill="#fff"
            stroke="#2563eb"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

const CATEGORY_COLORS = ["#2563eb", "#f59e0b", "#10b981"];

const DEFAULT_FLEET = [...mockVehicles, ...mockMotorbikes, ...mockBicycles];

function CategoryDonut({ segments, isDark }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = 50;
  const cx = 65;
  const cy = 65;
  const circumference = 2 * Math.PI * radius;

  const strokeColor = isDark ? "#1e293b" : "#ffffff";

  const arcs = segments.reduce(
    (acc, seg) => {
      const pct = seg.value / total;
      const dashLen = pct * circumference;
      const dashOff = (acc.offset / total) * circumference;
      acc.list.push({ ...seg, dashLen, dashOff });
      acc.offset += seg.value;
      return acc;
    },
    { offset: 0, list: [] }
  ).list;

  return (
    <svg viewBox="0 0 130 130" className="w-full max-w-[140px] h-auto">
      {arcs.map((seg, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
          strokeWidth="22"
          strokeDasharray={`${seg.dashLen} ${circumference - seg.dashLen}`}
          strokeDashoffset={-seg.dashOff}
          strokeLinecap="butt"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      ))}
      <circle cx={cx} cy={cy} r={38} fill={strokeColor} />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill={isDark ? "#f1f5f9" : "#0f172a"}>
        {total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill={isDark ? "#94a3b8" : "#64748b"}>
        vehicles
      </text>
    </svg>
  );
}

function KpiCard({ label, value, icon: Icon, accent, trend }) {
  return (
    <div className="rounded-2xl border border-borderColor bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <span
          className={`grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm ${accent}`}
        >
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
        {value}
      </p>
      {trend && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-500">
          <LuTrendingUp size={12} />
          {trend}
        </p>
      )}
    </div>
  );
}

const Analytics = ({ vehicles: allVehicles = [] }) => {
  const { formatPrice } = usePreferences();
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const vehicles = useMemo(
    () => (allVehicles.length ? allVehicles : DEFAULT_FLEET),
    [allVehicles]
  );

  const { totalRevenue, activeRentals, utilizationRate, avgRating, monthlyRevenue, categoryBreakdown } =
    useMemo(() => {
      const totalVehicles = vehicles.length;
      const available = vehicles.filter((v) => v.is_available).length;
      const utilization = totalVehicles
        ? Math.round((available / totalVehicles) * 100)
        : 0;

      const revenue = vehicles.reduce(
        (sum, v) => sum + v.price_per_day * 30,
        0
      );

      const cats = { Cars: 0, Motorbikes: 0, Bicycles: 0 };
      vehicles.forEach((v) => {
        const cat = String(v.category || "").toLowerCase();
        if (["scooter", "underbone", "touring", "sportbike", "cruiser"].some((c) => cat.includes(c))) {
          cats.Motorbikes++;
        } else if (cat.includes("bike") || cat.includes("e-bike")) {
          cats.Bicycles++;
        } else {
          cats.Cars++;
        }
      });

      return {
        totalRevenue: revenue,
        activeRentals: Math.round(available * 0.65),
        utilizationRate: utilization,
        avgRating: "4.6",
        monthlyRevenue: buildMonthlyRevenue(vehicles),
        categoryBreakdown: cats,
      };
    }, [vehicles]);

  const kpis = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: LuDollarSign,
      accent: "bg-emerald-500",
      trend: "+12.5% vs last month",
    },
    {
      label: "Active Rentals",
      value: activeRentals,
      icon: LuCar,
      accent: "bg-blue-500",
      trend: "+3 this week",
    },
    {
      label: "Fleet Utilization",
      value: `${utilizationRate}%`,
      icon: LuGauge,
      accent: "bg-amber-500",
    },
    {
      label: "Average Rating",
      value: avgRating,
      icon: LuStar,
      accent: "bg-indigo-500",
      trend: "Top 10% fleet",
    },
  ];

  const donutSegments = [
    { label: "Cars", value: categoryBreakdown.Cars },
    { label: "Motorbikes", value: categoryBreakdown.Motorbikes },
    { label: "Bicycles", value: categoryBreakdown.Bicycles },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Monthly Revenue Line Chart */}
        <div className="rounded-2xl border border-borderColor bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <LuTrendingUp size={15} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Revenue Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cumulative revenue over the last 12 months
              </p>
            </div>
          </div>
          <div className="mt-4">
            <MonthlyRevenueChart data={monthlyRevenue} isDark={isDark} />
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="rounded-2xl border border-borderColor bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
              <LuChartColumn size={15} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Fleet by Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cars vs Motorbikes vs Bicycles
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <CategoryDonut segments={donutSegments} isDark={isDark} />
          </div>

          <div className="mt-5 space-y-3">
            {donutSegments.map((seg, i) => (
              <div key={seg.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[i] }}
                  />
                  {seg.label}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {seg.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Bar Chart */}
      <div className="rounded-2xl border border-borderColor bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Monthly Revenue Breakdown
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Estimated revenue per month
        </p>
        <div className="mt-4 flex items-end gap-2" style={{ height: 160 }}>
          {monthlyRevenue.map((val, i) => {
            const max = Math.max(...monthlyRevenue, 1);
            const h = (val / max) * 140;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="hidden text-[10px] font-semibold text-slate-500 dark:text-slate-400 sm:block">
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </span>
                <div
                  className="w-full rounded-t-md bg-primary transition-all duration-500"
                  style={{ height: h }}
                />
                <span className="text-[10px] text-slate-400">
                  {MONTHS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
