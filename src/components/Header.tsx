import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
    type ThemeColor,
    THEME_COLORS,
} from "../types/themeColors";
import {
    ThemeTogglerButton,
    AvatarGroupColorPicker,
} from "./ui/FluidAnimations";

interface HeaderProps {
    isDark: boolean;
    setIsDark: (val: boolean) => void;
    completedSessions: number;
    onOpenProfile?: () => void;
    currentColor?: ThemeColor;
    onSelectColor?: (color: ThemeColor) => void;
    isGuest?: boolean;
}

export default function Header({
    isDark,
    setIsDark,
    completedSessions: _completedSessions,
    onOpenProfile,
    currentColor = "green",
    onSelectColor,
    isGuest = false,
}: HeaderProps) {
    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
    const colorMenuRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside or pressing Escape
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
                setIsColorMenuOpen(false);
            }
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsColorMenuOpen(false);
            }
        }

        if (isColorMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isColorMenuOpen]);

    return (
        <header
            style={{
                backgroundColor: isDark
                    ? `${THEME_COLORS[currentColor]?.bgDark || "#141e19"}cc`
                    : `${THEME_COLORS[currentColor]?.bgLight || "#f1fcf4"}cc`,
            }}
            className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b transition-colors border-black/5 dark:border-white/5"
        >
            <div className="h-16 max-w-[1280px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2">
                {/* Brand Logo & Title (Routes back to / Landing Page) */}
                <Link
                    to="/"
                    title="Return to Landing Page"
                    className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 cursor-pointer select-none"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="flex items-center gap-2 sm:gap-2.5"
                    >
                        <img
                            src="/logo.png"
                            alt="Pomodoro Tortoise Logo"
                            className="w-8 h-8 sm:w-11 sm:h-11 object-contain drop-shadow-sm transition-transform"
                        />
                        <img
                            src="/logo-name.png"
                            alt="Pomodoro Tortoise"
                            className={`h-4.5 sm:h-6 object-contain transition-all ${isDark ? "brightness-[2.2] contrast-125" : ""
                                }`}
                        />
                    </motion.div>
                </Link>

                {/* Right Controls: Sign In to Sync (Guest), Theme Toggle, Color Button, & Profile Button */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
                    {isGuest && (
                        <Link
                            to="/login"
                            title="Sign in to synchronize your tasks and analytics across devices"
                            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#ADF1DC] text-[#002019] shadow-xs hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
                        >
                            <img
                                src="/login.png"
                                alt=""
                                className="w-3.5 h-3.5 object-contain"
                            />
                            <span>Sign In to Sync</span>
                        </Link>
                    )}

                    {/* Animated Theme Toggler Button */}
                    <ThemeTogglerButton
                        isDark={isDark}
                        onToggle={() => setIsDark(!isDark)}
                    />

                    {/* Expandable Theme Color Button & Palette Popover */}
                    <div ref={colorMenuRef} className="relative flex items-center">
                        <motion.button
                            type="button"
                            onClick={() => setIsColorMenuOpen((prev) => !prev)}
                            whileHover={{ scale: 1.04, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            aria-expanded={isColorMenuOpen}
                            aria-label={`Theme color options, currently ${THEME_COLORS[currentColor]?.label || "Green"}`}
                            title={`Theme color (${THEME_COLORS[currentColor]?.label || "Green"}) - click to change`}
                            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border transition-colors duration-150 cursor-pointer flex-shrink-0 ${isDark
                                ? "bg-[#1f2725] border-white/10 hover:border-white/25 text-[#e8f3ec]"
                                : "bg-white border-black/5 hover:border-black/15 text-[#141e19] shadow-sm"
                                } ${isColorMenuOpen ? "ring-2 ring-[var(--theme-accent,#adf1dc)]/70 shadow-sm" : ""}`}
                        >
                            {/* Color Dot Preview */}
                            <span
                                style={{
                                    backgroundColor: THEME_COLORS[currentColor]?.dotColor,
                                }}
                                className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full shadow-xs flex-shrink-0 ring-1 ring-black/15 dark:ring-white/20"
                            />
                            <span className="hidden sm:inline text-xs font-semibold capitalize">
                                {THEME_COLORS[currentColor]?.label || "Theme"}
                            </span>
                            <img
                                src={isColorMenuOpen ? "/chevron_up.png" : "/chevron_down.png"}
                                alt=""
                                className={`w-3 h-3 object-contain opacity-60 transition-transform ${isDark ? "brightness-200 invert" : ""
                                    }`}
                            />
                        </motion.button>

                        {/* Animated Color Options Popover */}
                        <AnimatePresence>
                            {isColorMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                                    className={`absolute top-full right-0 mt-2 z-50 rounded-2xl border shadow-xl flex items-center ${isDark
                                        ? "bg-[#1f2725] border-white/15 shadow-black/50"
                                        : "bg-white border-black/10 shadow-black/10"
                                        }`}
                                >
                                    <AvatarGroupColorPicker
                                        currentColor={currentColor}
                                        onSelectColor={(c) => {
                                            onSelectColor?.(c);
                                            setIsColorMenuOpen(false);
                                        }}
                                        isDark={isDark}
                                        onClose={() => setIsColorMenuOpen(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile Button beside the right side of color button */}
                    <motion.button
                        type="button"
                        onClick={onOpenProfile}
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        aria-label="Open Profile and Focus Analytics"
                        title="Profile & Analytics"
                        className={`flex items-center gap-1.5 pl-1 sm:pl-1.5 pr-2 sm:pr-3 py-1 rounded-full border transition-colors duration-150 cursor-pointer flex-shrink-0 ${isDark
                            ? "bg-[#1f2725] border-white/10 hover:border-white/20 hover:bg-[#29332e] text-[#e8f3ec]"
                            : "bg-white border-black/5 hover:border-black/15 hover:bg-[#f1fcf4] text-[#141e19] shadow-sm"
                            }`}
                    >
                        <div className="relative">
                            <div
                                style={{
                                    backgroundColor: THEME_COLORS[currentColor]?.accent,
                                }}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[#002019] flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden p-0.5"
                            >
                                <img src="/profile.png" alt="Profile" className="w-4.5 h-4.5 object-contain" />
                            </div>
                        </div>
                        <span className="hidden min-[520px]:inline text-xs font-semibold tracking-tight">Profile</span>
                    </motion.button>
                </div>
            </div>
        </header>
    );
}
