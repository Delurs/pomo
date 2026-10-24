import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface PasswordChangeDrawerProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordChangeDrawer({
  isDark,
  isOpen,
  onClose,
}: PasswordChangeDrawerProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback({ type: null, message: "" });

    if (!currentPassword) {
      setPasswordFeedback({ type: "error", message: "Please enter your current password." });
      return;
    }
    if (!newPassword) {
      setPasswordFeedback({ type: "error", message: "Please enter a new password." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: "error",
        message: "New password must be at least 6 characters long.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordFeedback({
        type: "error",
        message: "New password must be different from your current password.",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // 1. Get current authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        throw new Error("Active user session could not be verified. Please log in again.");
      }

      // 2. Validate current password against Supabase
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error("Incorrect current password. Please try again.");
      }

      // 3. Update to the new password in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setPasswordFeedback({
        type: "success",
        message: "Password changed successfully!",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setPasswordFeedback({ type: null, message: "" });
        onClose();
      }, 1800);
    } catch (err: any) {
      setPasswordFeedback({
        type: "error",
        message: err.message || "Failed to update password. Please try again.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordFeedback({ type: null, message: "" });
    onClose();
  };

  return (
    <form
      onSubmit={handlePasswordSubmit}
      className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 animate-in fade-in duration-150"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold flex items-center gap-1.5 opacity-80">
          <img src="/lock_reset.png" alt="Lock Reset" className="w-4 h-4 object-contain inline-block" />
          <span>Update Password</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        {/* 1. Current Password */}
        <div>
          <label className="block text-[11px] font-semibold opacity-70 mb-1">
            Current Password
          </label>
          <input
            type="password"
            autoFocus
            required
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={`w-full h-9 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${
              isDark
                ? "bg-[#1f2725] border-white/10 placeholder-white/30"
                : "bg-white border-black/10 placeholder-black/30"
            }`}
          />
        </div>

        {/* 2. New Password */}
        <div>
          <label className="block text-[11px] font-semibold opacity-70 mb-1">
            New Password
          </label>
          <input
            type="password"
            required
            placeholder="New password (min. 6)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`w-full h-9 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${
              isDark
                ? "bg-[#1f2725] border-white/10 placeholder-white/30"
                : "bg-white border-black/10 placeholder-black/30"
            }`}
          />
        </div>

        {/* 3. Confirm New Password */}
        <div>
          <label className="block text-[11px] font-semibold opacity-70 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full h-9 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${
              isDark
                ? "bg-[#1f2725] border-white/10 placeholder-white/30"
                : "bg-white border-black/10 placeholder-black/30"
            }`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {passwordFeedback.message ? (
          <div
            className={`text-xs font-semibold ${
              passwordFeedback.type === "success" ? "text-emerald-500" : "text-rose-400"
            }`}
          >
            {passwordFeedback.message}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-full text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="px-4 py-1.5 rounded-full bg-[#adf1dc] text-[#002019] text-xs font-bold hover:scale-105 transition cursor-pointer shadow-sm disabled:opacity-60"
          >
            {isUpdatingPassword ? "Verifying..." : "Update Password"}
          </button>
        </div>
      </div>
    </form>
  );
}
