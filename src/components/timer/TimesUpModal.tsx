import { motion, AnimatePresence } from "motion/react";
import { modalBackdropVariants, modalDialogVariants } from "../ui/FluidAnimations";

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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            variants={modalDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 border shadow-2xl relative text-center flex flex-col items-center transition-colors ${
              isDark
                ? "bg-[#1f2725] border-white/10 text-[#e8f3ec]"
                : "bg-white border-black/5 text-[#141e19]"
            }`}
          >
            {/* Application Logo */}
            <motion.div
              initial={{ scale: 0.7, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              className="w-20 h-20 rounded-2xl bg-[var(--theme-accent,#adf1dc)]/20 flex items-center justify-center p-2 mb-4"
            >
              <img
                src="/logo.png"
                alt="Pomodoro Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-black tracking-tight mb-2">{title}</h2>

            {/* Description */}
            <p className="text-xs sm:text-sm opacity-70 mb-6 leading-relaxed">{subtitle}</p>

            {/* Close Button (Stops looping alarm) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              onClick={onClose}
              className="w-full h-12 rounded-2xl bg-[var(--theme-accent,#adf1dc)] text-[#002019] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-md shadow-[var(--theme-accent,#adf1dc)]/25 cursor-pointer select-none"
            >
              <img src="/close.png" alt="Close" className="w-4 h-4 object-contain inline-block" />
              <span>Close</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
