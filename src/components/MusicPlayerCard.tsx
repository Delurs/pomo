import { useState, useEffect } from "react";

interface MusicPlayerCardProps {
    isDark: boolean;
    stopMusicSignal?: number;
}

const MOOD_PRESETS = [
    {
        id: "rain",
        label: "Lo-Fi Rain",
        iconSrc: "/rain.png",
        embedUrl: "https://www.youtube.com/embed/BCxTQq0UiFs?si=jxvIJulMSqdvLXuM",
    },
    {
        id: "cafe",
        label: "Cozy Cafe",
        iconSrc: "/coffee.png",
        embedUrl: "https://www.youtube.com/embed/tGfeZaCElno?si=0SUda0CkpaUsHS98",
    },
    {
        id: "piano",
        label: "Soft Piano",
        iconSrc: "/piano.png",
        embedUrl: "https://www.youtube.com/embed/6X_OEUFV0v4?si=jCLnDqgIS80NPBzF",
    },
    {
        id: "leaves",
        label: "Forest Breeze",
        iconSrc: "/leaves.png",
        embedUrl: "https://www.youtube.com/embed/jo3SwLB84sg?si=oNBFBWomE1y_cCFv",
    },
];

export default function MusicPlayerCard({ isDark, stopMusicSignal = 0 }: MusicPlayerCardProps) {
    // Starts completely empty until user selects a chip or pastes a link!
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [musicInputUrl, setMusicInputUrl] = useState<string>("");
    const [embedUrl, setEmbedUrl] = useState<string>("");

    // Automatically stop music and clear player when timer finishes so alarm sounds clearly
    useEffect(() => {
        if (stopMusicSignal > 0) {
            setEmbedUrl("");
            setSelectedMood(null);
        }
    }, [stopMusicSignal]);

    const handleLoadCustomMedia = (e: React.FormEvent) => {
        e.preventDefault();
        const url = musicInputUrl.trim();
        if (!url) return;

        setSelectedMood(null);

        if (url.includes("youtube.com/watch?v=")) {
            const vidId = url.split("watch?v=")[1]?.split("&")[0];
            setEmbedUrl(`https://www.youtube.com/embed/${vidId}`);
        } else if (url.includes("youtu.be/")) {
            const vidId = url.split("youtu.be/")[1]?.split("?")[0];
            setEmbedUrl(`https://www.youtube.com/embed/${vidId}`);
        } else if (url.includes("open.spotify.com/")) {
            const cleanPath = url.replace("https://", "").replace("http://", "").replace("open.spotify.com/", "").split("?")[0];
            setEmbedUrl(`https://open.spotify.com/embed/${cleanPath}`);
        }

        setMusicInputUrl("");
    };

    return (
        <section
            className={`w-full flex-1 min-h-0 rounded-2xl p-3 sm:p-3.5 border shadow-sm transition-colors flex flex-col justify-between overflow-hidden ${isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5"
                }`}
        >
            {/* Header & Controls Bar */}
            <div className="flex-shrink-0 mb-2">
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                        <img src="/headphones.png" alt="Study Beats" className="w-4 h-4 object-contain inline-block" />
                        <h2 className="text-[11px] sm:text-xs font-bold">Study Beats</h2>
                    </div>
                    {embedUrl && (
                        <button
                            type="button"
                            onClick={() => {
                                setEmbedUrl("");
                                setSelectedMood(null);
                            }}
                            className="text-[9px] opacity-60 hover:opacity-100 underline cursor-pointer"
                        >
                            Clear Player
                        </button>
                    )}
                </div>

                {/* Mood Chips: 2x2 grid on small screens, flex on larger screens */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 mb-2 w-full">
                    {MOOD_PRESETS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                setSelectedMood(item.id);
                                setEmbedUrl(item.embedUrl);
                            }}
                            className={`w-full sm:w-auto px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 text-center ${selectedMood === item.id
                                ? "bg-[#adf1dc] text-[#002019] shadow-sm font-semibold"
                                : isDark
                                    ? "bg-[#161b1a] text-slate-300 hover:bg-[#283330]"
                                    : "bg-[#ebf6ef] text-[#57615c] hover:bg-[#e0ebe3]"
                                }`}
                        >
                            <img src={item.iconSrc} alt={item.label} className="w-3.5 h-3.5 object-contain flex-shrink-0" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Custom Link Input with generous left padding so icon never overlaps placeholder */}
                <form onSubmit={handleLoadCustomMedia} className="relative flex items-center w-full">
                    <img src="/link.png" alt="Link" className="w-3.5 h-3.5 object-contain absolute left-2.5 opacity-60 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Paste YouTube or Spotify Link..."
                        value={musicInputUrl}
                        onChange={(e) => setMusicInputUrl(e.target.value)}
                        className={`w-full h-7 sm:h-7.5 pl-8 sm:pl-8.5 pr-14 sm:pr-15 rounded-full text-[10.5px] border focus:outline-none focus:ring-1 focus:ring-[#adf1dc] transition ${isDark
                            ? "bg-[#161b1a] border-white/5 placeholder-white/30"
                            : "bg-[#ebf6ef] border-black/5 placeholder-black/40"
                            }`}
                    />
                    <button
                        type="submit"
                        className="absolute right-1 px-3 py-1 rounded-full bg-[#adf1dc] text-[#002019] text-[11px] font-bold hover:scale-105 active:scale-95 transition cursor-pointer shadow-xs"
                    >
                        Load
                    </button>
                </form>
            </div>

            {/* Media Frame or Clean Empty State */}
            {embedUrl ? (
                <div className="flex-1 min-h-0 w-full rounded-xl overflow-hidden border border-black/5 dark:border-white/5 bg-black/10">
                    <iframe
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        className="w-full h-full min-h-[175px]"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title="Study Audio Stream"
                    />
                </div>
            ) : (
                <div
                    className={`flex-1 min-h-0 w-full flex items-center justify-center rounded-xl p-3 text-center border border-dashed ${isDark ? "border-white/10" : "border-black/10"
                        }`}
                >
                    <p className="text-[10px] opacity-50">
                        No audio loaded. Select a mood preset above or paste a YouTube / Spotify link.
                    </p>
                </div>
            )}
        </section>
    );
}