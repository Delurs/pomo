interface AuthShowcaseProps {
  isDark: boolean;
}

export default function AuthShowcase({ isDark }: AuthShowcaseProps) {
  return (
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
  );
}
