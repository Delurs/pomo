import { type TimerMode, TIMER_CONFIGS } from "../../types/pomo";

interface TimerDialProps {
  isDark: boolean;
  timeLeft: number;
  sessionTotalDuration: number;
  hasStarted: boolean;
  mode: TimerMode;
  activeTaskTitle?: string;
  completedSessions: number;
  onAdjustTime: (seconds: number) => void;
}

export const formatDisplayTime = (totalSeconds: number): string => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function TimerDial({
  isDark,
  timeLeft,
  sessionTotalDuration,
  hasStarted,
  mode,
  activeTaskTitle,
  completedSessions,
  onAdjustTime,
}: TimerDialProps) {
  // SVG Ring Progress Calculation
  const effectiveTotal = Math.max(sessionTotalDuration, timeLeft, 1);
  const progressRatio = hasStarted ? Math.min(1, Math.max(0, timeLeft / effectiveTotal)) : 1;
  const ringCircumference = 2 * Math.PI * 120; // 753.98
  const strokeOffset = ringCircumference * (1 - progressRatio);

  return (
    <div className="relative z-10 my-1 sm:my-1.5 flex items-center justify-center gap-3 sm:gap-6 w-full max-w-sm">
      {/* -15 Seconds Button */}
      <button
        type="button"
        onClick={() => onAdjustTime(-15)}
        disabled={timeLeft <= 0}
        title="Subtract 15 seconds"
        aria-label="Subtract 15 seconds"
        className={`bg-transparent border-0 border-none p-1 font-mono font-bold text-base sm:text-lg transition-all select-none ${
          timeLeft <= 0
            ? "opacity-20 cursor-not-allowed pointer-events-none"
            : "cursor-pointer hover:scale-115 active:scale-95 opacity-60 hover:opacity-100"
        } ${isDark ? "text-[#adf1dc]" : "text-[#256959]"}`}
      >
        -15
      </button>

      {/* Circular Countdown Dial */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke="currentColor"
            strokeWidth="9"
            fill="transparent"
            className={isDark ? "text-white/5" : "text-[#ebf6ef]"}
          />
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke="#adf1dc"
            strokeWidth="9"
            strokeDasharray="753.98"
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center px-4">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-0.5 max-w-[200px] truncate">
            {activeTaskTitle
              ? activeTaskTitle
              : mode === "custom"
                ? "Custom Ritual"
                : TIMER_CONFIGS[mode]?.subLabel || "Deep Work Ritual"}
          </span>
          <span
            className={`${
              timeLeft >= 3600 ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"
            } font-black font-mono tracking-tight leading-none`}
          >
            {formatDisplayTime(timeLeft)}
          </span>
          {/* Session indicator badge */}
          <div
            className={`inline-flex items-center px-3 py-0.5 mt-2 rounded-full text-[11px] font-semibold shadow-xs border ${
              isDark
                ? "bg-[#161b1a] border-white/10 text-[#adf1dc]"
                : "bg-[#ebf6ef] border-black/5 text-[#002019]"
            }`}
          >
            <span>Session {completedSessions + 1}</span>
          </div>
        </div>
      </div>

      {/* +15 Seconds Button */}
      <button
        type="button"
        onClick={() => onAdjustTime(15)}
        title="Add 15 seconds"
        aria-label="Add 15 seconds"
        className={`bg-transparent border-0 border-none p-1 font-mono font-bold text-base sm:text-lg transition-all select-none cursor-pointer hover:scale-115 active:scale-95 opacity-60 hover:opacity-100 ${
          isDark ? "text-[#adf1dc]" : "text-[#256959]"
        }`}
      >
        +15
      </button>
    </div>
  );
}
