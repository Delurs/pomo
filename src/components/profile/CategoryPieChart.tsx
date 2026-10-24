import { useState } from "react";
import { type Task, CATEGORY_META } from "../../types/pomo";

interface CategoryPieChartProps {
  isDark: boolean;
  timeFilter: "day" | "week" | "month";
  completedFilteredTasks: Task[];
}

export default function CategoryPieChart({
  isDark,
  timeFilter,
  completedFilteredTasks,
}: CategoryPieChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<Task["category"] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Task["category"] | null>(null);

  const getCategoryMeta = (cat: Task["category"]) => {
    return (
      CATEGORY_META[cat] ||
      CATEGORY_META.wellbeing || {
        label: cat,
        color: "#ADF1DC",
        emoji: "🌿",
        iconSrc: "/fern.png",
      }
    );
  };

  const totalFilteredCompletedTasks = completedFilteredTasks.length;

  const categoryCounts = completedFilteredTasks.reduce(
    (acc, task) => {
      const cat =
        (task.category as Task["category"]) in CATEGORY_META ? task.category : "wellbeing";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<Task["category"], number>
  );

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  const allCategoryLegends = (Object.keys(CATEGORY_META) as Task["category"][]).map((catKey) => {
    const count = categoryCounts[catKey] || 0;
    const percent =
      totalFilteredCompletedTasks > 0
        ? Math.round((count / totalFilteredCompletedTasks) * 100)
        : 0;
    return {
      key: catKey,
      meta: getCategoryMeta(catKey),
      count,
      percent,
      hasTasks: count > 0,
    };
  });

  const categorySegments = (Object.keys(CATEGORY_META) as Task["category"][])
    .map((catKey) => {
      const count = categoryCounts[catKey] || 0;
      const percent = totalFilteredCompletedTasks > 0 ? count / totalFilteredCompletedTasks : 0;
      const strokeLength = percent * circumference;
      const strokeOffset = -cumulativePercent * circumference;
      cumulativePercent += percent;

      return {
        key: catKey,
        meta: getCategoryMeta(catKey),
        count,
        percent: Math.round(percent * 100),
        strokeLength,
        strokeOffset,
      };
    })
    .filter((seg) => seg.count > 0);

  const activeCategoryKey = hoveredCategory || selectedCategory;
  const activeCategoryItem = activeCategoryKey
    ? allCategoryLegends.find((c) => c.key === activeCategoryKey)
    : categorySegments.length === 1
      ? categorySegments[0]
      : null;

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col justify-between ${
        isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5 shadow-2xs"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <img src="/pie_chart.png" alt="Pie Chart" className="w-4 h-4 object-contain inline-block" />
          <span className="text-xs font-bold">Category Rituals</span>
        </div>
        <span className="text-[10px] opacity-50 uppercase tracking-wider font-semibold">
          {timeFilter}
        </span>
      </div>

      <div className="w-full mb-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-24 overflow-y-auto pr-1">
          {allCategoryLegends.map((item) => {
            const isSelected = selectedCategory === item.key;
            const isHovered = hoveredCategory === item.key;
            const isActive = isSelected || isHovered;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setSelectedCategory((prev) => (prev === item.key ? null : item.key))
                }
                onMouseEnter={() => setHoveredCategory(item.key)}
                onMouseLeave={() => setHoveredCategory(null)}
                title={`Click to view ${item.meta.label} stats inside chart`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer select-none ${
                  isActive ? "ring-2 ring-[#adf1dc] scale-105 shadow-sm" : ""
                } ${
                  item.hasTasks
                    ? isDark
                      ? "bg-[#161b1a] border-white/10 text-white shadow-xs hover:border-[#adf1dc]/40"
                      : "bg-[#f1fcf4] border-black/5 text-[#002019] shadow-xs hover:border-[#adf1dc]"
                    : isDark
                      ? "bg-[#161b1a]/40 border-white/5 text-white/50 hover:opacity-80"
                      : "bg-black/[0.02] border-black/5 text-black/50 hover:opacity-80"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: item.meta.color,
                    opacity: item.hasTasks ? 1 : 0.4,
                  }}
                />
                <img
                  src={item.meta.iconSrc}
                  alt={item.meta.label}
                  className="w-3.5 h-3.5 object-contain flex-shrink-0"
                />
                <span className="truncate">{item.meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
          <svg
            className="w-full h-full -rotate-90 transform"
            viewBox="0 0 100 100"
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
              strokeWidth="14"
              style={{ pointerEvents: "none" }}
            />

            {totalFilteredCompletedTasks > 0 &&
              categorySegments.map((seg) => {
                const isSliceActive =
                  hoveredCategory === seg.key || selectedCategory === seg.key;
                return (
                  <circle
                    key={seg.key}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={seg.meta.color}
                    strokeWidth={isSliceActive ? "16" : "14"}
                    strokeDasharray={`${seg.strokeLength} ${circumference}`}
                    strokeDashoffset={seg.strokeOffset}
                    strokeLinecap="butt"
                    style={{ pointerEvents: "stroke" }}
                    onMouseEnter={() => setHoveredCategory(seg.key)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() =>
                      setSelectedCategory((prev) => (prev === seg.key ? null : seg.key))
                    }
                    className="transition-all duration-200 ease-out cursor-pointer"
                    opacity={
                      isSliceActive || (!hoveredCategory && !selectedCategory) ? 1 : 0.4
                    }
                  />
                );
              })}

            <circle
              cx="50"
              cy="50"
              r={radius - 7}
              fill="transparent"
              style={{ pointerEvents: "fill" }}
              onMouseEnter={() => setHoveredCategory(null)}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none select-none">
            {totalFilteredCompletedTasks === 0 ? (
              <>
                <span className="text-2xl font-black leading-none tracking-tight">0</span>
                <span className="text-[11px] opacity-60 font-semibold mt-1">Completed</span>
              </>
            ) : activeCategoryItem ? (
              <>
                <span
                  className="text-[11px] font-bold truncate max-w-[110px] px-1 flex items-center justify-center gap-1"
                  style={{ color: activeCategoryItem.meta.color }}
                >
                  <img
                    src={activeCategoryItem.meta.iconSrc}
                    alt={activeCategoryItem.meta.label}
                    className="w-3.5 h-3.5 object-contain inline-block"
                  />
                  <span className="truncate">{activeCategoryItem.meta.label}</span>
                </span>
                <div className="flex items-baseline justify-center gap-1 mt-0.5">
                  <span className="text-2xl font-black leading-none tracking-tight">
                    {activeCategoryItem.count}
                  </span>
                  <span className="text-xs font-semibold opacity-60">completed</span>
                </div>
                <span className="text-xs font-bold text-[#256959] dark:text-[#adf1dc] mt-0.5">
                  {activeCategoryItem.percent}%
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black leading-none tracking-tight">
                  {totalFilteredCompletedTasks}
                </span>
                <span className="text-xs opacity-60 font-semibold mt-1">Completed</span>
                <span className="text-[9px] opacity-40 mt-0.5">Hover a ritual</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
