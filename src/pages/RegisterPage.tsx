import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { supabase } from "../lib/supabaseClient";
import { validateEmail } from "../components/auth/emailValidator";
import { ThemeTogglerButton } from "../components/ui/FluidAnimations";

export interface RegisterPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onLogin: (userName: string, userId: string) => void;
  isAuthenticated?: boolean;
}

export default function RegisterPage({
  isDark,
  setIsDark,
  onLogin,
  isAuthenticated = false,
}: RegisterPageProps) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    const trimmedUser = username.trim() || "Mindful Sprout";
    const trimmedEmail = email.trim().toLowerCase();

    try {
      if (trimmedUser.length < 2) {
        throw new Error("Display name must be at least 2 characters.");
      }

      const emailCheck = validateEmail(trimmedEmail);
      if (!emailCheck.isValid) throw new Error(emailCheck.error);

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      if (confirmPassword && password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

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
          setSuccessMsg("Account created! Entering your sanctuary...");
          setTimeout(() => {
            onLogin(trimmedUser, newUserId);
            navigate("/app", { replace: true });
          }, 600);
        } else {
          const { data: signInData, error: signInErr } =
            await supabase.auth.signInWithPassword({
              email: trimmedEmail,
              password: password,
            });

          if (!signInErr && signInData?.user) {
            setSuccessMsg("Account created! Entering your sanctuary...");
            setTimeout(() => {
              onLogin(trimmedUser, signInData.user.id);
              navigate("/app", { replace: true });
            }, 600);
          } else {
            setSuccessMsg("Account created! You can now log in.");
            setTimeout(() => {
              navigate("/login");
            }, 1400);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(
        err.message || "An unexpected error occurred during registration."
      );
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

  const floatingInputClass = `peer w-full h-12 rounded-2xl px-4 pt-5 pb-1.5 text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#ADF1DC] focus:border-[#ADF1DC] transition-all placeholder-transparent ${
    isDark
      ? "bg-[#161b1a]/90 border-white/10 text-[#e8f3ec]"
      : "bg-white border-black/10 text-[#141e19]"
  }`;

  const floatingLabelClass = `absolute left-4 top-2 text-[10px] font-semibold tracking-wide transition-all pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-[10px] ${
    isDark
      ? "text-[#e8f3ec]/55 peer-focus:text-[#ADF1DC]"
      : "text-[#141e19]/55 peer-focus:text-[#256959]"
  }`;

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between relative overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-[#141E19] text-[#e8f3ec]" : "bg-[#FAF9F6] text-[#141e19]"
      }`}
    >
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-36 -left-36 w-96 h-96 rounded-full bg-[#ADF1DC]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -right-36 w-96 h-96 rounded-full bg-[#256959]/20 blur-3xl" />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 flex items-center justify-between relative z-20">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
            isDark
              ? "bg-[#1f2725]/80 border-white/10 text-[#e8f3ec] hover:border-[#ADF1DC]/40 hover:bg-[#1f2725]"
              : "bg-white/80 border-black/10 text-[#141e19] hover:border-black/20 hover:bg-white shadow-xs"
          }`}
        >
          <span>← Back to Home</span>
        </Link>

        <ThemeTogglerButton
          isDark={isDark}
          onToggle={() => setIsDark(!isDark)}
        />
      </header>

      {/* Centered Glassmorphic Registration Sanctuary Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-xl transition-all ${
            isDark
              ? "bg-[#1f2725]/85 border-white/10 text-[#e8f3ec] shadow-black/40"
              : "bg-white/90 border-black/8 text-[#141e19] shadow-[#256959]/10"
          }`}
        >
          {/* 3D Tortoise Mascot Showcase */}
          <div className="text-center mb-5">
            <img
              src="/logo.png"
              alt="Pomodoro Tortoise Mascot"
              className="w-20 h-20 mx-auto object-contain mb-4 animate-fade-in drop-shadow-md"
            />
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Welcome to your Sanctuary
            </h1>
            <p className="text-xs sm:text-[13px] leading-relaxed opacity-65 mt-1.5 max-w-sm mx-auto">
              Create an account to synchronize your focus rituals, stepping
              stone tasks, and analytics across all your devices.
            </p>
          </div>

          {/* Tabbed Toggle: Log in / Create Account */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className={`grid grid-cols-2 p-1 rounded-2xl border mb-5 ${
              isDark
                ? "bg-[#141E19]/90 border-white/10"
                : "bg-[#f1fcf4] border-black/5"
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={false}
              onClick={() => navigate("/login")}
              className="py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 opacity-65 hover:opacity-100"
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
              aria-selected={true}
              className="py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-[#ADF1DC] text-[#002019] shadow-sm"
            >
              <img
                src="/person_add.png"
                alt=""
                className="w-3.5 h-3.5 object-contain"
              />
              <span>Create Account</span>
            </button>
          </div>

          {/* Status & Error Banners */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-4 px-3.5 py-2.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-medium flex items-center gap-2"
            >
              <img
                src="/error_alert.png"
                alt="Error"
                className="w-4 h-4 object-contain flex-shrink-0"
              />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="mb-4 px-3.5 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2"
            >
              <img
                src="/check_circle.png"
                alt="Success"
                className="w-4 h-4 object-contain flex-shrink-0"
              />
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}

          {/* Create Account Form */}
          <form onSubmit={handleCreateAccount} className="space-y-3">
            <div className="relative">
              <input
                id="signup-username"
                type="text"
                required
                autoFocus
                placeholder="Display Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={floatingInputClass}
              />
              <label htmlFor="signup-username" className={floatingLabelClass}>
                Display Name
              </label>
            </div>

            <div className="relative">
              <input
                id="signup-email"
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={floatingInputClass}
              />
              <label htmlFor="signup-email" className={floatingLabelClass}>
                Email Address
              </label>
            </div>

            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${floatingInputClass} pr-10`}
              />
              <label htmlFor="signup-password" className={floatingLabelClass}>
                Password (min. 6 characters)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition cursor-pointer p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                <img
                  src={
                    showPassword
                      ? "/password_visibility.png"
                      : "/password_invisibility.png"
                  }
                  alt={showPassword ? "Hide password" : "Show password"}
                  className="w-4 h-4 object-contain"
                />
              </button>
            </div>

            <div className="relative">
              <input
                id="signup-confirm-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={floatingInputClass}
              />
              <label
                htmlFor="signup-confirm-password"
                className={floatingLabelClass}
              >
                Confirm Password
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="w-full mt-1 py-3 rounded-2xl bg-[#ADF1DC] text-[#002019] text-xs sm:text-sm font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60 select-none"
            >
              <img
                src="/how_to_reg.png"
                alt=""
                className="w-4 h-4 object-contain"
              />
              <span>
                {isLoading ? "Creating Account..." : "Create Account"}
              </span>
            </motion.button>
          </form>

          {/* Continue as Guest & Back to Home */}
          <div className="mt-5 pt-4 border-t border-black/8 dark:border-white/10 flex flex-col items-center gap-2.5 text-center">
            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full py-2.5 px-4 rounded-2xl text-xs font-semibold border border-transparent hover:border-[#ADF1DC]/50 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-[#ADF1DC]/15 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <img
                src="/spa.png"
                alt=""
                className="w-4 h-4 object-contain"
              />
              <span>Continue as Guest</span>
            </button>

            <Link
              to="/"
              className="text-[11px] font-medium opacity-55 hover:opacity-100 hover:underline transition pt-1"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full py-4 text-center text-xs opacity-50 relative z-10">
        Pomodoro Tortoise — Crafted for quiet minds
      </footer>
    </div>
  );
}

