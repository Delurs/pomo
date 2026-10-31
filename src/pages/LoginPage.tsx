import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { supabase } from "../lib/supabaseClient";
import AuthShowcase from "../components/auth/AuthShowcase";
import { validateEmail } from "../components/auth/emailValidator";

export interface LoginPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onLogin: (userName: string, userId: string) => void;
  isAuthenticated?: boolean;
}

export default function LoginPage({
  isDark,
  onLogin,
  isAuthenticated = false,
}: LoginPageProps) {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "forgot">("signin");

  // Sign In state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");

  // Feedback & loading
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect authenticated non-guest users automatically to /app
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const resetMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      if (!trimmedEmail || !password) {
        throw new Error("Please enter both email and password.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (error) throw error;

      const resolvedName = data.user.user_metadata?.username || "Mindful Sprout";
      onLogin(resolvedName, data.user.id);
      navigate("/app", { replace: true });
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

      const { data: exists, error: checkError } = await supabase.rpc(
        "check_user_exists",
        { target_email: targetEmail }
      );

      if (checkError) {
        console.error("Error verifying account existence:", checkError.message);
      }

      if (exists === false) {
        throw new Error("No account was found with this email address.");
      }

      const redirectUrl = `${window.location.origin}/app`;
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
    localStorage.setItem("pomo_user_id", "guest");
    onLogin("Mindful Guest", "guest");
    navigate("/app");
  };

  const floatingInputClass = `peer w-full h-11 rounded-xl px-3.5 pt-4 pb-1 text-xs border focus:outline-none focus:ring-2 focus:ring-[#ADF1DC] focus:border-[#ADF1DC] transition-all placeholder-transparent ${
    isDark
      ? "bg-[#161b1a]/90 border-white/10 text-[#e8f3ec]"
      : "bg-white border-black/10 text-[#141e19]"
  }`;

  const floatingLabelClass = `absolute left-3.5 top-1.5 text-[9px] font-semibold tracking-wide transition-all pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-[9px] ${
    isDark
      ? "text-[#e8f3ec]/55 peer-focus:text-[#ADF1DC]"
      : "text-[#141e19]/55 peer-focus:text-[#256959]"
  }`;

  return (
    <div
      className={`h-screen w-full flex relative overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-[#141E19] text-[#e8f3ec]" : "bg-[#FAF9F6] text-[#141e19]"
      }`}
    >
      {/* Left 50% Split-Screen Sanctuary Showcase */}
      <AuthShowcase isDark={isDark} />

      {/* Right 50% Form Area */}
      <main className="w-full lg:w-1/2 h-screen flex items-center justify-center px-4 sm:px-6 relative z-10">
        {/* Subtle Ambient Glow behind Card */}
        <div className="pointer-events-none absolute w-80 h-80 rounded-full bg-[#ADF1DC]/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`w-full max-w-md rounded-3xl p-6 sm:p-7 border shadow-2xl backdrop-blur-xl transition-all relative z-10 ${
            isDark
              ? "bg-[#1f2725]/90 border-white/10 text-[#e8f3ec] shadow-black/40"
              : "bg-white/95 border-black/8 text-[#141e19] shadow-[#256959]/10"
          }`}
        >
          {/* Header & Mascot Badge */}
          <div className="text-center mb-4">
            <img
              src="/logo.png"
              alt="Pomodoro Tortoise Mascot"
              className="w-14 h-14 mx-auto object-contain mb-2 animate-fade-in drop-shadow-md"
            />
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {mode === "forgot" ? "Account Recovery" : "Welcome to your Sanctuary"}
            </h1>
            <p className="text-[11px] sm:text-xs leading-snug opacity-65 mt-1 max-w-xs mx-auto">
              {mode === "forgot"
                ? "Enter your registered email address and we will send you a password recovery link."
                : "Sign in to synchronize your focus rituals, stepping stone tasks, and analytics across all your devices."}
            </p>
          </div>

          {/* Tabbed Toggle: Log in / Create Account */}
          {mode !== "forgot" && (
            <div
              role="tablist"
              aria-label="Authentication mode"
              className={`grid grid-cols-2 p-1 rounded-xl border mb-4 ${
                isDark
                  ? "bg-[#141E19]/90 border-white/10"
                  : "bg-[#f1fcf4] border-black/5"
              }`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={true}
                onClick={() => {
                  setMode("signin");
                  resetMessages();
                }}
                className="py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-[#ADF1DC] text-[#002019] shadow-sm"
              >
                <img
                  src="/login.png"
                  alt=""
                  className="w-3.5 h-3.5 object-contain"
                />
                <span>Log in</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={false}
                onClick={() => navigate("/register")}
                className="py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 opacity-65 hover:opacity-100"
              >
                <img
                  src="/person_add.png"
                  alt=""
                  className="w-3.5 h-3.5 object-contain"
                />
                <span>Create Account</span>
              </button>
            </div>
          )}

          {/* Status & Error Banners */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-3 px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-300 text-[11px] font-medium flex items-center gap-2"
            >
              <img
                src="/error_alert.png"
                alt="Error"
                className="w-3.5 h-3.5 object-contain flex-shrink-0"
              />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="mb-3 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-2"
            >
              <img
                src="/check_circle.png"
                alt="Success"
                className="w-3.5 h-3.5 object-contain flex-shrink-0"
              />
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}

          {/* Forms */}
          {mode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="relative">
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoFocus
                  placeholder="Registered Email Address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className={floatingInputClass}
                />
                <label htmlFor="forgot-email" className={floatingLabelClass}>
                  Registered Email Address
                </label>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    resetMessages();
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDark
                      ? "border-white/10 hover:bg-white/5 text-slate-300"
                      : "border-black/10 hover:bg-black/5 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-xl bg-[#ADF1DC] text-[#002019] text-xs font-bold transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <span>{isLoading ? "Sending..." : "Send Reset Link"}</span>
                </motion.button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="relative">
                <input
                  id="signin-email"
                  type="email"
                  required
                  autoFocus
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={floatingInputClass}
                />
                <label htmlFor="signin-email" className={floatingLabelClass}>
                  Email Address
                </label>
              </div>

              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${floatingInputClass} pr-9`}
                />
                <label htmlFor="signin-password" className={floatingLabelClass}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition cursor-pointer p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <img
                    src={
                      showPassword
                        ? "/password_visibility.png"
                        : "/password_invisibility.png"
                    }
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="w-3.5 h-3.5 object-contain"
                  />
                </button>
              </div>

              <div className="flex items-center justify-end">
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

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="w-full py-2.5 rounded-xl bg-[#ADF1DC] text-[#002019] text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60 select-none"
              >
                <img
                  src="/login.png"
                  alt=""
                  className="w-3.5 h-3.5 object-contain"
                />
                <span>{isLoading ? "Logging In..." : "Log in"}</span>
              </motion.button>
            </form>
          )}

          {/* Continue as Guest & Back to Home */}
          <div className="mt-4 pt-3.5 border-t border-black/8 dark:border-white/10 flex flex-col items-center gap-2 text-center">
            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold border border-transparent hover:border-[#ADF1DC]/50 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-[#ADF1DC]/15 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <img
                src="/spa.png"
                alt=""
                className="w-3.5 h-3.5 object-contain"
              />
              <span>Continue as Guest</span>
            </button>

            <Link
              to="/"
              className="text-[11px] font-medium opacity-55 hover:opacity-100 hover:underline transition"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
