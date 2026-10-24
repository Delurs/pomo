import { useState, useEffect } from "react";
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

  return (
    <section
      className={`w-full h-full rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between relative overflow-hidden border shadow-sm transition-colors ${
        isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5"
      }`}
    >
      {/* Mode Tabs + Manual Timer Button */}
      <div
        className={`relative z-10 p-1 rounded-2xl sm:rounded-full grid grid-cols-2 sm:flex sm:flex-row sm:flex-nowrap items-center justify-center gap-1 mb-2 border w-full max-w-xs sm:w-auto sm:max-w-none ${
          isDark
            ? "bg-[#161b1a] border-white/5 text-slate-300"
            : "bg-[#ebf6ef] border-black/5 text-[#57615c]"
        }`}
      >
        {(["focus", "short", "long"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => switchTimerMode(tabKey)}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-xl sm:rounded-full text-[10.5px] sm:text-[11px] font-semibold transition cursor-pointer flex items-center justify-center text-center whitespace-nowrap flex-shrink-0 ${
              mode === tabKey
                ? "bg-[#adf1dc] text-[#002019] shadow-sm font-bold"
                : isDark
                  ? "text-slate-300 hover:text-white hover:bg-white/5"
                  : "text-[#57615c] hover:text-[#002019] hover:bg-black/5"
            }`}
          >
            <span>
              {TIMER_CONFIGS[tabKey].label} ({formatDisplayTime(TIMER_CONFIGS[tabKey].duration)})
            </span>
          </button>
        ))}

        <button
          onClick={() => setIsManualModalOpen(true)}
          title="Set custom hours, minutes, and seconds"
          className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-xl sm:rounded-full text-[10.5px] sm:text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap flex-shrink-0 ${
            mode === "custom"
              ? "bg-[#adf1dc] text-[#002019] shadow-sm font-bold"
              : isDark
                ? "text-slate-300 hover:text-white hover:bg-white/5"
                : "text-[#57615c] hover:text-[#002019] hover:bg-black/5"
          }`}
        >
          <img src="/Timer.png" alt="Set Timer" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain inline-block" />
          <span>Set Timer</span>
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
                      ? "w-6 sm:w-8 bg-[#adf1dc] shadow-sm shadow-[#adf1dc]/30"
                      : isCurrent
                        ? "w-6 sm:w-8 bg-[#adf1dc]/70 ring-2 ring-[#adf1dc]/50"
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
        <button
          onClick={handleResetTimer}
          title="Reset timer"
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition active:scale-95 cursor-pointer ${
            isDark
              ? "bg-[#161b1a] border-white/5 hover:bg-[#283330]"
              : "bg-[#ebf6ef] border-black/5 hover:bg-zinc-200"
          }`}
        >
          <img src="/restart_alt.png" alt="Reset" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </button>

        <button
          onClick={() => {
            if (!isRunning && !hasStarted) {
              setHasStarted(true);
              setSessionTotalDuration(timeLeft);
            }
            setIsRunning(!isRunning);
          }}
          className="min-w-[150px] h-[44px] px-6 rounded-full bg-[#adf1dc] text-[#002019] font-bold text-sm flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition shadow-md shadow-[#adf1dc]/20 cursor-pointer"
        >
          {isRunning ? (
            <span className="material-symbols-outlined text-[20px]">pause</span>
          ) : (
            <img src="/play_arrow.png" alt="Play" className="w-5 h-5 object-contain" />
          )}
          <span>
            {isRunning
              ? "Pause Focus"
              : mode === "focus"
                ? "Start Focus"
                : mode === "custom"
                  ? "Start Ritual"
                  : "Start Break"}
          </span>
        </button>

        <button
          onClick={handleNextSession}
          title="Next session"
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition active:scale-95 cursor-pointer ${
            isDark
              ? "bg-[#161b1a] border-white/5 hover:bg-[#283330]"
              : "bg-[#ebf6ef] border-black/5 hover:bg-zinc-200"
          }`}
        >
          <img src="/skip_next.png" alt="Next" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </button>
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