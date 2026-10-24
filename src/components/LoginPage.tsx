import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthShowcase from "./auth/AuthShowcase";
import { validateEmail } from "./auth/emailValidator";
import RegisterPage from "./RegisterPage";

export interface LoginPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onLogin: (userName: string, userId: string) => void;
}

export default function LoginPage({ isDark, setIsDark, onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<"signin" | "register" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");

  const resetMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  // If user selected Register mode, render dedicated RegisterPage
  if (mode === "register") {
    return (
      <RegisterPage
        isDark={isDark}
        setIsDark={setIsDark}
        onLogin={onLogin}
        onSwitchToLogin={() => {
          setMode("signin");
          resetMessages();
        }}
      />
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      if (!trimmedEmail || !password) {
        throw new Error("Please enter both email and password.");
      }

      // Supabase Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (error) throw error;

      onLogin(data.user.user_metadata?.username || "Mindful Sprout", data.user.id);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    const targetEmail = forgotEmail.trim().toLowerCase();

    try {
      const emailCheck = validateEmail(targetEmail);
      if (!emailCheck.isValid) throw new Error(emailCheck.error);

      // Check if account exists before dispatching
      const { data: exists, error: checkError } = await supabase.rpc(
        "check_user_exists",
        { target_email: targetEmail }
      );

      if (checkError) {
        console.error("Error verifying account existence:", checkError.message);
      }

      if (!exists) {
        throw new Error("No account was found with this email address.");
      }

      // Dispatch reset link
      const redirectUrl = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setSuccessMsg("A password reset link has been sent to your email.");
      setTimeout(() => setMode("signin"), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reset link.");
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

      {/* Main Card */}
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
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {mode === "forgot" ? "Account Recovery" : "Welcome Back"}
            </h2>
            <p className="text-xs opacity-60 mt-0.5">
              {mode === "forgot"
                ? "Enter your email to receive recovery instructions"
                : "Step gently into your sanctuary"}
            </p>
          </div>

          {/* Navigation Tabs (Only in signin mode) */}
          {mode === "signin" && (
            <div
              className={`flex p-1 rounded-2xl border mb-3 ${
                isDark ? "bg-[#161b1a] border-white/5" : "bg-[#ebf6ef] border-black/5"
              }`}
            >
              <button
                type="button"
                className="flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 bg-[#adf1dc] text-[#002019] shadow-sm"
              >
                <img src="/login.png" alt="Sign In" className="w-4 h-4 object-contain inline-block" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  resetMessages();
                }}
                className="flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100"
              >
                <img src="/person_add.png" alt="Register" className="w-4 h-4 object-contain inline-block" />
                <span>Register</span>
              </button>
            </div>
          )}

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

          {/* Form */}
          {mode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-2.5">
              <div>
                <label className={labelClass}>Registered Email Address</label>
                <div className="relative">
                  <img src="/mail.png" alt="Email" className={inputIconClass} />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="e.g. yourname@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={`${inputClass} pl-9 pr-3`}
                  />
                </div>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    resetMessages();
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDark
                      ? "border-white/10 hover:bg-white/5 text-slate-300"
                      : "border-black/10 hover:bg-black/5 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 rounded-xl bg-[#adf1dc] text-[#002019] text-xs font-bold hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <span>{isLoading ? "Sending..." : "Send Reset Link"}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-2.5">
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <img src="/mail.png" alt="Email" className={inputIconClass} />
                  <input
                    type="email"
                    required
                    autoFocus
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
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-end text-xs pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    resetMessages();
                  }}
                  className="text-[11px] font-semibold opacity-70 hover:opacity-100 hover:underline cursor-pointer transition"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-1 py-2 rounded-xl bg-[#adf1dc] text-[#002019] text-xs sm:text-sm font-bold hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <img src="/login.png" alt="Login" className="w-4 h-4 object-contain inline-block" />
                <span>{isLoading ? "Processing..." : "Login"}</span>
              </button>
            </form>
          )}

          {mode !== "forgot" && (
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
          )}
        </div>
      </main>
    </div>
  );
}
