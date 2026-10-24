import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthShowcase from "./auth/AuthShowcase";
import { validateEmail } from "./auth/emailValidator";

export interface RegisterPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onLogin: (userName: string, userId: string) => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterPage({
  isDark,
  setIsDark,
  onLogin,
  onSwitchToLogin,
}: RegisterPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    const trimmedUser = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    try {
      if (!trimmedUser || trimmedUser.length < 2) {
        throw new Error("Username must be at least 2 characters.");
      }

      const emailCheck = validateEmail(trimmedEmail);
      if (!emailCheck.isValid) throw new Error(emailCheck.error);

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      // Supabase Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: { username: trimmedUser },
        },
      });

      if (error) throw error;

      if (data.user) {
        const newUserId = data.user.id;
        if (data.session) {
          setSuccessMsg("Account successfully created! Entering your sanctuary...");
          setTimeout(() => onLogin(trimmedUser, newUserId), 800);
        } else {
          // Attempt immediate login without requiring email confirmation
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password: password,
          });

          if (!signInErr && signInData?.user) {
            setSuccessMsg("Account created! Entering your sanctuary...");
            setTimeout(() => onLogin(trimmedUser, signInData.user.id), 800);
          } else {
            setSuccessMsg("Account created! You can now sign in.");
            setTimeout(() => onSwitchToLogin?.(), 1500);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    localStorage.setItem("pomo_user_name", "Mindful Guest");
    onLogin("Mindful Guest", "guest");
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
      {/* Theme Toggle Button */}
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

      {/* Brand Showcase (Desktop left side) */}
      <AuthShowcase isDark={isDark} />

      {/* Registration Card */}
      <main className="w-full lg:w-1/2 h-full flex items-center justify-center px-4 py-3 relative z-10">
        <div
          className={`w-full max-w-md rounded-3xl p-5 sm:p-6 border shadow-2xl backdrop-blur-xl transition-all ${
            isDark
              ? "bg-[#1f2725]/90 border-white/10 text-[#e8f3ec]"
              : "bg-white/95 border-black/5 text-[#141e19]"
          }`}
        >
          {/* Avatar & Title */}
          <div className="text-center mb-3">
            <div className="w-11 h-11 rounded-2xl mx-auto mb-1.5 bg-[#adf1dc] text-[#002019] flex items-center justify-center font-bold shadow-sm p-1.5">
              <img src="/profile.png" alt="Profile" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">Begin Your Journey</h2>
            <p className="text-xs opacity-60 mt-0.5">Create your mindful workspace account</p>
          </div>

          {/* Navigation Tabs (Sign In / Register) */}
          <div
            className={`flex p-1 rounded-2xl border mb-3 ${
              isDark ? "bg-[#161b1a] border-white/5" : "bg-[#ebf6ef] border-black/5"
            }`}
          >
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100"
            >
              <img src="/login.png" alt="Sign In" className="w-4 h-4 object-contain inline-block" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className="flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 bg-[#adf1dc] text-[#002019] shadow-sm"
            >
              <img src="/person_add.png" alt="Register" className="w-4 h-4 object-contain inline-block" />
              <span>Register</span>
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 dark:text-red-400 text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
              <span className="material-symbols-outlined text-[15px] flex-shrink-0">error</span>
              <span className="leading-tight">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
              <span className="material-symbols-outlined text-[15px] flex-shrink-0">check_circle</span>
              <span className="leading-tight">{successMsg}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-2.5">
            <div>
              <label className={labelClass}>Username</label>
              <div className="relative">
                <img src="/person.png" alt="Username" className={inputIconClass} />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${inputClass} pl-9 pr-3`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <img src="/mail.png" alt="Email" className={inputIconClass} />
                <input
                  type="email"
                  required
                  placeholder="e.g. name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} pl-9 pr-3`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <img src="/lock.png" alt="Password" className={inputIconClass} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pl-9 pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition cursor-pointer p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <img
                    src={showPassword ? "/password_visibility.png" : "/password_invisibility.png"}
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="w-4 h-4 object-contain"
                  />
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative">
                <img src="/lock_reset.png" alt="Confirm Password" className={inputIconClass} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pl-9 pr-3`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-2 rounded-xl bg-[#adf1dc] text-[#002019] text-xs sm:text-sm font-bold hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <img src="/how_to_reg.png" alt="Register" className="w-4 h-4 object-contain inline-block" />
              <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
            </button>
          </form>

          {/* Guest Mode fallback */}
          <div className="mt-2.5 pt-2.5 border-t border-black/5 dark:border-white/5 text-center">
            <button
              type="button"
              onClick={handleGuestMode}
              className="text-[11px] opacity-60 hover:opacity-100 hover:underline cursor-pointer transition flex items-center justify-center gap-1.5 mx-auto"
            >
              <img src="/spa.png" alt="Guest" className="w-3.5 h-3.5 object-contain inline-block" />
              <span>Continue as Mindful Guest</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
