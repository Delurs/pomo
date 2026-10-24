interface TimesUpModalProps {
  isOpen: boolean;
  isDark: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
}

export default function TimesUpModal({
  isOpen,
  isDark,
  title,
  subtitle,
  onClose,
}: TimesUpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 border shadow-2xl relative text-center flex flex-col items-center transition-all animate-in zoom-in-95 duration-200 ${
          isDark
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
        <h2 className="text-2xl font-black tracking-tight mb-2">{title}</h2>

        {/* Description */}
        <p className="text-xs sm:text-sm opacity-70 mb-6 leading-relaxed">{subtitle}</p>

        {/* Close Button (Stops looping alarm) */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 rounded-2xl bg-[#adf1dc] text-[#002019] font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition shadow-md shadow-[#adf1dc]/25 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
          <span>Close</span>
        </button>
      </div>
    </div>
  );
}
