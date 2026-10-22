import { useState } from "react";

export interface LoginPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onLogin: (userName: string) => void;
}

// Professional RFC 5322 compliant email validator
const validateEmail = (emailStr: string): { isValid: boolean; error?: string } => {
  const trimmed = emailStr.trim();
  if (!trimmed) {
    return { isValid: false, error: "Please enter your email address." };
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address (e.g. name@domain.com)." };
  }
  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Email must contain exactly one '@' symbol." };
  }
  const [local, domain] = parts;
  if (local.length > 64) {
    return { isValid: false, error: "Email prefix cannot exceed 64 characters." };
  }
  if (!domain.includes(".")) {
    return { isValid: false, error: "Email domain must include a valid top-level domain (e.g. .com)." };
  }
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { isValid: false, error: "Email domain extension is incomplete." };
  }
  return { isValid: true };
};

export default function LoginPage({ isDark, setIsDark, onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<"signin" | "register" | "forgot">("signin");
  const [username, setUsername] = useState<string>(() => localStorage.getItem("pomo_user_name") || "");
  const [email, setEmail] = useState<string>(() => localStorage.getItem("pomo_user_email") || "");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(
    () => localStorage.getItem("pomo_remember_me") === "true"
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Forgot password specific fields
  const [forgotEmail, setForgotEmail] = useState<string>("");
  const [forgotNewPassword, setForgotNewPassword] = useState<string>("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState<string>("");

  const resetMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const persistSession = () => {
    if (rememberMe) {
      localStorage.setItem("pomo_is_logged_in", "true");
      localStorage.setItem("pomo_remember_me", "true");
    } else {
      localStorage.removeItem("pomo_remember_me");
      sessionStorage.setItem("pomo_is_logged_in", "true");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const trimmedUser = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (mode === "signin") {
      if (!trimmedUser) return setErrorMsg("Please enter your username.");
      if (!password) return setErrorMsg("Please enter your password.");

      const savedPass = localStorage.getItem("pomo_user_password");
      if (savedPass && savedPass !== password) {
        return setErrorMsg("Incorrect password. Try again or click 'Forgot password?'.");
      }

      persistSession();
      localStorage.setItem("pomo_user_name", trimmedUser);
      onLogin(trimmedUser);
    } else if (mode === "register") {
      if (!trimmedUser) return setErrorMsg("Please enter a username.");
      if (!trimmedUser.length || trimmedUser.length < 2) {
        return setErrorMsg("Username must be at least 2 characters.");
      }

      const emailCheck = validateEmail(trimmedEmail);
      if (!emailCheck.isValid) {
        return setErrorMsg(emailCheck.error || "Please enter a valid email address.");
      }

      if (!password) return setErrorMsg("Please create a password.");
      if (password.length < 6) return setErrorMsg("Password must be at least 6 characters.");
      if (password !== confirmPassword) return setErrorMsg("Passwords do not match.");

      localStorage.setItem("pomo_user_name", trimmedUser);
      localStorage.setItem("pomo_user_email", trimmedEmail);
      localStorage.setItem("pomo_user_password", password);
      persistSession();

      setSuccessMsg("Account successfully created! Welcome to Pomodoro Tortoise.");
      setTimeout(() => onLogin(trimmedUser), 700);
    } else {
      const targetEmail = forgotEmail.trim().toLowerCase();
      const emailCheck = validateEmail(targetEmail);
      if (!emailCheck.isValid) {
        return setErrorMsg(emailCheck.error || "Please enter a valid registered email.");
      }

      const savedEmail = localStorage.getItem("pomo_user_email");
      if (savedEmail && savedEmail.toLowerCase() !== targetEmail) {
        return setErrorMsg("No account found with this email address. Please verify your email.");
      }

      if (!forgotNewPassword) {
        return setErrorMsg("Please enter your new password.");
      }
      if (forgotNewPassword.length < 6) {
        return setErrorMsg("New password must be at least 6 characters.");
      }
      if (forgotNewPassword !== forgotConfirmPassword) {
        return setErrorMsg("Passwords do not match.");
      }

      localStorage.setItem("pomo_user_password", forgotNewPassword);
      if (!savedEmail) {
        localStorage.setItem("pomo_user_email", targetEmail);
      }

      setSuccessMsg("Password successfully changed! Redirecting to Sign In...");
      setPassword(forgotNewPassword);
      setTimeout(() => {
        setMode("signin");
        setSuccessMsg("");
      }, 1300);
    }
  };

  const handleQuickDemo = () => {
    const demoUser = "Mindful Sprout";
    localStorage.setItem("pomo_user_name", demoUser);
    localStorage.setItem("pomo_is_logged_in", "true");
    onLogin(demoUser);
  };

  const inputClass = `w-full h-9 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] transition ${
    isDark
      ? "bg-[#161b1a] border-white/10 text-white placeholder-white/30"
      : "bg-white border-black/10 text-black placeholder-black/30"
  }`;
  const inputIconClass = "w-4 h-4 object-contain absolute left-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none";
  const labelClass = "block text-[11px] font-semibold opacity-75 mb-0.5";

  return (
    <div
      className={`h-screen w-full overflow-hidden flex relative transition-colors duration-300 ${
        isDark ? "bg-[#141e19] text-[#e8f3ec]" : "bg-[#f1fcf4] text-[#141e19]"
      }`}
    >
      {/* Theme Toggle (floating, top-right) */}
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

      {/* LEFT: Brand showcase (big logo, steady without fade/pulse animation) */}
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
        {/* Decorative rings */}
        <div
          className={`absolute w-[34rem] h-[34rem] rounded-full border pointer-events-none ${
            isDark ? "border-white/5" : "border-[#256959]/10"
          }`}
        />
        <div
          className={`absolute w-[44rem] h-[44rem] rounded-full border pointer-events-none ${
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

      {/* RIGHT: Login card (compact, no vertical scrolling) */}
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
              {mode === "signin" && "Welcome Back"}
              {mode === "register" && "Create an Account"}
              {mode === "forgot" && "Change Password"}
            </h2>
            <p className="text-[11px] opacity-60 mt-0.5">
              {mode === "signin" && "Enter your credentials to enter your focus sanctuary"}
              {mode === "register" && "Begin your calm and steady productivity journey"}
              {mode === "forgot" && "Verify your registered email to set a new password"}
            </p>
          </div>

          {/* Sign In / Register tabs */}
          {mode !== "forgot" && (
            <div
              className={`p-1 rounded-2xl flex items-center mb-3 border transition-colors ${
                isDark ? "bg-[#161b1a] border-white/5" : "bg-[#ebf6ef] border-black/5"
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
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === m ? "bg-[#adf1dc] text-[#002019] shadow-sm" : "opacity-60 hover:opacity-100"
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
                {/* Registered Email Verification */}
                <div>
                  <label className={labelClass}>Registered Email Address</label>
                  <div className="relative">
                    <img src="/mail.png" alt="Email" className={inputIconClass} />
                    <input
                      type="email"
                      autoFocus
                      placeholder="e.g. yourname@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={`${inputClass} pl-9 pr-3`}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <img src="/lock.png" alt="Password" className={inputIconClass} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
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

                {/* Confirm New Password */}
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <div className="relative">
                    <img src="/lock_reset.png" alt="Confirm Password" className={inputIconClass} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
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
                    className="flex-1 py-2 rounded-xl bg-[#adf1dc] text-[#002019] text-xs font-bold hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <img src="/lock_reset.png" alt="Save Password" className="w-4 h-4 object-contain inline-block" />
                    <span>Save Password</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Username */}
                <div>
                  <label className={labelClass}>Username</label>
                  <div className="relative">
                    <img src="/person.png" alt="Username" className={inputIconClass} />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`${inputClass} pl-9 pr-3`}
                    />
                  </div>
                </div>

                {/* Email Input (in Register mode) */}
                {mode === "register" && (
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                      <img src="/mail.png" alt="Email" className={inputIconClass} />
                      <input
                        type="email"
                        placeholder="e.g. name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputClass} pl-9 pr-3`}
                      />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <img src="/lock.png" alt="Password" className={inputIconClass} />
                    <input
                      type={showPassword ? "text" : "password"}
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

                {/* Confirm Password (Register mode) */}
                {mode === "register" && (
                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <div className="relative">
                      <img src="/lock_reset.png" alt="Confirm Password" className={inputIconClass} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClass} pl-9 pr-3`}
                      />
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password Row (Sign In mode) */}
                {mode === "signin" && (
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none opacity-80 hover:opacity-100 transition">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-[#256959] cursor-pointer"
                      />
                      <span className="text-[11px]">Remember me</span>
                    </label>
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

                {/* Action Button */}
                <button
                  type="submit"
                  className="w-full mt-1 py-2 rounded-xl bg-[#adf1dc] text-[#002019] text-xs sm:text-sm font-bold hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <img
                    src={mode === "signin" ? "/login.png" : "/how_to_reg.png"}
                    alt={mode === "signin" ? "Login" : "Register"}
                    className="w-4 h-4 object-contain inline-block"
                  />
                  <span>{mode === "signin" ? "Login" : "Create Account"}</span>
                </button>
              </>
            )}
          </form>

          {/* Quick Demo Access Button */}
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
