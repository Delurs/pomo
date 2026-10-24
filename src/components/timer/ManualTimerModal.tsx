import { useState, useEffect } from "react";

interface ManualTimerModalProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApply: (totalSeconds: number) => void;
  initialSeconds?: number;
}

export default function ManualTimerModal({
  isOpen,
  isDark,
  onClose,
  onApply,
  initialSeconds = 25 * 60,
}: ManualTimerModalProps) {
  const [manualHours, setManualHours] = useState(0);
  const [manualMinutes, setManualMinutes] = useState(25);
  const [manualSeconds, setManualSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const h = Math.floor(initialSeconds / 3600);
      const m = Math.floor((initialSeconds % 3600) / 60);
      const s = initialSeconds % 60;
      setManualHours(h);
      setManualMinutes(m || (h === 0 ? 25 : 0));
      setManualSeconds(s);
    }
  }, [isOpen, initialSeconds]);

  if (!isOpen) return null;

  const totalManualSeconds = manualHours * 3600 + manualMinutes * 60 + manualSeconds;
  const isLongDuration = totalManualSeconds > 25 * 60;
  const previewSessions = isLongDuration ? Math.max(2, Math.round(totalManualSeconds / 1800)) : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Math.max(0, parseInt(String(manualHours)) || 0);
    const m = Math.max(0, parseInt(String(manualMinutes)) || 0);
    const s = Math.max(0, parseInt(String(manualSeconds)) || 0);
    const total = h * 3600 + m * 60 + s;
    if (total <= 0) return;
    onApply(total);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[440px] rounded-3xl p-6 border shadow-2xl relative ${
          isDark
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
            onClick={onClose}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <label className="text-[11px] font-bold mb-1 opacity-75">Hours</label>
              <input
                type="number"
                min="0"
                max="23"
                value={manualHours}
                onChange={(e) => setManualHours(Math.max(0, parseInt(e.target.value) || 0))}
                className={`w-full text-center h-12 rounded-2xl text-lg font-bold font-mono border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${
                  isDark ? "bg-[#161b1a] border-white/5" : "bg-[#ebf6ef] border-black/5"
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
                  setManualMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))
                }
                className={`w-full text-center h-12 rounded-2xl text-lg font-bold font-mono border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${
                  isDark ? "bg-[#161b1a] border-white/5" : "bg-[#ebf6ef] border-black/5"
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
                  setManualSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))
                }
                className={`w-full text-center h-12 rounded-2xl text-lg font-bold font-mono border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${
                  isDark ? "bg-[#161b1a] border-white/5" : "bg-[#ebf6ef] border-black/5"
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
                <span>
                  Duration exceeds 25m: automatically includes <strong>5 min Break</strong>{" "}
                  sessions. Shows <strong>25:00</strong> with{" "}
                  <strong>{previewSessions} session bars</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Quick Presets */}
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
                  className={`px-2.5 py-1 rounded-full text-xs transition cursor-pointer border ${
                    manualHours === preset.h &&
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
              onClick={onClose}
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
  );
}
