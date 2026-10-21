import { useState, useEffect } from "react";
import { type Task, CATEGORY_META } from "../types/pomo";

export interface ProfileModalProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  completedSessions?: number;
}

type TimeFilter = "day" | "week" | "month";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ProfileModal({
  isDark,
  isOpen,
  onClose,
  tasks,
}: ProfileModalProps) {
  // 1. Profile State
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("pomo_user_name") || "Mindful Sprout";
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // 2. Change Password State (Positioned beside username)
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // 3. Overview Time Filter State
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");

  // 4. Real-time Clock State (Ticks every second)
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // 5. Interactive Calendar State: navigate month, year, and select specific days
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // 6. Category Ritual Hover & Selection State (for relocating counts & percentages inside pie chart)
  const [hoveredCategory, setHoveredCategory] = useState<Task["category"] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Task["category"] | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Name update handler
  const handleSaveName = () => {
    const trimmed = tempName.trim() || "Mindful Sprout";
    setUserName(trimmed);
    localStorage.setItem("pomo_user_name", trimmed);
    setIsEditingName(false);
  };

  // Password update handler
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setPasswordFeedback({ type: "error", message: "Please enter a new password." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: "error",
        message: "Password must be at least 6 characters long.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    localStorage.setItem("pomo_user_password", newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordFeedback({
      type: "success",
      message: "Password changed successfully!",
    });

    setTimeout(() => {
      setPasswordFeedback({ type: null, message: "" });
      setIsChangingPassword(false);
    }, 2000);
  };

  // Safe category meta resolver in case of historical tasks
  const getCategoryMeta = (cat: Task["category"]) => {
    return CATEGORY_META[cat] || CATEGORY_META.wellbeing || { label: cat, color: "#ADF1DC", emoji: "🌿", iconSrc: "/fern.png" };
  };

  // Filter tasks based on day, week, or month
  const todayStr = currentTime.toLocaleDateString("en-CA"); // "YYYY-MM-DD"

  const filteredTasks = tasks.filter((task) => {
    const taskDateStr = task.createdAt || todayStr;
    const [y, m, d] = taskDateStr.split("-").map(Number);
    const taskDate = new Date(y, m - 1, d);
    const now = new Date(todayStr);

    if (timeFilter === "day") {
      return taskDateStr === todayStr;
    }

    if (timeFilter === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    }

    // "month"
    return (
      taskDate.getFullYear() === now.getFullYear() &&
      taskDate.getMonth() === now.getMonth()
    );
  });

  // If a specific day is clicked on the calendar, optionally show its tasks
  const displayedTasks = selectedDateStr
    ? tasks.filter(
      (t) => (t.createdAt || todayStr) === selectedDateStr || t.reminderDate === selectedDateStr
    )
    : filteredTasks;

  const totalTasksFinished = tasks.filter((t) => t.completed).length;
  const filteredCompleted = filteredTasks.filter((t) => t.completed).length;

  // -------------------------------------------------------------
  // Pie Chart Calculations (Category Distribution) - ONLY COMPLETED TASKS
  // -------------------------------------------------------------
  const completedFilteredTasks = filteredTasks.filter((t) => t.completed);
  const totalFilteredCompletedTasks = completedFilteredTasks.length;

  const categoryCounts = completedFilteredTasks.reduce(
    (acc, task) => {
      const cat = (task.category as Task["category"]) in CATEGORY_META ? task.category : "wellbeing";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<Task["category"], number>
  );

  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.327
  let cumulativePercent = 0;

  const allCategoryLegends = (Object.keys(CATEGORY_META) as Task["category"][]).map((catKey) => {
    const count = categoryCounts[catKey] || 0;
    const percent = totalFilteredCompletedTasks > 0 ? Math.round((count / totalFilteredCompletedTasks) * 100) : 0;
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

  // -------------------------------------------------------------
  // Interactive Calendar Calculations (Navigate Day, Month, Year)
  // -------------------------------------------------------------
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth(); // 0-indexed
  const daysInViewMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfViewWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun

  // Real-time Today details
  const realCurrentYear = currentTime.getFullYear();
  const realCurrentMonth = currentTime.getMonth();
  const realTodayDate = currentTime.getDate();

  // Tasks mapped by date string "YYYY-MM-DD"
  const tasksByDate = tasks.reduce((acc, t) => {
    if (t.createdAt) acc[t.createdAt] = (acc[t.createdAt] || 0) + 1;
    if (t.reminderDate && t.reminderDate !== t.createdAt) {
      acc[t.reminderDate] = (acc[t.reminderDate] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Calendar controls
  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleSelectMonth = (mIndex: number) => {
    setViewDate(new Date(viewYear, mIndex, 1));
  };

  const handleSelectYear = (y: number) => {
    setViewDate(new Date(y, viewMonth, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(now.toLocaleDateString("en-CA"));
  };

  const handleDayClick = (dayNum: number) => {
    const clickedDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(
      dayNum
    ).padStart(2, "0")}`;
    setSelectedDateStr((prev) => (prev === clickedDateStr ? null : clickedDateStr));
  };

  // Year options for quick selection (-5 years to +5 years)
  const yearOptions = Array.from({ length: 11 }, (_, i) => realCurrentYear - 5 + i);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 md:p-8 border shadow-2xl relative transition-all ${isDark
          ? "bg-[#1f2725] border-white/10 text-[#e8f3ec]"
          : "bg-white border-black/5 text-[#141e19]"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-black/5 dark:border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#adf1dc] text-[#002019] flex items-center justify-center font-bold shadow-sm p-1.5">
              <img src="/profile.png" alt="Profile" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight">Profile & Sanctuary</h3>
              <p className="text-xs opacity-60">Manage your account and productivity overview</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Profile"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
              isDark
                ? "bg-[#161b1a] text-slate-300 hover:text-white hover:bg-[#283330] border border-white/10"
                : "bg-[#ebf6ef] text-[#002019] hover:bg-[#dfeee5]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Profile Card & Account Security Centered */}
        <div
          className={`rounded-2xl p-6 border mb-6 flex flex-col items-center justify-center text-center ${
            isDark ? "bg-[#161b1a] border-white/5" : "bg-[#f1fcf4] border-black/5"
          }`}
        >
          {/* Avatar Centered */}
          <div className="w-16 h-16 rounded-2xl bg-[#adf1dc] text-[#002019] flex items-center justify-center font-bold shadow-sm mb-3 p-2.5">
            <img src="/profile.png" alt="Profile" className="w-full h-full object-contain" />
          </div>

          {/* Username & Edit Centered */}
          <div className="flex flex-col items-center justify-center mb-1">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                  className={`px-3 py-1 text-sm font-bold rounded-lg border focus:outline-none text-center w-40 ${
                    isDark
                      ? "bg-[#1f2725] border-white/20 text-white"
                      : "bg-white border-black/20 text-black"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#adf1dc] text-[#002019] cursor-pointer hover:opacity-90 flex-shrink-0"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h4 className="text-lg font-bold">{userName}</h4>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(userName);
                    setIsEditingName(true);
                  }}
                  className="opacity-50 hover:opacity-100 transition cursor-pointer p-0.5"
                  title="Edit name"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>
            )}
            <p className="text-xs opacity-50 mt-0.5">Mindful Practitioner</p>
          </div>

          {/* Clean Account Security Button Centered */}
          {!isChangingPassword && (
            <div className="flex items-center justify-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(true);
                  setPasswordFeedback({ type: null, message: "" });
                }}
                className="px-4 py-1.5 rounded-full bg-[#adf1dc] text-[#002019] text-xs font-bold hover:scale-105 active:scale-95 transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <img src="/lock_reset.png" alt="Lock Reset" className="w-4 h-4 object-contain inline-block" />
                <span>Change Password</span>
              </button>
            </div>
          )}

          {/* Inline Change Password Form when toggled */}
          {isChangingPassword && (
            <form
              onSubmit={handlePasswordSubmit}
              className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold flex items-center gap-1.5 opacity-80">
                  <img src="/lock_reset.png" alt="Lock Reset" className="w-4 h-4 object-contain inline-block" />
                  <span>Update Password</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold opacity-70 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    autoFocus
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full h-9 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${isDark
                      ? "bg-[#1f2725] border-white/10 placeholder-white/30"
                      : "bg-white border-black/10 placeholder-black/30"
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold opacity-70 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full h-9 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${isDark
                      ? "bg-[#1f2725] border-white/10 placeholder-white/30"
                      : "bg-white border-black/10 placeholder-black/30"
                      }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                {passwordFeedback.message ? (
                  <div
                    className={`text-xs font-semibold ${passwordFeedback.type === "success"
                      ? "text-emerald-500"
                      : "text-rose-400"
                      }`}
                  >
                    {passwordFeedback.message}
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordFeedback({ type: null, message: "" });
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-[#adf1dc] text-[#002019] text-xs font-bold hover:scale-105 transition cursor-pointer shadow-sm"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Task Metrics (Total Tasks Finished & Total Tasks) */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className={`p-3.5 rounded-2xl border text-center ${isDark ? "bg-[#161b1a] border-white/5" : "bg-[#f1fcf4] border-black/5"
              }`}
          >
            <div className="text-xs opacity-60 font-medium mb-1">Total Tasks Finished</div>
            <div className="text-2xl font-black text-[#256959] dark:text-[#adf1dc]">
              {totalTasksFinished}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border text-center ${isDark ? "bg-[#161b1a] border-white/5" : "bg-[#f1fcf4] border-black/5"
              }`}
          >
            <div className="text-xs opacity-60 font-medium mb-1">Total Tasks</div>
            <div className="text-2xl font-black text-[#256959] dark:text-[#adf1dc]">
              {tasks.length}
            </div>
          </div>
        </div>

        {/* Overview Section with Time Filter (Day, Week, Month) */}
        <div
          className={`rounded-2xl p-5 border ${isDark ? "bg-[#161b1a] border-white/5" : "bg-[#ebf6ef]/60 border-black/5"
            }`}
        >
          {/* Header & Centered Segmented Filter */}
          <div className="flex flex-col items-center justify-center gap-3 mb-5">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <img src="/dashboard.png" alt="Dashboard" className="w-5 h-5 object-contain inline-block" />
              <span className="text-sm font-bold">Overview</span>
              <span className="px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px] font-semibold opacity-80 whitespace-nowrap">
                {filteredCompleted} of {filteredTasks.length} completed
              </span>
            </div>

            {/* Centered Day, Week, Month Filter */}
            <div
              className={`inline-flex p-1 rounded-full border ${isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5"
                }`}
            >
              {(["day", "week", "month"] as TimeFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setTimeFilter(f);
                    setSelectedDateStr(null);
                  }}
                  className={`px-4 py-1 rounded-full text-xs font-semibold capitalize transition cursor-pointer ${timeFilter === f
                    ? "bg-[#adf1dc] text-[#002019] shadow-sm font-bold"
                    : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-black"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-side: Category Pie Chart & Interactive Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* 1. Category Pie Chart Card (Bigger pie chart with Legends ABOVE it) */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between ${isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5 shadow-2xs"
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

              {/* Category Ritual Legends (Only showing the name of that category to save space) */}
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
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer select-none ${isActive
                          ? "ring-2 ring-[#adf1dc] scale-105 shadow-sm"
                          : ""
                          } ${item.hasTasks
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
                        <img src={item.meta.iconSrc} alt={item.meta.label} className="w-3.5 h-3.5 object-contain flex-shrink-0" />
                        <span className="truncate">
                          {item.meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enlarged Pie / Donut Chart with Relocated Percentages and Creation Counts Inside */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                  <svg
                    className="w-full h-full -rotate-90 transform"
                    viewBox="0 0 100 100"
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {/* Background Track Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
                      strokeWidth="14"
                      style={{ pointerEvents: "none" }}
                    />

                    {/* Category Slices (Accurate Hover & Click via pointer-events: stroke and fill: none) */}
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

                    {/* Center Hole Guard: clears hover when mouse moves inside the donut hole */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius - 7}
                      fill="transparent"
                      style={{ pointerEvents: "fill" }}
                      onMouseEnter={() => setHoveredCategory(null)}
                    />
                  </svg>

                  {/* Relocated Percentages & Completed Tasks (Inside the Pie Chart) */}
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
                          <img src={activeCategoryItem.meta.iconSrc} alt={activeCategoryItem.meta.label} className="w-3.5 h-3.5 object-contain inline-block" />
                          <span className="truncate">{activeCategoryItem.meta.label}</span>
                        </span>
                        <div className="flex items-baseline justify-center gap-1 mt-0.5">
                          <span className="text-2xl font-black leading-none tracking-tight">
                            {activeCategoryItem.count}
                          </span>
                          <span className="text-xs font-semibold opacity-60">
                            completed
                          </span>
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

            {/* 2. Interactive Calendar Card (Clickable Day, Month, and Year) */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between ${isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5 shadow-2xs"
                }`}
            >
              {/* Calendar Controls Header (Centered & Organized without overflowing) */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 w-full">
                {/* Prev Month */}
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  title="Previous month"
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                    isDark
                      ? "hover:bg-white/10 text-slate-300 hover:text-white"
                      : "hover:bg-black/5 text-slate-700 hover:text-black"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>

                {/* Month Dropdown */}
                <select
                  value={viewMonth}
                  onChange={(e) => handleSelectMonth(Number(e.target.value))}
                  aria-label="Select month"
                  className={`px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none transition ${
                    isDark
                      ? "bg-[#161b1a] border-white/10 text-white"
                      : "bg-[#f1fcf4] border-black/10 text-[#141e19]"
                  }`}
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx} className={isDark ? "bg-[#1f2725]" : "bg-white"}>
                      {name}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={viewYear}
                  onChange={(e) => handleSelectYear(Number(e.target.value))}
                  aria-label="Select year"
                  className={`px-1.5 py-1 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none transition ${
                    isDark
                      ? "bg-[#161b1a] border-white/10 text-white"
                      : "bg-[#f1fcf4] border-black/10 text-[#141e19]"
                  }`}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y} className={isDark ? "bg-[#1f2725]" : "bg-white"}>
                      {y}
                    </option>
                  ))}
                </select>

                {/* Next Month */}
                <button
                  type="button"
                  onClick={handleNextMonth}
                  title="Next month"
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                    isDark
                      ? "hover:bg-white/10 text-slate-300 hover:text-white"
                      : "hover:bg-black/5 text-slate-700 hover:text-black"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>

                {/* Jump to Today Button: Highly visible in Night Mode */}
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  title="Jump to today's date"
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs ${
                    isDark
                      ? "bg-[#adf1dc] text-[#002019] hover:bg-[#cbf7ea] hover:scale-105 active:scale-95"
                      : "bg-[#256959] text-white hover:bg-[#1b4e42] hover:scale-105 active:scale-95"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-[#002019]" : "bg-emerald-300"} animate-pulse`} />
                  <span>Today</span>
                </button>
              </div>

              {/* Calendar Grid with Clickable Days */}
              <div className="w-full">
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {weekdays.map((day) => (
                    <span
                      key={day}
                      className="text-[10px] font-bold opacity-50 uppercase tracking-wider"
                    >
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Leading Empty Slots */}
                  {Array.from({ length: firstDayOfViewWeek }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-7" />
                  ))}

                  {/* Days of Selected Month */}
                  {Array.from({ length: daysInViewMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(
                      dayNum
                    ).padStart(2, "0")}`;
                    const isRealToday =
                      viewYear === realCurrentYear &&
                      viewMonth === realCurrentMonth &&
                      dayNum === realTodayDate;
                    const isSelected = selectedDateStr === dateKey;
                    const taskCountOnDate = tasksByDate[dateKey] || 0;

                    return (
                      <button
                        key={`day-${dayNum}`}
                        type="button"
                        onClick={() => handleDayClick(dayNum)}
                        title={`${MONTH_NAMES[viewMonth]} ${dayNum}, ${viewYear}${taskCountOnDate > 0 ? ` (${taskCountOnDate} task${taskCountOnDate > 1 ? "s" : ""})` : ""
                          }`}
                        className={`h-7 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center relative transition cursor-pointer ${isSelected
                          ? "bg-[#adf1dc] text-[#002019] font-black shadow-md ring-2 ring-[#002019]"
                          : isRealToday
                            ? "border-2 border-[#adf1dc] text-[#256959] dark:text-[#adf1dc] font-black"
                            : isDark
                              ? "hover:bg-white/10 text-white/90"
                              : "hover:bg-black/5 text-black/90"
                          }`}
                      >
                        <span className="leading-none">{dayNum}</span>

                        {/* Task Marker Dot */}
                        {taskCountOnDate > 0 && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected
                              ? "bg-[#002019]"
                              : isRealToday
                                ? "bg-[#256959] dark:bg-[#adf1dc]"
                                : "bg-emerald-500"
                              }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Footer / Selection State */}
              <div className="pt-2 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px]">
                {selectedDateStr ? (
                  <div className="flex items-center gap-1.5 w-full justify-between text-[#256959] dark:text-[#adf1dc] font-bold">
                    <span>
                      Selected: {selectedDateStr} ({tasksByDate[selectedDateStr] || 0} tasks)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDateStr(null)}
                      className="text-[10px] underline hover:opacity-80 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full opacity-60">
                    <span>Click any day to filter</span>
                    <span>
                      Now: {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stepping Stones / Filtered Task List */}
          <div className="pt-2">
            <div className="text-xs font-bold opacity-80 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <img src="/bulleted_list.png" alt="Tasks" className="w-4 h-4 object-contain inline-block" />
                <span>
                  {selectedDateStr
                    ? `Tasks on ${selectedDateStr}`
                    : `Stepping Stones in ${timeFilter}`}
                </span>
              </div>
              {selectedDateStr && (
                <button
                  type="button"
                  onClick={() => setSelectedDateStr(null)}
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
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${isDark
                        ? "bg-[#1f2725] border-white/5"
                        : "bg-white border-black/5 shadow-2xs"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-sm">{t.completed ? "✅" : "⏳"}</span>
                        <span
                          className={`truncate font-medium ${t.completed ? "line-through opacity-50" : ""
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
                        <img src={meta.iconSrc} alt={meta.label} className="w-3 h-3 object-contain inline-block" />
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
        </div>
      </div>
    </div>
  );
}
