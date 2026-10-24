interface LogoutConfirmModalProps {
  isOpen: boolean;
  isDark: boolean;
  isGuest: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmModal({
  isOpen,
  isDark,
  isGuest,
  onConfirm,
  onCancel,
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`p-6 rounded-3xl border shadow-2xl max-w-sm w-full text-center transition-all animate-in zoom-in-95 duration-150 ${
          isDark
            ? "bg-[#1f2725] border-white/10 text-[#e8f3ec]"
            : "bg-white border-black/10 text-[#141e19]"
        }`}
      >
        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-red-500/15 text-red-500">
          <img src="/logout.png" alt="Log out" className="w-6 h-6 object-contain" />
        </div>
        <h4 className="text-base font-bold mb-1">
          {isGuest ? "Exit Mindful Guest Mode" : "Confirm Log Out"}
        </h4>
        <p className="text-sm opacity-80 mb-5">
          {isGuest
            ? "Are you sure you want to exit Mindful Guest mode?"
            : "Are you sure you want to log out?"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer hover:opacity-90 ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                : "border-black/10 bg-black/5 text-slate-700 hover:bg-black/10"
            }`}
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-sm transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
