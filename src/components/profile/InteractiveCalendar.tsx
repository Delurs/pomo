export const MONTH_NAMES = [
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

interface InteractiveCalendarProps {
  isDark: boolean;
  currentTime: Date;
  viewDate: Date;
  setViewDate: (date: Date) => void;
  selectedDateStr: string | null;
  onSelectDate: (dateStr: string | null) => void;
  tasksByDate: Record<string, number>;
}

export default function InteractiveCalendar({
  isDark,
  currentTime,
  viewDate,
  setViewDate,
  selectedDateStr,
  onSelectDate,
  tasksByDate,
}: InteractiveCalendarProps) {
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const daysInViewMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfViewWeek = new Date(viewYear, viewMonth, 1).getDay();

  const realCurrentYear = currentTime.getFullYear();
  const realCurrentMonth = currentTime.getMonth();
  const realTodayDate = currentTime.getDate();

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const yearOptions = Array.from({ length: 11 }, (_, i) => realCurrentYear - 5 + i);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleSelectMonth = (monthIdx: number) => {
    setViewDate(new Date(viewYear, monthIdx, 1));
  };

  const handleSelectYear = (yearNum: number) => {
    setViewDate(new Date(yearNum, viewMonth, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setViewDate(today);
    const todayDateKey = today.toLocaleDateString("en-CA");
    onSelectDate(todayDateKey);
  };

  const handleDayClick = (dayNum: number) => {
    const clickedDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(
      dayNum
    ).padStart(2, "0")}`;
    onSelectDate(selectedDateStr === clickedDateStr ? null : clickedDateStr);
  };

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col justify-between ${
        isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5 shadow-2xs"
      }`}
    >
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 w-full">
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
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDark ? "bg-[#002019]" : "bg-emerald-300"
            } animate-pulse`}
          />
          <span>Today</span>
        </button>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {weekdays.map((day) => (
            <span key={day} className="text-[10px] font-bold opacity-50 uppercase tracking-wider">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: firstDayOfViewWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-7" />
          ))}

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
                title={`${MONTH_NAMES[viewMonth]} ${dayNum}, ${viewYear}${
                  taskCountOnDate > 0 ? ` (${taskCountOnDate} task${taskCountOnDate > 1 ? "s" : ""})` : ""
                }`}
                className={`h-7 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center relative transition cursor-pointer ${
                  isSelected
                    ? "bg-[#adf1dc] text-[#002019] font-black shadow-md ring-2 ring-[#002019]"
                    : isRealToday
                      ? "border-2 border-[#adf1dc] text-[#256959] dark:text-[#adf1dc] font-black"
                      : isDark
                        ? "hover:bg-white/10 text-white/90"
                        : "hover:bg-black/5 text-black/90"
                }`}
              >
                <span className="leading-none">{dayNum}</span>

                {taskCountOnDate > 0 && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      isSelected
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

      <div className="pt-2 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px]">
        {selectedDateStr ? (
          <div className="flex items-center gap-1.5 w-full justify-between text-[#256959] dark:text-[#adf1dc] font-bold">
            <span>
              Selected: {selectedDateStr} ({tasksByDate[selectedDateStr] || 0} tasks)
            </span>
            <button
              type="button"
              onClick={() => onSelectDate(null)}
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
  );
}
