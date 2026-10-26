import React, { useState } from "react";
import { motion, AnimatePresence, type HTMLMotionProps, type Variants } from "motion/react";
import { ORDERED_THEME_COLORS, THEME_COLORS, type ThemeColor } from "../../types/themeColors";

/* =========================================================================
   1. FLUID BUTTON
   Cartoonish water-like spring physics with optional water ripple click effect
   ========================================================================= */

export interface FluidButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  ripple?: boolean;
}

interface RipplePoint {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const FluidButton = React.forwardRef<HTMLButtonElement, FluidButtonProps>(
  (
    {
      children,
      className = "",
      onClick,
      ripple = true,
      whileHover,
      whileTap,
      transition,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<RipplePoint[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.6;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        const id = Date.now() + Math.random();
        setRipples((prev) => [...prev, { id, x, y, size }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 650);
      }
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        whileHover={whileHover ?? { scale: 1.04, y: -1.5 }}
        whileTap={whileTap ?? { scale: 0.94 }}
        transition={
          transition ?? {
            type: "spring",
            stiffness: 500,
            damping: 18,
            mass: 0.8,
          }
        }
        onClick={handleClick}
        className={`relative overflow-hidden cursor-pointer select-none ${className}`}
        {...props}
      >
        {children}
        {ripple && (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  initial={{ scale: 0, opacity: 0.35 }}
                  animate={{ scale: 1, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    left: r.x,
                    top: r.y,
                    width: r.size,
                    height: r.size,
                    borderRadius: "50%",
                    backgroundColor: "currentColor",
                  }}
                />
              ))}
            </AnimatePresence>
          </span>
        )}
      </motion.button>
    );
  }
);
FluidButton.displayName = "FluidButton";

/* =========================================================================
   2. THEME TOGGLER BUTTON
   Exact @animate-ui/buttons-theme-toggler animation with icon rotate/scale/blur
   ========================================================================= */

export interface ThemeTogglerButtonProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

export function ThemeTogglerButton({
  isDark,
  onToggle,
  className = "",
  ariaLabel = "Toggle light and dark mode",
  title = "Toggle Light / Dark Mode",
}: ThemeTogglerButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      aria-label={ariaLabel}
      title={title}
      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center cursor-pointer transition-colors shadow-xs select-none flex-shrink-0 overflow-hidden ${
        isDark
          ? "bg-[#1f2725] border-white/10 text-[var(--theme-accent,#adf1dc)] hover:border-white/25"
          : "bg-white border-black/5 text-[var(--theme-deep,#256959)] hover:border-black/15 shadow-sm"
      } ${className}`}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={isDark ? "dark" : "light"}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <img
            src={isDark ? "/dark_mode.png" : "/light_mode.png"}
            alt={isDark ? "Dark mode" : "Light mode"}
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain"
          />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/* =========================================================================
   3. AVATAR GROUP COLOR PICKER
   @animate-ui/react/primitives/avatar-group style bouncy spring rise (-30%)
   with shared gliding tooltip (layoutId="color-picker-tooltip")
   ========================================================================= */

export interface AvatarGroupColorPickerProps {
  currentColor: ThemeColor;
  onSelectColor: (c: ThemeColor) => void;
  isDark: boolean;
  onClose?: () => void;
}

export function AvatarGroupColorPicker({
  currentColor,
  onSelectColor,
  isDark,
  onClose,
}: AvatarGroupColorPickerProps) {
  const [hoveredColor, setHoveredColor] = useState<ThemeColor | null>(null);

  return (
    <div
      role="radiogroup"
      aria-label="Select Theme Color"
      className="relative flex items-center gap-1.5 p-1.5"
      onMouseLeave={() => setHoveredColor(null)}
    >
      {ORDERED_THEME_COLORS.map((c) => {
        const config = THEME_COLORS[c];
        const isSelected = currentColor === c;
        const isHovered = hoveredColor === c;

        return (
          <div key={c} className="relative flex flex-col items-center">
            {/* Gliding Tooltip above hovered color circle */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  layoutId="color-picker-tooltip"
                  initial={{ opacity: 0, y: 4, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 29 }}
                  className={`absolute -top-7.5 z-30 pointer-events-none px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap shadow-md flex items-center justify-center ${
                    isDark
                      ? "bg-[#141e19] text-white border border-white/15 shadow-black/40"
                      : "bg-white text-[#141e19] border border-black/10 shadow-black/10"
                  }`}
                >
                  <span>
                    {config.label}
                    {c === "green" ? " (default)" : ""}
                  </span>
                  {/* Tooltip arrow */}
                  <div
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${
                      isDark
                        ? "bg-[#141e19] border-white/15"
                        : "bg-white border-black/10"
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouncy Color Swatch Circle */}
            <motion.button
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Select ${config.label} theme`}
              onMouseEnter={() => setHoveredColor(c)}
              onFocus={() => setHoveredColor(c)}
              onBlur={() => setHoveredColor((prev) => (prev === c ? null : prev))}
              onClick={() => {
                onSelectColor(c);
                onClose?.();
              }}
              whileTap={{ scale: 0.92 }}
              animate={
                isHovered
                  ? { y: -8, scale: 1.18 }
                  : { y: 0, scale: isSelected ? 1.08 : 1 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 17 }}
              className={`relative w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full cursor-pointer flex items-center justify-center transition-shadow select-none ${
                isSelected
                  ? "ring-2 ring-offset-2 ring-[var(--theme-deep,#256959)] dark:ring-white shadow-sm"
                  : "opacity-80 hover:opacity-100 ring-1 ring-black/10 dark:ring-white/20"
              } ${isDark ? "ring-offset-[#1f2725]" : "ring-offset-white"}`}
              style={{
                backgroundColor: config.dotColor,
              }}
            >
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="w-2 h-2 rounded-full bg-black/60 dark:bg-black/75 block"
                />
              )}
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================================
   4. MODAL POP-UP ANIMATION VARIANTS
   Cartoonish water-like bubble pop-up spring physics
   ========================================================================= */

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const modalDialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 32,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: {
      duration: 0.16,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};
