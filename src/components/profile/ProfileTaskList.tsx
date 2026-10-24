import { type Task, CATEGORY_META } from "../../types/pomo";

interface ProfileTaskListProps {
  isDark: boolean;
  displayedTasks: Task[];
  selectedDateStr: string | null;
  timeFilter: string;
  onClearDateFilter: () => void;
}

export default function ProfileTaskList({
  isDark,
  displayedTasks,
  selectedDateStr,
  timeFilter,
  onClearDateFilter,
}: ProfileTaskListProps) {
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

  return (
    <div className="pt-2">
      <div className="text-xs font-bold opacity-80 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <img src="/bulleted_list.png" alt="Tasks" className="w-4 h-4 object-contain inline-block" />
          <span>
            {selectedDateStr ? `Tasks on ${selectedDateStr}` : `Stepping Stones in ${timeFilter}`}
          </span>
        </div>
        {selectedDateStr && (
          <button
            type="button"
            onClick={onClearDateFilter}
            className="text-[11px] text-[#256959] dark:text-[#adf1dc] font-semibold hover:underline cursor-pointer"
          >
            View all in {timeFilter}
          </button>
        )}
      </div>

      {displayedTasks.length > 0 ? (
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {displayedTasks.map((t) => {
            const meta = getCategoryMeta(t.category);
            return (
              <div
                key={t.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                  isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-sm">{t.completed ? "✅" : "⏳"}</span>
                  <span
                    className={`truncate font-medium ${
                      t.completed ? "line-through opacity-50" : ""
                    }`}
                  >
                    {t.title}
                  </span>
                </div>

                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 inline-flex items-center gap-1"
                  style={{
                    backgroundColor: `${meta.color}26`,
                    color: meta.color,
                  }}
                >
                  <img
                    src={meta.iconSrc}
                    alt={meta.label}
                    className="w-3 h-3 object-contain inline-block"
                  />
                  <span>{meta.label}</span>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-xs opacity-50">
          {selectedDateStr
            ? `No tasks recorded on ${selectedDateStr}.`
            : `No tasks recorded for this ${timeFilter}.`}
        </div>
      )}
    </div>
  );
}
