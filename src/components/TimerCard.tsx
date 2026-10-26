import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type TimerMode, TIMER_CONFIGS } from "../types/pomo";
import { timerAudio } from "./timer/timerAudio";
import TimerDial, { formatDisplayTime } from "./timer/TimerDial";
import ManualTimerModal from "./timer/ManualTimerModal";
import TimesUpModal from "./timer/TimesUpModal";

interface TimerCardProps {
  isDark: boolean;
  completedSessions: number;
  targetSessions?: number;
  activeTaskTitle?: string;
  startTimerSignal?: number;
  stopTimerSignal?: number;
  onSessionComplete: () => void;
  onSelectSessions?: (sessions: number) => void;
  onTimerFinish?: () => void;
}

export default function TimerCard({
  isDark,
  completedSessions,
  targetSessions = 1,
  activeTaskTitle,
  startTimerSignal = 0,
  stopTimerSignal = 0,
  onSessionComplete,
  onSelectSessions,
  onTimerFinish,
}: TimerCardProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_CONFIGS.focus.duration);
  const [customDuration, setCustomDuration] = useState<number>(25 * 60);
  const [sessionTotalDuration, setSessionTotalDuration] = useState<number>(
    TIMER_CONFIGS.focus.duration
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Manual Timer Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Time's Up Modal State
  const [isTimesUpOpen, setIsTimesUpOpen] = useState<boolean>(false);
  const [timesUpModalTitle, setTimesUpModalTitle] = useState<string>("Time's up!");
  const [timesUpModalSubtitle, setTimesUpModalSubtitle] = useState<string>("");

  // Start task signal
  useEffect(() => {
    if (startTimerSignal > 0) {
      setMode("focus");
      setTimeLeft(TIMER_CONFIGS.focus.duration);
      setSessionTotalDuration(TIMER_CONFIGS.focus.duration);
      setCustomDuration(TIMER_CONFIGS.focus.duration);
      setHasStarted(true);
      setIsRunning(true);
    }
  }, [startTimerSignal]);

  // Stop task signal
  useEffect(() => {
    if (stopTimerSignal > 0) {
      setIsRunning(false);
      setHasStarted(false);
      setMode("focus");
      setTimeLeft(TIMER_CONFIGS.focus.duration);
      setSessionTotalDuration(TIMER_CONFIGS.focus.duration);
      setCustomDuration(TIMER_CONFIGS.focus.duration);
    }
  }, [stopTimerSignal]);

  // Cleanup alarm on unmount
  useEffect(() => {
    return () => {
      timerAudio.stopAlarmSound();
    };
  }, []);

  // Monitor timer progress from browser tab title
  useEffect(() => {
    if (isRunning) {
      document.title = `(${formatDisplayTime(timeLeft)}) Pomodoro Tortoise`;
    } else {
      document.title = "Pomodoro Tortoise";
    }
    return () => {
      document.title = "Pomodoro Tortoise";
    };
  }, [isRunning, timeLeft]);

  const handleCloseTimesUp = () => {
    timerAudio.stopAlarmSound();
    setIsTimesUpOpen(false);
  };

  const switchTimerMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setHasStarted(false);
    setMode(newMode);
    if (newMode === "custom") {
      setTimeLeft(customDuration);
      setSessionTotalDuration(customDuration);
    } else {
      const dur = TIMER_CONFIGS[newMode].duration;
      setTimeLeft(dur);
      setSessionTotalDuration(dur);
    }
  };

  const handleNextSession = () => {
    setIsRunning(false);
    setHasStarted(false);

    if (mode === "focus" || mode === "custom") {
      onSessionComplete();
      switchTimerMode("short");
    } else {
      switchTimerMode("focus");
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setHasStarted(false);
      onTimerFinish?.();
      timerAudio.playAlarmSound();

      if (mode === "focus" || mode === "custom") {
        const nextSessionNum = completedSessions + 1;
        const isAllCompleted = targetSessions > 0 && nextSessionNum >= targetSessions;

        if (isAllCompleted) {
          setTimesUpModalTitle("Congrats on completing this task");
          setTimesUpModalSubtitle(
            activeTaskTitle
              ? `You've completed all ${targetSessions} session${
                  targetSessions > 1 ? "s" : ""
                } for ${activeTaskTitle.replace(/^🎯\s*/, "")}! Take a well-deserved rest.`
              : `You've completed all ${targetSessions} session${
                  targetSessions > 1 ? "s" : ""
                }! Take a well-deserved rest.`
          );
          onSessionComplete();
          switchTimerMode("focus");
        } else {
          setTimesUpModalTitle("Time's up!");
          setTimesUpModalSubtitle("Focus session completed! Time for a 5-minute break.");
          onSessionComplete();
          switchTimerMode("short");
        }
      } else {
        setTimesUpModalTitle("Time's up!");
        setTimesUpModalSubtitle("Break has finished! Ready to step back into your flow?");
        switchTimerMode("focus");
      }

      setIsTimesUpOpen(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, completedSessions, targetSessions, activeTaskTitle]);

  const handleResetTimer = () => {
    setIsRunning(false);
    setHasStarted(false);
    if (mode === "custom") {
      setTimeLeft(customDuration);
      setSessionTotalDuration(customDuration);
    } else {
      const dur = TIMER_CONFIGS[mode].duration;
      setTimeLeft(dur);
      setSessionTotalDuration(dur);
    }
  };

  const handleApplyManualTimer = (total: number) => {
    setHasStarted(false);
    if (total > 25 * 60) {
      const calculatedSessions = Math.max(2, Math.round(total / 1800));
      onSelectSessions?.(calculatedSessions);
      setMode("focus");
      setTimeLeft(25 * 60);
      setSessionTotalDuration(25 * 60);
      setCustomDuration(25 * 60);
      setIsRunning(false);
    } else {
      setCustomDuration(total);
      setTimeLeft(total);
      setSessionTotalDuration(total);
      setMode("custom");
      setIsRunning(false);
    }
  };

  const adjustTime = (seconds: number) => {
    setTimeLeft((prev) => {
      const nextTime = Math.max(0, prev + seconds);
      if (!hasStarted) {
        setSessionTotalDuration(nextTime);
        setCustomDuration(nextTime);
      } else {
        setSessionTotalDuration((prevTotal) =>
          Math.max(nextTime, prevTotal + (seconds > 0 ? seconds : 0))
        );
      }
      return nextTime;
    });
  };

  const actionLabel = isRunning
    ? "Pause Focus"
    : mode === "focus"
      ? "Start Focus"
      : mode === "custom"
        ? "Start Ritual"
        : "Start Break";

  return (
    <section
      className={`w-full h-full rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between relative overflow-hidden border shadow-sm transition-colors ${
        isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5"
      }`}
    >
      {/* Mode Tabs + Manual Timer Button with Liquid Sliding Pill Indicator */}
      <div
        className={`relative z-10 p-1 rounded-2xl sm:rounded-full grid grid-cols-2 sm:flex sm:flex-row sm:flex-nowrap items-center justify-center gap-1 mb-2 border w-full max-w-xs sm:w-auto sm:max-w-none ${
          isDark
            ? "bg-[var(--theme-subtle-dark,#161b1a)] border-white/5 text-slate-300"
            : "bg-[var(--theme-subtle-light,#ebf6ef)] border-black/5 text-[#57615c]"
        }`}
      >
        {(["focus", "short", "long"] as const).map((tabKey) => {
          const isSelected = mode === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => switchTimerMode(tabKey)}
              className={`relative px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-xl sm:rounded-full text-[10.5px] sm:text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center text-center whitespace-nowrap flex-shrink-0 z-10 ${
                isSelected
                  ? "text-[#002019] font-bold"
                  : isDark
                    ? "text-slate-300 hover:text-white"
                    : "text-[#57615c] hover:text-[#002019]"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="timer-mode-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className="absolute inset-0 rounded-xl sm:rounded-full bg-[var(--theme-accent,#adf1dc)] shadow-sm -z-10"
                />
              )}
              <span className="relative z-10">
                {TIMER_CONFIGS[tabKey].label} ({formatDisplayTime(TIMER_CONFIGS[tabKey].duration)})
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setIsManualModalOpen(true)}
          title="Set custom hours, minutes, and seconds"
          className={`relative px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-xl sm:rounded-full text-[10.5px] sm:text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap flex-shrink-0 z-10 ${
            mode === "custom"
              ? "text-[#002019] font-bold"
              : isDark
                ? "text-slate-300 hover:text-white"
                : "text-[#57615c] hover:text-[#002019]"
          }`}
        >
          {mode === "custom" && (
            <motion.div
              layoutId="timer-mode-pill"
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="absolute inset-0 rounded-xl sm:rounded-full bg-[var(--theme-accent,#adf1dc)] shadow-sm -z-10"
            />
          )}
          <img src="/Timer.png" alt="Set Timer" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain inline-block relative z-10" />
          <span className="relative z-10">Set Timer</span>
        </button>
      </div>

      {/* Target Sessions Indicator Dots */}
      {targetSessions > 0 && (
        <div className="relative z-10 flex flex-col items-center gap-1 mb-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: targetSessions }).map((_, idx) => {
              const isCompleted = idx < completedSessions;
              const isCurrent = idx === completedSessions;
              return (
                <div
                  key={idx}
                  title={`Session ${idx + 1} of ${targetSessions}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? "w-6 sm:w-8 bg-[var(--theme-accent,#adf1dc)] shadow-sm shadow-[var(--theme-accent,#adf1dc)]/30"
                      : isCurrent
                        ? "w-6 sm:w-8 bg-[var(--theme-accent,#adf1dc)]/70 ring-2 ring-[var(--theme-accent,#adf1dc)]/50"
                        : isDark
                          ? "w-5 sm:w-6 bg-white/15"
                          : "w-5 sm:w-6 bg-black/15"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[10px] font-bold opacity-60 tracking-wider uppercase">
            {Math.min(completedSessions, targetSessions)} of {targetSessions} Sessions
          </span>
        </div>
      )}

      {/* Circular Dial Component */}
      <TimerDial
        isDark={isDark}
        timeLeft={timeLeft}
        sessionTotalDuration={sessionTotalDuration}
        hasStarted={hasStarted}
        mode={mode}
        activeTaskTitle={activeTaskTitle}
        completedSessions={completedSessions}
        onAdjustTime={adjustTime}
      />

      {/* Action Buttons: Reset, Play/Pause, Next */}
      <div className="relative z-10 flex items-center justify-center gap-3 mt-1.5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94, rotate: -35 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={handleResetTimer}
          title="Reset timer"
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer select-none ${
            isDark
              ? "bg-[var(--theme-subtle-dark,#161b1a)] border-white/5 hover:bg-white/10"
              : "bg-[var(--theme-subtle-light,#ebf6ef)] border-black/5 hover:bg-[var(--theme-hover-light,#dfeee5)]"
          }`}
        >
          <img src="/restart_alt.png" alt="Reset" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </motion.button>

        <motion.button
          layout
          type="button"
          whileTap={{ scale: 0.97 }}
          transition={{
            layout: { type: "spring", stiffness: 400, damping: 32 },
            scale: { type: "spring", stiffness: 550, damping: 30, restSpeed: 10 },
          }}
          onClick={() => {
            if (!isRunning && !hasStarted) {
              setHasStarted(true);
              setSessionTotalDuration(timeLeft);
            }
            setIsRunning(!isRunning);
          }}
          className="relative overflow-hidden px-7 h-[44px] rounded-full bg-[var(--theme-accent,#adf1dc)] text-[#002019] font-bold text-sm flex items-center justify-center transition shadow-md shadow-[var(--theme-accent,#adf1dc)]/20 hover:brightness-105 hover:shadow-lg cursor-pointer select-none"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={actionLabel}
              layout="position"
              initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <img
                src={isRunning ? "/pause.png" : "/play_arrow.png"}
                alt={isRunning ? "Pause" : "Play"}
                className="w-5 h-5 object-contain"
              />
              <span>{actionLabel}</span>
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94, x: 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={handleNextSession}
          title="Next session"
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer select-none ${
            isDark
              ? "bg-[var(--theme-subtle-dark,#161b1a)] border-white/5 hover:bg-white/10"
              : "bg-[var(--theme-subtle-light,#ebf6ef)] border-black/5 hover:bg-[var(--theme-hover-light,#dfeee5)]"
          }`}
        >
          <img src="/skip_next.png" alt="Next" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </motion.button>
      </div>

      {/* Manual Timer Modal */}
      <ManualTimerModal
        isOpen={isManualModalOpen}
        isDark={isDark}
        initialSeconds={timeLeft}
        onClose={() => setIsManualModalOpen(false)}
        onApply={handleApplyManualTimer}
      />

      {/* Time's Up Alert Modal */}
      <TimesUpModal
        isOpen={isTimesUpOpen}
        isDark={isDark}
        title={timesUpModalTitle}
        subtitle={timesUpModalSubtitle}
        onClose={handleCloseTimesUp}
      />
    </section>
  );
}