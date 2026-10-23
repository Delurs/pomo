import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export interface LoginPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onLogin: (userName: string, userId: string) => void;
}

const validateEmail = (emailStr: string): { isValid: boolean; error?: string } => {
  const trimmed = emailStr.trim();
  if (!trimmed) return { isValid: false, error: "Please enter your email address." };
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) return { isValid: false, error: "Please enter a valid email address." };
  return { isValid: true };
};

export default function LoginPage({ isDark, setIsDark, onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<"signin" | "register" | "forgot">("signin");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Forgot password field
  const [forgotEmail, setForgotEmail] = useState<string>("");

  const resetMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      if (mode === "signin") {
        if (!trimmedEmail || !password) {
          throw new Error("Please enter both email and password.");
        }

        // SUPABASE SIGN IN
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });

        if (error) throw error;

        // Pass the user's metadata (username) and ID back to App.tsx
        onLogin(data.user.user_metadata?.username || "Mindful Sprout", data.user.id);
      } else if (mode === "register") {
        const trimmedUser = username.trim();
        if (!trimmedUser || trimmedUser.length < 2) {
          throw new Error("Username must be at least 2 characters.");
        }

        const emailCheck = validateEmail(trimmedEmail);
        if (!emailCheck.isValid) throw new Error(emailCheck.error);

        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        if (password !== confirmPassword) throw new Error("Passwords do not match.");

        // SUPABASE SIGN UP
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
              const loggedInId = signInData.user.id;
              setSuccessMsg("Account created! Entering your sanctuary...");
              setTimeout(() => onLogin(trimmedUser, loggedInId), 800);
            } else {
              setSuccessMsg("Account created! You can now sign in.");
              setTimeout(() => setMode("signin"), 1500);
            }
          }
        }
      } else if (mode === "forgot") {
        const targetEmail = forgotEmail.trim().toLowerCase();
        const emailCheck = validateEmail(targetEmail);
        if (!emailCheck.isValid) throw new Error(emailCheck.error);

        // Use a clean origin URL without "#" so Supabase can cleanly attach #access_token=...
        const redirectUrl = window.location.origin;
        const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
          redirectTo: redirectUrl,
        });
        if (error) throw error;

        setSuccessMsg("If an account exists, a password reset link has been sent to that email.");
        setTimeout(() => setMode("signin"), 3500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    // Guest Mode falls back to local storage
    localStorage.setItem("pomo_user_name", "Mindful Guest");
    onLogin("Mindful Guest", "guest");
  };

  const inputClass = `w-full h-9 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] transition ${isDark
      ? "bg-[#161b1a] border-white/10 text-white placeholder-white/30"
      : "bg-white border-black/10 text-black placeholder-black/30"
    }`;
  const inputIconClass =
    "w-4 h-4 object-contain absolute left-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none";
  const labelClass = "block text-[11px] font-semibold opacity-75 mb-0.5";

  return (
    <div
      className={`h-screen w-full overflow-hidden flex relative transition-colors duration-300 ${isDark ? "bg-[#141e19] text-[#e8f3ec]" : "bg-[#f1fcf4] text-[#141e19]"
        }`}
    >
      {/* Theme Toggle (floating, top-right) */}
      <button
        onClick={() => setIsDark(!isDark)}
        aria-label="Toggle Light and Dark Mode"
        className={`absolute top-4 right-4 sm:right-6 z-20 p-1 rounded-full border transition flex items-center cursor-pointer ${isDark
            ? "bg-[#1f2725] border-white/10 text-[#adf1dc]"
            : "bg-white border-black/5 text-[#256959] shadow-sm"
          }`}
      >
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center transition ${!isDark ? "bg-[#adf1dc] text-[#002019]" : "opacity-40"
            }`}
        >
          <img src="/light_mode.png" alt="Light mode" className="w-4 h-4 object-contain" />
        </span>
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center transition ${isDark ? "bg-[#256959] text-white" : "opacity-40"
            }`}
        >
          <img src="/dark_mode.png" alt="Dark mode" className="w-4 h-4 object-contain" />
        </span>
      </button>

      {/* LEFT: Brand showcase */}
      <section
        className={`hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden ${isDark
            ? "bg-gradient-to-br from-[#1a2a24] via-[#16221d] to-[#0f1814]"
            : "bg-gradient-to-br from-[#d9f7e8] via-[#c4f0dc] to-[#adf1dc]"
          }`}
      >
        {/* Ambient glows */}
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-[#adf1dc]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-24 w-[30rem] h-[30rem] rounded-full bg-[#256959]/25 blur-3xl pointer-events-none" />
        {/* Decorative rings */}
        <div
          className={`absolute w-[34rem] h-[34rem] rounded-full border pointer-events-none ${isDark ? "border-white/5" : "border-[#256959]/10"
            }`}
        />
        <div
          className={`absolute w-[44rem] h-[44rem] rounded-full border pointer-events-none ${isDark ? "border-white/5" : "border-[#256959]/10"
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
            className={`h-9 xl:h-12 mt-5 object-contain ${isDark ? "brightness-[2.2] contrast-125" : ""
              }`}
          />
          <p
            className={`mt-3 text-xs xl:text-sm font-medium tracking-wide ${isDark ? "text-[#adf1dc]/80" : "text-[#256959]"
              }`}
          >
            Slow down. Focus deeply. Grow steadily.
          </p>
        </div>
      </section>

      {/* RIGHT: Login card */}
      <main className="w-full lg:w-1/2 h-full flex items-center justify-center px-4 py-3 relative z-10">
        <div
          className={`w-full max-w-md rounded-3xl p-5 sm:p-6 border shadow-2xl backdrop-blur-xl transition-all ${isDark
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
              {mode === "signin" && "Welcome Back"}
              {mode === "register" && "Create an Account"}
              {mode === "forgot" && "Reset Password"}
            </h2>
            <p className="text-[11px] opacity-60 mt-0.5">
              {mode === "signin" && "Enter your credentials to enter your focus sanctuary"}
              {mode === "register" && "Begin your calm and steady productivity journey"}
              {mode === "forgot" && "Enter your email to receive a secure password reset link"}
            </p>
          </div>

          {/* Sign In / Register tabs */}
          {mode !== "forgot" && (
            <div
              className={`p-1 rounded-2xl flex items-center mb-3 border transition-colors ${isDark ? "bg-[#161b1a] border-white/5" : "bg-[#ebf6ef] border-black/5"
                }`}
            >
              {(["signin", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    resetMessages();
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${mode === m ? "bg-[#adf1dc] text-[#002019] shadow-sm" : "opacity-60 hover:opacity-100"
                    }`}
                >
                  <img
                    src={m === "signin" ? "/login.png" : "/person_add.png"}
                    alt={m === "signin" ? "Sign In" : "Register"}
                    className="w-4 h-4 object-contain inline-block"
                  />
                  <span>{m === "signin" ? "Sign In" : "Register"}</span>
                </button>
              ))}
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

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {mode === "forgot" ? (
              <>
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
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${isDark
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
              </>
            ) : (
              <>
                {mode === "register" && (
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
                )}

                <div>
                  <label className={labelClass}>Email Address</label>
                  <div className="relative">
                    <img src="/mail.png" alt="Email" className={inputIconClass} />
                    <input
                      type="email"
                      required
                      autoFocus={mode === "signin"}
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
                      placeholder={mode === "signin" ? "Enter your password" : "At least 6 characters"}
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

                {mode === "register" && (
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
                )}

                {mode === "signin" && (
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
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-2 rounded-xl bg-[#adf1dc] text-[#002019] text-xs sm:text-sm font-bold hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <img
                    src={mode === "signin" ? "/login.png" : "/how_to_reg.png"}
                    alt={mode === "signin" ? "Login" : "Register"}
                    className="w-4 h-4 object-contain inline-block"
                  />
                  <span>
                    {isLoading
                      ? "Processing..."
                      : mode === "signin"
                        ? "Login"
                        : "Create Account"}
                  </span>
                </button>
              </>
            )}
          </form>

          {mode !== "forgot" && (
            <div className="mt-2.5 pt-2.5 border-t border-black/5 dark:border-white/5 text-center">
              <button
                type="button"
                onClick={handleQuickDemo}
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
