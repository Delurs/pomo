import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export interface ResetPasswordPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onComplete: () => void;
  onLater: () => void;
}

export default function ResetPasswordPage({
  isDark,
  setIsDark,
  onComplete,
  onLater,
}: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPassword) {
      setErrorMsg("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccessMsg("Password successfully updated! Redirecting to your sanctuary...");
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `w-full h-9 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] transition ${
    isDark
      ? "bg-[#161b1a] border-white/10 text-white placeholder-white/30"
      : "bg-white border-black/10 text-black placeholder-black/30"
  }`;
  const inputIconClass =
    "w-4 h-4 object-contain absolute left-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none";
  const labelClass = "block text-[11px] font-semibold opacity-75 mb-0.5";

  return (
    <div
      className={`h-screen w-full overflow-hidden flex relative transition-colors duration-300 ${
        isDark ? "bg-[#141e19] text-[#e8f3ec]" : "bg-[#f1fcf4] text-[#141e19]"
      }`}
    >
      {/* Theme Toggle (top-right) */}
      <button
        onClick={() => setIsDark(!isDark)}
        aria-label="Toggle Light and Dark Mode"
        className={`absolute top-4 right-4 sm:right-6 z-20 p-1 rounded-full border transition flex items-center cursor-pointer ${
          isDark
            ? "bg-[#1f2725] border-white/10 text-[#adf1dc]"
            : "bg-white border-black/5 text-[#256959] shadow-sm"
        }`}
      >
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
            !isDark ? "bg-[#adf1dc] text-[#002019]" : "opacity-40"
          }`}
        >
          <img src="/light_mode.png" alt="Light mode" className="w-4 h-4 object-contain" />
        </span>
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
            isDark ? "bg-[#256959] text-white" : "opacity-40"
          }`}
        >
          <img src="/dark_mode.png" alt="Dark mode" className="w-4 h-4 object-contain" />
        </span>
      </button>

      {/* LEFT: Brand showcase */}
      <section
        className={`hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden ${
          isDark
            ? "bg-gradient-to-br from-[#1a2a24] via-[#16221d] to-[#0f1814]"
            : "bg-gradient-to-br from-[#d9f7e8] via-[#c4f0dc] to-[#adf1dc]"
        }`}
      >
        {/* Ambient glows */}
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-[#adf1dc]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-24 w-[30rem] h-[30rem] rounded-full bg-[#256959]/25 blur-3xl pointer-events-none" />
        <div
          className={`absolute w-[34rem] h-[34rem] rounded-full border pointer-events-none ${
            isDark ? "border-white/5" : "border-[#256959]/10"
          }`}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-10">
          <img
            src="/logo.png"
            alt="Pomodoro Tortoise"
            className="w-72 xl:w-92 max-h-[46vh] object-contain drop-shadow-2xl"
          />
          <img
            src="/logo-name.png"
            alt="Pomodoro Tortoise"
            className={`h-9 xl:h-12 mt-5 object-contain ${
              isDark ? "brightness-[2.2] contrast-125" : ""
            }`}
          />
          <p
            className={`mt-3 text-xs xl:text-sm font-medium tracking-wide ${
              isDark ? "text-[#adf1dc]/80" : "text-[#256959]"
            }`}
          >
            Slow down. Focus deeply. Grow steadily.
          </p>
        </div>
      </section>

      {/* RIGHT: Reset Password Card */}
      <main className="w-full lg:w-1/2 h-full flex items-center justify-center px-4 py-3 relative z-10">
        <div
          className={`w-full max-w-md rounded-3xl p-5 sm:p-6 border shadow-2xl backdrop-blur-xl transition-all ${
            isDark
              ? "bg-[#1f2725]/90 border-white/10 text-[#e8f3ec]"
              : "bg-white/95 border-black/5 text-[#141e19]"
          }`}
        >
          {/* Avatar & Welcoming Greeting */}
          <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-2 bg-[#adf1dc] text-[#002019] flex items-center justify-center font-bold shadow-sm p-2">
              <img src="/lock_reset.png" alt="Lock Reset" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Glad that you&apos;re the real one!
            </h2>
            <p className="text-xs opacity-70 mt-1 max-w-xs mx-auto leading-relaxed">
              How about creating your new password so that you wouldn&apos;t forget?
            </p>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mb-3 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 dark:text-red-400 text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
              <span className="material-symbols-outlined text-[15px] flex-shrink-0">error</span>
              <span className="leading-tight">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
              <span className="material-symbols-outlined text-[15px] flex-shrink-0">check_circle</span>
              <span className="leading-tight">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* New Password */}
            <div>
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <img src="/lock.png" alt="New Password" className={inputIconClass} />
                <input
                  type={showNewPassword ? "text" : "password"}
                  autoFocus
                  required
                  placeholder="Enter your new password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${inputClass} pl-9 pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition cursor-pointer p-0.5"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  <img
                    src={showNewPassword ? "/password_visibility.png" : "/password_invisibility.png"}
                    alt={showNewPassword ? "Hide password" : "Show password"}
                    className="w-4 h-4 object-contain"
                  />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative">
                <img src="/lock_reset.png" alt="Confirm Password" className={inputIconClass} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pl-9 pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition cursor-pointer p-0.5"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <img
                    src={showConfirmPassword ? "/password_visibility.png" : "/password_invisibility.png"}
                    alt={showConfirmPassword ? "Hide password" : "Show password"}
                    className="w-4 h-4 object-contain"
                  />
                </button>
              </div>
            </div>

            {/* Action buttons: Change Password & Later */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onLater}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer hover:opacity-90 ${
                  isDark
                    ? "border-white/10 hover:bg-white/5 text-slate-300"
                    : "border-black/10 hover:bg-black/5 text-slate-700"
                }`}
              >
                Later
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-[#adf1dc] text-[#002019] text-xs font-bold hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <img src="/lock_reset.png" alt="Change Password" className="w-4 h-4 object-contain inline-block" />
                <span>{isLoading ? "Updating..." : "Change Password"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
