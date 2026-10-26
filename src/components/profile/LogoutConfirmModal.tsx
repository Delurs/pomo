import { motion, AnimatePresence } from "motion/react";
import { modalBackdropVariants, modalDialogVariants } from "../ui/FluidAnimations";

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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            variants={modalDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`p-6 rounded-3xl border shadow-2xl max-w-sm w-full text-center transition-colors ${
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
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isDark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    : "border-black/10 bg-black/5 text-slate-700 hover:bg-black/10"
                }`}
              >
                No
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-sm transition cursor-pointer select-none"
              >
                Yes
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
