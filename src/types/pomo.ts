export interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    category: "reading" | "writing" | "coding" | "creative" | "wellbeing" | "chores";
    sprouts: number;
    priority: "flow" | "focus" | "later";
    subtasks: Subtask[];
    completed: boolean;
    createdAt: string; // Stores "YYYY-MM-DD" for the Calendar & Day/Week/Month filter
    deadline?: string; // Optional ISO datetime string for "Someday" notifications (Feature #3)
    notified?: boolean; // Tracks if browser notification already fired
    reminderDate?: string;
    reminderTime?: string;
}

export type TimerMode = "focus" | "short" | "long" | "custom";

export interface TimerConfig {
    label: string;
    subLabel: string;
    duration: number; // in seconds
}

export const TIMER_CONFIGS: Record<TimerMode, TimerConfig> = {
    focus: { label: "Focus", subLabel: "Deep Work Ritual", duration: 25 * 60 },
    short: { label: "Short Break", subLabel: "Restful Pause", duration: 5 * 60 },
    long: { label: "Long Break", subLabel: "Gentle Walk & Recharge", duration: 15 * 60 },
    custom: { label: "Custom", subLabel: "Custom Ritual", duration: 25 * 60 },
};

// Colors & labels used by the Pie Chart in AnalyticsCard.tsx
export const CATEGORY_META: Record<
    Task["category"],
    { label: string; color: string; emoji: string; iconSrc: string }
> = {
    reading: { label: "Reading & Study", color: "#ADF1DC", emoji: "📖", iconSrc: "/open_book.png" },
    writing: { label: "Writing", color: "#FB923C", emoji: "✍️", iconSrc: "/writing.png" },
    coding: { label: "Deep Coding", color: "#38BDF8", emoji: "💻", iconSrc: "/laptop.png" },
    creative: { label: "Creative", color: "#F472B6", emoji: "🎨", iconSrc: "/art.png" },
    wellbeing: { label: "Well-being", color: "#A855F7", emoji: "🌿", iconSrc: "/fern.png" },
    chores: { label: "Chores", color: "#FBBF24", emoji: "🧹", iconSrc: "/broom.png" },
};

export interface CategoryOption {
    id: Task["category"];
    name: string;
    icon: string;
    label: string;
    color: string;
}

export const CATEGORY_LIST: CategoryOption[] = (
    Object.keys(CATEGORY_META) as Task["category"][]
).map((key) => ({
    id: key,
    name: CATEGORY_META[key].label,
    icon: CATEGORY_META[key].iconSrc,
    label: CATEGORY_META[key].label,
    color: CATEGORY_META[key].color,
}));