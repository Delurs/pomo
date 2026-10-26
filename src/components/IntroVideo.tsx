import { useState, useRef, useEffect } from "react";

interface IntroVideoProps {
    onComplete: () => void;
}

export default function IntroVideo({ onComplete }: IntroVideoProps) {
    // States: 'idle' (waiting for user click), 'playing' (video running), 'fading' (fade out animation)
    const [phase, setPhase] = useState<"idle" | "playing" | "fading">("idle");
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const handleStart = () => {
        if (phase === "idle") {
            setPhase("playing");
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch((err) => {
                    console.warn("Autoplay was prevented:", err);
                    // If video cannot play, smoothly fade out to not block user
                    handleFadeOut();
                });
            }
        }
    };

    const handleFadeOut = () => {
        setPhase("fading");
    };

    useEffect(() => {
        if (phase === "fading") {
            const timer = setTimeout(() => {
                onComplete();
            }, 1000); // 1-second smooth fade duration
            return () => clearTimeout(timer);
        }
    }, [phase, onComplete]);

    return (
        <div
            onClick={phase === "idle" ? handleStart : undefined}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0c1410] text-[#e8f3ec] select-none transition-opacity duration-1000 ease-out ${
                phase === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
            } ${phase === "idle" ? "cursor-pointer" : ""}`}
        >
            {/* The Intro Video */}
            <video
                ref={videoRef}
                src="/Intro.mp4"
                playsInline
                preload="auto"
                onEnded={handleFadeOut}
                onError={() => {
                    console.warn("Error loading intro video, continuing to app.");
                    handleFadeOut();
                }}
                className={`w-full h-full object-contain transition-opacity duration-700 ${
                    phase === "playing" || phase === "fading" ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Waiting for User Click Landing Screen */}
            {phase === "idle" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0c1410]/95 backdrop-blur-md">
                    <div className="flex flex-col items-center animate-fade-in">
                        {/* Logo with gentle ambient glow */}
                        <div className="relative mb-6">
                            <div className="absolute -inset-4 rounded-full bg-[#adf1dc]/20 blur-xl animate-pulse" />
                            <img
                                src="/logo.png"
                                alt="Pomodoro Tortoise Logo"
                                className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl"
                            />
                        </div>

                        {/* App Brand */}
                        <img
                            src="/logo-name.png"
                            alt="Pomodoro Tortoise"
                            className="h-8 sm:h-10 object-contain mb-4 brightness-[2] contrast-125"
                        />

                        <p className="text-sm sm:text-base text-[#adf1dc] font-medium tracking-wide mb-8 opacity-90">
                            Crafted for quiet minds
                        </p>

                        {/* Interactive Click Prompt */}
                        <div className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#adf1dc]/15 border border-[#adf1dc]/30 text-[#adf1dc] font-semibold text-xs sm:text-sm hover:bg-[#adf1dc]/25 transition transform hover:scale-105 active:scale-95 shadow-lg">
                            <span className="material-symbols-outlined text-[18px] animate-pulse">
                                touch_app
                            </span>
                            <span>Click anywhere to begin</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Skip Button (Available during video playback or idle) */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    handleFadeOut();
                }}
                className="absolute top-5 right-5 sm:top-7 sm:right-7 z-10 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white/80 hover:text-white text-xs font-medium backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="Skip Intro"
            >
                <span>Skip</span>
                <img src="/arrow_forward.png" alt="Skip" className="w-3.5 h-3.5 object-contain" />
            </button>
        </div>
    );
}
