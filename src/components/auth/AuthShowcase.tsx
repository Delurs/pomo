import { motion } from "motion/react";

interface AuthShowcaseProps {
  isDark: boolean;
}

export default function AuthShowcase({ isDark }: AuthShowcaseProps) {
  const pillBaseClass = `backdrop-blur-md border rounded-2xl px-3.5 py-2.5 shadow-lg flex items-center gap-2.5 select-none pointer-events-none ${
    isDark
      ? "bg-[#1f2725]/85 border-white/10 text-[#e8f3ec] shadow-black/30"
      : "bg-white/85 border-white/60 text-[#141e19] shadow-[#256959]/10"
  }`;

  return (
    <section
      className={`hidden lg:flex lg:w-1/2 h-screen relative items-center justify-center overflow-hidden select-none ${
        isDark
          ? "bg-gradient-to-br from-[#1a2a24] via-[#15221d] to-[#0e1713]"
          : "bg-gradient-to-br from-[#e3faee] via-[#c8f3df] to-[#adf1dc]"
      }`}
    >
      {/* Ambient Radial Glows */}
      <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-[#adf1dc]/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#256959]/25 blur-3xl pointer-events-none" />

      {/* Concentric Sanctuary Aura Rings */}
      <div
        className={`absolute w-[26rem] h-[26rem] xl:w-[30rem] xl:h-[30rem] rounded-full border pointer-events-none ${
          isDark ? "border-white/5" : "border-[#256959]/10"
        }`}
      />
      <div
        className={`absolute w-[36rem] h-[36rem] xl:w-[40rem] xl:h-[40rem] rounded-full border border-dashed pointer-events-none ${
          isDark ? "border-white/5" : "border-[#256959]/10"
        }`}
      />

      {/* Floating Preview Pill 1: Focus Timer (Top Left) */}
      <motion.div
        initial={{ opacity: 0, x: -16, y: -8 }}
        animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.1 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
        }}
        className={`${pillBaseClass} absolute top-[14%] left-[8%] xl:left-[11%] z-20`}
      >
        <div className="w-8 h-8 rounded-xl bg-[#ADF1DC] flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs">
          <img src="/Timer.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="text-left">
          <div className="text-xs font-extrabold leading-tight">25:00 Focus Timer</div>
          <div className="text-[10px] opacity-65">Timed work & breaks</div>
        </div>
      </motion.div>

      {/* Floating Preview Pill 2: Study Music (Top Right) */}
      <motion.div
        initial={{ opacity: 0, x: 16, y: -8 }}
        animate={{ opacity: 1, x: 0, y: [0, 6, 0] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.2 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
        className={`${pillBaseClass} absolute top-[18%] right-[7%] xl:right-[10%] z-20`}
      >
        <div className="w-8 h-8 rounded-xl bg-[#ADF1DC] flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs">
          <img src="/headphones.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="text-left">
          <div className="text-xs font-extrabold leading-tight">Calming Study Music</div>
          <div className="text-[10px] opacity-65">Lo-Fi, Spotify & YouTube</div>
        </div>
      </motion.div>

      {/* Floating Preview Pill 3: Step-by-Step Tasks (Bottom Left) */}
      <motion.div
        initial={{ opacity: 0, x: -16, y: 8 }}
        animate={{ opacity: 1, x: 0, y: [0, 5, 0] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.3 },
          y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
        }}
        className={`${pillBaseClass} absolute bottom-[16%] left-[9%] xl:left-[12%] z-20`}
      >
        <div className="w-8 h-8 rounded-xl bg-[#ADF1DC] flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs">
          <img src="/leaves.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="text-left">
          <div className="text-xs font-extrabold leading-tight">Step-by-Step Tasks</div>
          <div className="text-[10px] opacity-65">Synced across devices</div>
        </div>
      </motion.div>

      {/* Floating Preview Pill 4: Analytics (Bottom Right) */}
      <motion.div
        initial={{ opacity: 0, x: 16, y: 8 }}
        animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.35 },
          y: { duration: 5.2, repeat: Infinity, ease: "easeInOut" },
        }}
        className={`${pillBaseClass} absolute bottom-[14%] right-[8%] xl:right-[11%] z-20`}
      >
        <div className="w-8 h-8 rounded-xl bg-[#ADF1DC] flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs">
          <img src="/pie_chart.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="text-left">
          <div className="text-xs font-extrabold leading-tight">Daily Progress</div>
          <div className="text-[10px] opacity-65">Visual habit calendar</div>
        </div>
      </motion.div>

      {/* Centerpiece 3D Tortoise Mascot & Brand */}
      <div className="relative z-10 flex flex-col items-center text-center px-8">
        <motion.img
          src="/logo.png"
          alt="Pomodoro Tortoise"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-64 xl:w-80 max-h-[42vh] object-contain drop-shadow-2xl"
        />
        <img
          src="/logo-name.png"
          alt="Pomodoro Tortoise"
          className={`h-8 xl:h-10 mt-4 object-contain ${
            isDark ? "brightness-[2.2] contrast-125" : ""
          }`}
        />
        <p
          className={`mt-2.5 text-xs xl:text-sm font-semibold tracking-wide max-w-xs ${
            isDark ? "text-[#adf1dc]/85" : "text-[#1d5649]"
          }`}
        >
          Calm audio for deep study and mindful breaks.
        </p>
      </div>
    </section>
  );
}
