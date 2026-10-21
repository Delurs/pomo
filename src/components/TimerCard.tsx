import { useState, useEffect, useRef } from "react";
import { type TimerMode, TIMER_CONFIGS } from "../types/pomo";

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
    const [sessionTotalDuration, setSessionTotalDuration] = useState<number>(TIMER_CONFIGS.focus.duration);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [hasStarted, setHasStarted] = useState<boolean>(false);

    // Manual Timer Modal State (Hours, Minutes, Seconds)
    const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
    const [manualHours, setManualHours] = useState<number>(1);
    const [manualMinutes, setManualMinutes] = useState<number>(0);
    const [manualSeconds, setManualSeconds] = useState<number>(0);

    // Time's Up Popup & Looping Alarm State
    const [isTimesUpOpen, setIsTimesUpOpen] = useState<boolean>(false);
    const [timesUpModalTitle, setTimesUpModalTitle] = useState<string>("Time's up!");
    const [timesUpModalSubtitle, setTimesUpModalSubtitle] = useState<string>("");
    const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
    const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Triggered when user clicks "Start" on a task
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

    // Triggered when user clicks "Stop" or completes/checks off an ongoing task: reset timer back to 25 mins
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

    const stopAlarmSound = () => {
        if (alarmAudioRef.current) {
            try {
                alarmAudioRef.current.pause();
                alarmAudioRef.current.currentTime = 0;
            } catch (e) {
                console.warn("Could not pause alarm audio:", e);
            }
            alarmAudioRef.current = null;
        }
        if (alarmIntervalRef.current) {
            clearInterval(alarmIntervalRef.current);
            alarmIntervalRef.current = null;
        }
    };

    const playAlarmSound = () => {
        stopAlarmSound();
        try {
            const audio = new Audio("/alarm.mp3");
            audio.loop = true;
            alarmAudioRef.current = audio;
            audio.play().catch((err) => {
                console.warn("Could not play /alarm.mp3, falling back to Web Audio chime loop:", err);
                playFallbackBeepLoop();
            });
        } catch {
            playFallbackBeepLoop();
        }
    };

    const playFallbackBeepLoop = () => {
        playFallbackBeep();
        // Repeat chime every 1.5 seconds until stopped
        alarmIntervalRef.current = setInterval(() => {
            playFallbackBeep();
        }, 1500);
    };

    useEffect(() => {
        return () => {
            stopAlarmSound();
        };
    }, []);

    const handleCloseTimesUp = () => {
        stopAlarmSound();
        setIsTimesUpOpen(false);
    };

    const playFallbackBeep = () => {
        try {
            const AudioContextClass =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const now = ctx.currentTime;

            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(587.33, now);
            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.5);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(880, now + 0.25);
            gain2.gain.setValueAtTime(0.3, now + 0.25);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.25);
            osc2.stop(now + 0.8);
        } catch (e) {
            console.warn("Web audio fallback failed:", e);
        }
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
            // Completes a focus session and proceeds to break session
            onSessionComplete();
            switchTimerMode("short");
        } else {
            // Currently on break, proceed to next focus session
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
            playAlarmSound();

            if (mode === "focus" || mode === "custom") {
                const nextSessionNum = completedSessions + 1;
                const isAllCompleted = targetSessions > 0 && nextSessionNum >= targetSessions;

                if (isAllCompleted) {
                    setTimesUpModalTitle("Congrats on completing this task");
                    setTimesUpModalSubtitle(
                        activeTaskTitle
                            ? `You've completed all ${targetSessions} session${targetSessions > 1 ? "s" : ""} for ${activeTaskTitle.replace(/^🎯\s*/, "")}! Take a well-deserved rest.`
                            : `You've completed all ${targetSessions} session${targetSessions > 1 ? "s" : ""}! Take a well-deserved rest.`
                    );
                    onSessionComplete();
                    // Reset to 25m Focus mode
                    switchTimerMode("focus");
                } else {
                    setTimesUpModalTitle("Time's up!");
                    setTimesUpModalSubtitle("Focus session completed! Time for a 5-minute break.");
                    onSessionComplete();
                    // Switch to 5-minute break
                    switchTimerMode("short");
                }
            } else {
                // Break session finished
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

    const formatDisplayTime = (totalSeconds: number): string => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleApplyManualTimer = (e: React.FormEvent) => {
        e.preventDefault();
        const h = Math.max(0, parseInt(String(manualHours)) || 0);
        const m = Math.max(0, parseInt(String(manualMinutes)) || 0);
        const s = Math.max(0, parseInt(String(manualSeconds)) || 0);
        const total = h * 3600 + m * 60 + s;
        if (total <= 0) return;

        // When time is too long (> 25 mins), automatically break into 25m Focus sessions + 5m Breaks
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
        setIsManualModalOpen(false);
    };

    // Quick Time Adjustment Handler (+15 / -15 seconds)
    const adjustTime = (seconds: number) => {
        setTimeLeft((prev) => {
            const nextTime = Math.max(0, prev + seconds);
            if (!hasStarted) {
                // When there is no ongoing timer, do not change the progress of the time (keep ring 100% full)
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

    // SVG Ring Progress Calculation
    // When there is no ongoing timer (!hasStarted), keep ring at 100% full circle without changing progress
    const effectiveTotal = Math.max(sessionTotalDuration, timeLeft, 1);
    const progressRatio = hasStarted
        ? Math.min(1, Math.max(0, timeLeft / effectiveTotal))
        : 1;
    const ringCircumference = 2 * Math.PI * 120; // 753.98
    const strokeOffset = ringCircumference * (1 - progressRatio);

    const totalManualSeconds = manualHours * 3600 + manualMinutes * 60 + manualSeconds;
    const isLongDuration = totalManualSeconds > 25 * 60;
    const previewSessions = isLongDuration ? Math.max(2, Math.round(totalManualSeconds / 1800)) : 1;

    return (
        <section
            className={`w-full h-full rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between relative overflow-hidden border shadow-sm transition-colors ${isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5"
                }`}
        >
            {/* Segmented Mode Tabs + Manual Timer Button: 2x2 grid on small screens, strictly 1 row on full size */}
            <div
                className={`relative z-10 p-1 rounded-2xl sm:rounded-full grid grid-cols-2 sm:flex sm:flex-row sm:flex-nowrap items-center justify-center gap-1 mb-2 border w-full max-w-xs sm:w-auto sm:max-w-none ${isDark ? "bg-[#161b1a] border-white/5 text-slate-300" : "bg-[#ebf6ef] border-black/5 text-[#57615c]"
                    }`}
            >
                {(["focus", "short", "long"] as const).map((tabKey) => (
                    <button
                        key={tabKey}
                        onClick={() => switchTimerMode(tabKey)}
                        className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-xl sm:rounded-full text-[10.5px] sm:text-[11px] font-semibold transition cursor-pointer flex items-center justify-center text-center whitespace-nowrap flex-shrink-0 ${mode === tabKey
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

                {/* Manual Timer Button */}
                <button
                    onClick={() => {
                        const h = Math.floor(timeLeft / 3600);
                        const m = Math.floor((timeLeft % 3600) / 60);
                        const s = timeLeft % 60;
                        setManualHours(h);
                        setManualMinutes(m || 25);
                        setManualSeconds(s);
                        setIsManualModalOpen(true);
                    }}
                    title="Set custom hours, minutes, and seconds"
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-xl sm:rounded-full text-[10.5px] sm:text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap flex-shrink-0 ${mode === "custom"
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

            {/* Rounded Rectangle Session Progress Bars (Pure indicator div elements) */}
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
                                    className={`h-2 rounded-full transition-all duration-300 ${isCompleted
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

            {/* Circular Countdown Dial with transparent -15 and +15 Time Adjustment Controls Beside It */}
            <div className="relative z-10 my-1 sm:my-1.5 flex items-center justify-center gap-3 sm:gap-6 w-full max-w-sm">
                {/* -15 Seconds Button (Transparent, strictly -15) */}
                <button
                    type="button"
                    onClick={() => adjustTime(-15)}
                    disabled={timeLeft <= 0}
                    title="Subtract 15 seconds"
                    aria-label="Subtract 15 seconds"
                    className={`bg-transparent border-0 border-none p-1 font-mono font-bold text-base sm:text-lg transition-all select-none ${timeLeft <= 0
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
                        <span className={`${timeLeft >= 3600 ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"} font-black font-mono tracking-tight leading-none`}>
                            {formatDisplayTime(timeLeft)}
                        </span>
                        {/* Session indicator badge: high contrast in both dark and light modes */}
                        <div
                            className={`inline-flex items-center px-3 py-0.5 mt-2 rounded-full text-[11px] font-semibold shadow-xs border ${isDark
                                    ? "bg-[#161b1a] border-white/10 text-[#adf1dc]"
                                    : "bg-[#ebf6ef] border-black/5 text-[#002019]"
                                }`}
                        >
                            <span>Session {completedSessions + 1}</span>
                        </div>
                    </div>
                </div>

                {/* +15 Seconds Button (Transparent, strictly +15) */}
                <button
                    type="button"
                    onClick={() => adjustTime(15)}
                    title="Add 15 seconds"
                    aria-label="Add 15 seconds"
                    className={`bg-transparent border-0 border-none p-1 font-mono font-bold text-base sm:text-lg transition-all select-none cursor-pointer hover:scale-115 active:scale-95 opacity-60 hover:opacity-100 ${isDark ? "text-[#adf1dc]" : "text-[#256959]"
                        }`}
                >
                    +15
                </button>
            </div>

            {/* Tactile Action Buttons */}
            <div className="relative z-10 flex items-center justify-center gap-3 mt-1.5">
                <button
                    onClick={handleResetTimer}
                    title="Reset timer"
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition active:scale-95 cursor-pointer ${isDark
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
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition active:scale-95 cursor-pointer ${isDark
                        ? "bg-[#161b1a] border-white/5 hover:bg-[#283330]"
                        : "bg-[#ebf6ef] border-black/5 hover:bg-zinc-200"
                        }`}
                >
                    <img src="/skip_next.png" alt="Next" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                </button>
            </div>

            {/* Manual Timer Modal (Hours, Minutes, Seconds) */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div
                        className={`w-full max-w-[440px] rounded-3xl p-6 border shadow-2xl relative ${isDark
                            ? "bg-[#1f2725] border-white/10 text-[#e8f3ec]"
                            : "bg-white border-black/5 text-[#141e19]"
                            }`}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#adf1dc] text-[#002019] flex items-center justify-center font-bold">
                                    <img src="/Timer.png" alt="Timer" className="w-5 h-5 object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Set Manual Timer</h3>
                                    <p className="text-[11px] opacity-60">Set custom hours, minutes & seconds</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsManualModalOpen(false)}
                                aria-label="Close Manual Timer"
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                                    isDark
                                        ? "bg-[#161b1a] text-slate-300 hover:text-white hover:bg-[#283330] border border-white/10"
                                        : "bg-[#ebf6ef] text-[#002019] hover:bg-[#dfeee5]"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleApplyManualTimer} className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {/* Hours */}
                                <div className="flex flex-col items-center">
                                    <label className="text-[11px] font-bold mb-1 opacity-75">Hours</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={manualHours}
                                        onChange={(e) =>
                                            setManualHours(Math.max(0, parseInt(e.target.value) || 0))
                                        }
                                        className={`w-full text-center h-12 rounded-2xl text-lg font-bold font-mono border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${isDark
                                            ? "bg-[#161b1a] border-white/5"
                                            : "bg-[#ebf6ef] border-black/5"
                                            }`}
                                    />
                                    <span className="text-[10px] opacity-50 mt-1">0 - 23 hr</span>
                                </div>

                                {/* Minutes */}
                                <div className="flex flex-col items-center">
                                    <label className="text-[11px] font-bold mb-1 opacity-75">Minutes</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={manualMinutes}
                                        onChange={(e) =>
                                            setManualMinutes(
                                                Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                                            )
                                        }
                                        className={`w-full text-center h-12 rounded-2xl text-lg font-bold font-mono border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${isDark
                                            ? "bg-[#161b1a] border-white/5"
                                            : "bg-[#ebf6ef] border-black/5"
                                            }`}
                                    />
                                    <span className="text-[10px] opacity-50 mt-1">0 - 59 min</span>
                                </div>

                                {/* Seconds */}
                                <div className="flex flex-col items-center">
                                    <label className="text-[11px] font-bold mb-1 opacity-75">Seconds</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={manualSeconds}
                                        onChange={(e) =>
                                            setManualSeconds(
                                                Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                                            )
                                        }
                                        className={`w-full text-center h-12 rounded-2xl text-lg font-bold font-mono border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${isDark
                                            ? "bg-[#161b1a] border-white/5"
                                            : "bg-[#ebf6ef] border-black/5"
                                            }`}
                                    />
                                    <span className="text-[10px] opacity-50 mt-1">0 - 59 sec</span>
                                </div>
                            </div>

                            {/* Long Duration Notice */}
                            {isLongDuration && (
                                <div className="p-2.5 rounded-2xl bg-[#ebf6ef] dark:bg-[#161b1a] border border-[#adf1dc]/40 flex items-start gap-2 text-xs">
                                    <span className="material-symbols-outlined text-[#256959] dark:text-[#adf1dc] text-[18px] flex-shrink-0 mt-0.5">
                                        schedule
                                    </span>
                                    <div className="opacity-85 text-[11px]">
                                        <span>Duration exceeds 25m: automatically includes <strong>5 min Break</strong> sessions. Shows <strong>25:00</strong> with <strong>{previewSessions} session bars</strong>.</span>
                                    </div>
                                </div>
                            )}

                            {/* Quick Presets (Centered layout) */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-1.5 text-center">
                                    Quick Presets
                                </label>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    {[
                                        { label: "15m", h: 0, m: 15, s: 0 },
                                        { label: "25m", h: 0, m: 25, s: 0 },
                                        { label: "45m", h: 0, m: 45, s: 0 },
                                        { label: "1 hr", h: 1, m: 0, s: 0 },
                                        { label: "1h 30m", h: 1, m: 30, s: 0 },
                                        { label: "2 hr", h: 2, m: 0, s: 0 },
                                    ].map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => {
                                                setManualHours(preset.h);
                                                setManualMinutes(preset.m);
                                                setManualSeconds(preset.s);
                                            }}
                                            className={`px-2.5 py-1 rounded-full text-xs transition cursor-pointer border ${manualHours === preset.h &&
                                                manualMinutes === preset.m &&
                                                manualSeconds === preset.s
                                                ? "bg-[#adf1dc] text-[#002019] border-[#adf1dc] font-bold"
                                                : isDark
                                                    ? "bg-[#161b1a] border-white/5 hover:bg-[#283330]"
                                                    : "bg-[#ebf6ef] border-black/5 hover:bg-[#e0ebe3]"
                                                }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsManualModalOpen(false)}
                                    className="px-4 py-2 rounded-full text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-full bg-[#adf1dc] text-[#002019] font-bold text-xs hover:scale-105 active:scale-95 transition shadow-sm cursor-pointer"
                                >
                                    Apply Timer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Time's Up Popup Modal with Looping Alarm */}
            {isTimesUpOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={handleCloseTimesUp}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 border shadow-2xl relative text-center flex flex-col items-center transition-all animate-in zoom-in-95 duration-200 ${isDark
                            ? "bg-[#1f2725] border-white/10 text-[#e8f3ec]"
                            : "bg-white border-black/5 text-[#141e19]"
                            }`}
                    >
                        {/* Application Logo */}
                        <div className="w-20 h-20 rounded-2xl bg-[#adf1dc]/20 flex items-center justify-center p-2 mb-4">
                            <img
                                src="/logo.png"
                                alt="Pomodoro Logo"
                                className="w-full h-full object-contain drop-shadow-sm"
                            />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-black tracking-tight mb-2">
                            {timesUpModalTitle}
                        </h2>

                        {/* Description */}
                        <p className="text-xs sm:text-sm opacity-70 mb-6 leading-relaxed">
                            {timesUpModalSubtitle}
                        </p>

                        {/* Close Button (Stops looping alarm) */}
                        <button
                            type="button"
                            onClick={handleCloseTimesUp}
                            className="w-full h-12 rounded-2xl bg-[#adf1dc] text-[#002019] font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition shadow-md shadow-[#adf1dc]/25 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                            <span>Close</span>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}