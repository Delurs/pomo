import { Link } from "react-router";
import { motion } from "motion/react";

export interface LandingPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  isAuthenticated?: boolean;
}

const FEATURES = [
  {
    id: "timer",
    badge: "Timed work and breaks.",
    icon: "/Timer.png",
    title: "Simple Focus Timer",
    description:
      "Stay on track with 25-minute focus sessions, custom timers, and gentle alarm chimes.",
    highlights: [
      "Visual countdown ring with quick +15s or -15s adjustments",
      "Set your own custom hours, minutes, and seconds",
      "Gentle chime that rings clearly when your timer ends",
    ],
  },
  {
    id: "tasks",
    badge: "Mindful Milestones",
    icon: "/leaves.png",
    title: "Step-by-Step Tasks",
    description:
      "Break big goals into small, manageable steps and organize your day without stress.",
    highlights: [
      "Break any task into smaller, easy-to-finish checklists",
      "Organize your pace by Priority, Gentle Flow, or Someday",
      "Automatically saves and syncs across all your devices",
    ],
  },
  {
    id: "media",
    badge: "Lo-Fi • Spotify • YouTube",
    icon: "/headphones.png",
    title: "Calming Study Music",
    description:
      "Listen to soothing background sounds or your favorite Spotify and YouTube playlists.",
    highlights: [
      "Built-in rain, cozy cafe, soft piano, and forest sounds",
      "Play your own YouTube or Spotify playlists right in the app",
      "Music automatically pauses when your focus session finishes",
    ],
  },
];

export default function LandingPage({
  isDark,
  isAuthenticated = false,
}: LandingPageProps) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between relative overflow-x-hidden transition-colors duration-300 ${
        isDark ? "bg-[#141E19] text-[#e8f3ec]" : "bg-[#FAF9F6] text-[#141e19]"
      }`}
    >
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[48rem] h-[28rem] rounded-full bg-[#ADF1DC]/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#256959]/15 blur-3xl" />

      {/* Top Navigation Bar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
          isDark
            ? "bg-[#141E19]/80 border-white/5"
            : "bg-[#FAF9F6]/80 border-black/5"
        }`}
      >
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Brand Header */}
          <Link
            to="/"
            className="flex items-center gap-2.5 select-none group"
          >
            <img
              src="/logo.png"
              alt="Pomodoro Tortoise Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-sm sm:text-base tracking-tight">
              Pomodoro Tortoise
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                isDark
                  ? "bg-[#1f2725] border-white/10 text-[#e8f3ec] hover:border-[#ADF1DC]/40 hover:bg-[#26312e]"
                  : "bg-white border-black/10 text-[#141e19] hover:border-black/20 hover:bg-[#f1fcf4] shadow-2xs"
              }`}
            >
              {isAuthenticated ? "Account" : "Sign In"}
            </Link>

            <Link
              to="/app"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#ADF1DC] text-[#002019] shadow-xs hover:brightness-95 transition"
            >
              <span>Enter as guest</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10 flex flex-col justify-center">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-14 sm:mb-20">
          {/* Left 3D Tortoise Mascot Showcase (Borderless & Large) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="relative flex flex-col items-center text-center">
              <img
                src="/logo.png"
                alt="Pomodoro Tortoise 3D Mascot"
                className="w-72 h-72 sm:w-84 sm:h-84 lg:w-96 lg:h-96 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />

              <img
                src="/logo-name.png"
                alt="Pomodoro Tortoise"
                className={`h-7 sm:h-8 object-contain mt-2 ${
                  isDark ? "brightness-[2.2] contrast-125" : ""
                }`}
              />

              <p className="text-xs sm:text-sm opacity-65 mt-2 max-w-xs">
                Calm audio for deep study and mindful breaks.
              </p>
            </div>
          </motion.div>

          {/* Right Hero Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.1] mb-4">
              Slow down.{" "}
              <span
                className={
                  isDark ? "text-[#ADF1DC]" : "text-[#256959]"
                }
              >
                Focus deeply.
              </span>{" "}
              Grow steadily.
            </h1>

            <p className="text-sm sm:text-base lg:text-lg opacity-75 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-7">
              A calm, single-screen Pomodoro sanctuary and ambient study beats
              companion engineered for distraction-free deep work.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <Link
                to="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#ADF1DC] text-[#002019] font-extrabold text-sm shadow-lg shadow-[#ADF1DC]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Enter as guest</span>
                <img
                  src="/arrow_forward.png"
                  alt=""
                  className="w-4 h-4 object-contain"
                />
              </Link>

              <Link
                to="/register"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isDark
                    ? "bg-[#1f2725]/90 border-white/15 text-[#e8f3ec] hover:border-[#ADF1DC]/50 hover:bg-[#26312e]"
                    : "bg-white border-black/10 text-[#141e19] hover:border-black/20 hover:bg-[#f1fcf4] shadow-xs"
                }`}
              >
                <img
                  src="/person_add.png"
                  alt=""
                  className="w-4 h-4 object-contain opacity-80"
                />
                <span>Create Free Account</span>
              </Link>
            </div>

            {/* Subtle Trust Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs opacity-60">
              <span className="inline-flex items-center gap-1.5">
                <img src="/check_circle.png" alt="" className="w-3.5 h-3.5 object-contain" />
                Zero-friction Guest Mode
              </span>
              <span className="inline-flex items-center gap-1.5">
                <img src="/check_circle.png" alt="" className="w-3.5 h-3.5 object-contain" />
                7 Pastel Sanctuary Themes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <img src="/check_circle.png" alt="" className="w-3.5 h-3.5 object-contain" />
                Cloud Sync Across Devices
              </span>
            </div>
          </motion.div>
        </section>

        {/* Feature Showcase Matrix (3 Bento Cards) */}
        <section aria-labelledby="features-heading">
          <div className="text-center mb-8 sm:mb-10">
            <h2
              id="features-heading"
              className="text-xl sm:text-2xl font-extrabold tracking-tight"
            >
              Engineered for Unhurried Deep Work
            </h2>
            <p className="text-xs sm:text-sm opacity-65 mt-1">
              Everything you need for a calm focus ritual—all on a single
              distraction-free screen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((feature, idx) => (
              <motion.article
                key={feature.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 * (idx + 1) }}
                className={`rounded-3xl p-6 border shadow-lg flex flex-col justify-between transition-all hover:-translate-y-1 ${
                  isDark
                    ? "bg-[#1f2725]/90 border-white/10 hover:border-[#ADF1DC]/30"
                    : "bg-white border-black/8 hover:border-[#256959]/25 shadow-[#256959]/5"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#ADF1DC] text-[#002019] flex items-center justify-center p-2.5 shadow-xs">
                      <img
                        src={feature.icon}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isDark
                          ? "bg-[#141E19] border-white/10 text-[#ADF1DC]"
                          : "bg-[#f1fcf4] border-black/5 text-[#256959]"
                      }`}
                    >
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] opacity-75 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                </div>

                <ul className="space-y-2 pt-3 border-t border-black/5 dark:border-white/5 text-[11px] sm:text-xs opacity-75">
                  {feature.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <img
                        src="/check_circle.png"
                        alt=""
                        className="w-3.5 h-3.5 object-contain mt-0.5 flex-shrink-0"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer
        className={`w-full border-t py-5 px-4 sm:px-6 text-xs relative z-10 ${
          isDark
            ? "border-white/5 bg-[#141E19]/90"
            : "border-black/5 bg-[#FAF9F6]/90"
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 opacity-75">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
            <span>Crafted by</span>
            <a
              href="https://github.com/Delurs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline"
            >
              @Delurs
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Delurs/pomo"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 hover:underline font-medium transition"
            >
              GitHub Repository
            </a>
            <span className="opacity-30">•</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isDark
                  ? "bg-[#1f2725] border-white/10 text-[#ADF1DC]"
                  : "bg-[#ebf6ef] border-black/5 text-[#256959]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              v2.0 Live
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
