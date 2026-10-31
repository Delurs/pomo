import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { supabase } from "../lib/supabaseClient";
import AuthShowcase from "../components/auth/AuthShowcase";
import { validateEmail } from "../components/auth/emailValidator";

export interface RegisterPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onLogin: (userName: string, userId: string) => void;
  isAuthenticated?: boolean;
}

export default function RegisterPage({
  isDark,
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

  const floatingInputClass = `peer w-full h-10 rounded-xl px-3.5 pt-4 pb-1 text-xs border focus:outline-none focus:ring-2 focus:ring-[#ADF1DC] focus:border-[#ADF1DC] transition-all placeholder-transparent ${
    isDark
      ? "bg-[#161b1a]/90 border-white/10 text-[#e8f3ec]"
      : "bg-white border-black/10 text-[#141e19]"
  }`;

  const floatingLabelClass = `absolute left-3.5 top-1.5 text-[9px] font-semibold tracking-wide transition-all pointer-events-none peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-xs peer-focus:top-1 peer-focus:text-[9px] ${
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
          className={`w-full max-w-md rounded-3xl p-5 sm:p-6 border shadow-2xl backdrop-blur-xl transition-all relative z-10 ${
            isDark
              ? "bg-[#1f2725]/90 border-white/10 text-[#e8f3ec] shadow-black/40"
              : "bg-white/95 border-black/8 text-[#141e19] shadow-[#256959]/10"
          }`}
        >
          {/* Header & Mascot Badge */}
          <div className="text-center mb-3">
            <img
              src="/logo.png"
              alt="Pomodoro Tortoise Mascot"
              className="w-13 h-13 mx-auto object-contain mb-1.5 animate-fade-in drop-shadow-md"
            />
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Welcome to your Sanctuary
            </h1>
            <p className="text-[11px] sm:text-xs leading-snug opacity-65 mt-1 max-w-xs mx-auto">
              Create an account to synchronize your focus rituals, stepping
              stone tasks, and analytics across all your devices.
            </p>
          </div>

          {/* Tabbed Toggle: Log in / Create Account */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className={`grid grid-cols-2 p-1 rounded-xl border mb-3 ${
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
              className="py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 opacity-65 hover:opacity-100"
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
              className="py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-[#ADF1DC] text-[#002019] shadow-sm"
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
              className="mb-2.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-300 text-[11px] font-medium flex items-center gap-2"
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
              className="mb-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-2"
            >
              <img
                src="/check_circle.png"
                alt="Success"
                className="w-3.5 h-3.5 object-contain flex-shrink-0"
              />
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}

          {/* Create Account Form */}
          <form onSubmit={handleCreateAccount} className="space-y-2">
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
                className={`${floatingInputClass} pr-9`}
              />
              <label htmlFor="signup-password" className={floatingLabelClass}>
                Password (min. 6 characters)
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
              className="w-full py-2.5 rounded-xl bg-[#ADF1DC] text-[#002019] text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60 select-none"
            >
              <img
                src="/how_to_reg.png"
                alt=""
                className="w-3.5 h-3.5 object-contain"
              />
              <span>
                {isLoading ? "Creating Account..." : "Create Account"}
              </span>
            </motion.button>
          </form>

          {/* Continue as Guest & Back to Home */}
          <div className="mt-3 pt-2.5 border-t border-black/8 dark:border-white/10 flex flex-col items-center gap-1.5 text-center">
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
