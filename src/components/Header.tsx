interface HeaderProps {
    isDark: boolean;
    setIsDark: (val: boolean) => void;
    completedSessions: number;
    onOpenProfile?: () => void;
}

export default function Header({
    isDark,
    setIsDark,
    completedSessions,
    onOpenProfile,
}: HeaderProps) {
    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b transition-colors ${isDark
                ? "bg-[#141e19]/80 border-white/5"
                : "bg-[#f1fcf4]/80 border-black/5"
                }`}
        >
            <div className="h-16 max-w-[1280px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2">
                {/* Brand Logo & Title (Always visible, even when minimized) */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                    <img
                        src="/logo.png"
                        alt="Pomodoro Tortoise Logo"
                        className="w-8 h-8 sm:w-11 sm:h-11 object-contain drop-shadow-sm transition-transform hover:scale-105 cursor-pointer"
                    />
                    <img
                        src="/logo-name.png"
                        alt="Pomodoro Tortoise"
                        className={`h-4.5 sm:h-6 object-contain transition-all ${isDark ? "brightness-[2.2] contrast-125" : ""
                            }`}
                    />
                </div>

                {/* Right Controls: Theme Toggle & Profile Button */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

                    <button
                        onClick={() => setIsDark(!isDark)}
                        aria-label="Toggle Light and Dark Mode"
                        className={`p-0.5 sm:p-1 rounded-full border transition flex items-center cursor-pointer flex-shrink-0 ${isDark
                            ? "bg-[#1f2725] border-white/10 text-[#adf1dc]"
                            : "bg-white border-black/5 text-[#256959] shadow-sm"
                            }`}
                    >
                        <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition ${!isDark ? "bg-[#adf1dc] text-[#002019]" : "opacity-40"
                                }`}
                        >
                            <img src="/light_mode.png" alt="Light mode" className="w-4 h-4 object-contain" />
                        </span>
                        <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition ${isDark ? "bg-[#256959] text-white" : "opacity-40"
                                }`}
                        >
                            <img src="/dark_mode.png" alt="Dark mode" className="w-4 h-4 object-contain" />
                        </span>
                    </button>

                    {/* Profile Button beside the right side of dark mode button */}
                    <button
                        type="button"
                        onClick={onOpenProfile}
                        aria-label="Open Profile and Focus Analytics"
                        title="Profile & Analytics"
                        className={`flex items-center gap-1.5 pl-1 sm:pl-1.5 pr-2 sm:pr-3 py-1 rounded-full border transition-all cursor-pointer flex-shrink-0 ${isDark
                            ? "bg-[#1f2725] border-white/10 hover:border-[#adf1dc]/40 hover:bg-[#29332e] text-[#e8f3ec]"
                            : "bg-white border-black/5 hover:border-[#256959]/30 hover:bg-[#f1fcf4] text-[#141e19] shadow-sm"
                            }`}
                    >
                        <div className="relative">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#adf1dc] text-[#002019] flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden p-0.5">
                                <img src="/profile.png" alt="Profile" className="w-4.5 h-4.5 object-contain" />
                            </div>
                        </div>
                        <span className="hidden min-[440px]:inline text-xs font-semibold tracking-tight">Profile</span>
                    </button>
                </div>
            </div>
        </header>
    );
}