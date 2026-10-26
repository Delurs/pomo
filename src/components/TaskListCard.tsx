import { useState } from "react";
import type { Task } from "../types/pomo";

interface TaskListCardProps {
    isDark: boolean;
    tasks: Task[];
    activeTaskId?: string | null;
    onQuickAddTask?: (title: string) => void;
    onToggleTask: (id: string) => void;
    onToggleSubtask: (taskId: string, subtaskId: string) => void;
    onEditTask: (task: Task) => void;
    onStartTask: (task: Task) => void;
    onStopTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
    onOpenDetailedModal: (initialTitle?: string) => void;
}

type PriorityFilter = "all" | "focus" | "flow" | "later";

export default function TaskListCard({
    isDark,
    tasks,
    activeTaskId,
    onToggleTask,
    onToggleSubtask,
    onEditTask,
    onStartTask,
    onStopTask,
    onDeleteTask,
    onOpenDetailedModal,
}: TaskListCardProps) {
    const [quickInput, setQuickInput] = useState<string>("");
    const [filter, setFilter] = useState<PriorityFilter>("all");
    const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
    const [showCompleted, setShowCompleted] = useState<boolean>(false);

    const toggleExpand = (taskId: string) => {
        setExpandedTaskIds((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    // Opens the detailed task modal immediately with whatever is in quickInput (even if blank)
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        onOpenDetailedModal(quickInput.trim());
        setQuickInput("");
    };

    // Format "YYYY-MM-DD" + "HH:mm" into a human-friendly format (e.g., "Apr 15, 2:30 PM")
    const formatDeadline = (dateStr?: string, timeStr?: string) => {
        if (!dateStr) return "";
        try {
            const [year, month, day] = dateStr.split("-").map(Number);
            const date = new Date(year, month - 1, day);
            const monthNames = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

            if (!timeStr) return formattedDate;

            const [hours, minutes] = timeStr.split(":").map(Number);
            const period = hours >= 12 ? "PM" : "AM";
            const formattedHour = hours % 12 || 12;
            const formattedTime = `${formattedHour}:${String(minutes).padStart(2, "0")} ${period}`;

            return `${formattedDate} • ${formattedTime}`;
        } catch {
            return `${dateStr} ${timeStr || ""}`.trim();
        }
    };

    const activeTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    const filteredActiveTasks = activeTasks.filter((t) => {
        if (filter === "all") return true;
        return t.priority === filter;
    });

    const sortedActiveTasks = [...filteredActiveTasks].sort((a, b) => {
        if (a.priority === "focus" && b.priority !== "focus") return -1;
        if (a.priority !== "focus" && b.priority === "focus") return 1;
        return 0;
    });

    return (
        <section
            className={`w-full h-[220px] sm:h-[230px] flex-shrink-0 rounded-2xl p-3 border shadow-sm transition-colors flex flex-col justify-between overflow-hidden ${isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5"
                }`}
        >
            {/* Top Header & Quick Add */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                        <img src="/edit_note.png" alt="Tasks" className="w-4 h-4 object-contain inline-block" />
                        <h2 className="text-xs font-bold">Tasks</h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-[#adf1dc] text-[#002019] text-[10.5px] font-bold">
                            {completedTasks.length} of {tasks.length} Done
                        </span>
                    </div>
                </div>

                {/* Filters + Quick Input Row */}
                <div className="flex items-center gap-1.5 mb-1.5">
                    {/* Quick Input Bar */}
                    <form onSubmit={handleAddTask} className="relative flex-1 flex items-center">
                        <input
                            type="text"
                            value={quickInput}
                            onChange={(e) => setQuickInput(e.target.value)}
                            placeholder="Add a task..."
                            className={`w-full h-7 pl-3 pr-8 rounded-full text-[11px] border focus:outline-none focus:ring-1 focus:ring-[#adf1dc] transition ${isDark
                                    ? "bg-[#161b1a] border-white/5 placeholder-white/30"
                                    : "bg-[#ebf6ef] border-black/5 placeholder-black/40"
                                }`}
                        />
                        <button
                            type="submit"
                            aria-label="Add task"
                            title="Add task"
                            className="absolute right-1 w-5.5 h-5.5 rounded-full bg-[#adf1dc] text-[#002019] flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer shadow-xs"
                        >
                            <img src="/add.png" alt="Add" className="w-3.5 h-3.5 object-contain" />
                        </button>
                    </form>

                    {/* Compact Pace Filters */}
                    <div
                        className={`flex items-center p-0.5 rounded-full border ${isDark ? "bg-[#161b1a] border-white/5" : "bg-[#ebf6ef] border-black/5"
                            }`}
                    >
                        {(
                            [
                                { id: "all", label: "All" },
                                { id: "focus", label: "Priority" },
                                { id: "flow", label: "Flow" },
                                { id: "later", label: "Someday" },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setFilter(tab.id)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${filter === tab.id
                                        ? "bg-[#adf1dc] text-[#002019] font-bold shadow-xs"
                                        : "opacity-60 hover:opacity-100"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Task List Scroll Container */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1.5">
                {/* ACTIVE TASKS SECTION */}
                {sortedActiveTasks.length === 0 && completedTasks.length === 0 ? (
                    <div
                        className={`h-full flex items-center justify-center rounded-lg py-3 px-3 text-center border border-dashed ${isDark ? "border-white/10" : "border-black/10"
                            }`}
                    >
                        <p className="text-[10px] opacity-50">
                            No tasks scheduled yet. Add a task above or click "+" to begin.
                        </p>
                    </div>
                ) : sortedActiveTasks.length === 0 ? (
                    <div className="py-2 text-center text-[10.5px] opacity-50 italic">
                        All active tasks finished for this filter.
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {sortedActiveTasks.map((task) => {
                            const isOngoing = activeTaskId === task.id;
                            const hasSubtasks = Boolean(task.subtasks && task.subtasks.length > 0);
                            const isExpanded = Boolean(expandedTaskIds[task.id]);
                            const deadlineFormatted = formatDeadline(task.reminderDate, task.reminderTime);

                            return (
                                <li
                                    key={task.id}
                                    className={`rounded-lg transition border p-1.5 sm:p-2 ${isOngoing
                                            ? isDark
                                                ? "bg-[#162720] border-[#adf1dc]/70 ring-1 ring-[#adf1dc]/50"
                                                : "bg-[#e5f8ee] border-[#adf1dc] ring-1 ring-[#adf1dc]/60"
                                            : isDark
                                                ? "bg-[#161b1a] border-white/5"
                                                : "bg-[#ebf6ef] border-black/5"
                                        }`}
                                >
                                    <div
                                        onClick={() => hasSubtasks && toggleExpand(task.id)}
                                        className={`flex items-center justify-between gap-2 ${hasSubtasks ? "cursor-pointer" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            {/* Checkbox */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleTask(task.id);
                                                }}
                                                className={`w-4 h-4 rounded-full flex items-center justify-center transition flex-shrink-0 cursor-pointer group/chk ${isDark
                                                        ? "bg-[#29332e] hover:border-[#adf1dc]/50 border border-white/15"
                                                        : "bg-white hover:border-[#adf1dc] border border-black/20"
                                                    }`}
                                            >
                                                <img
                                                    src="/check.png"
                                                    alt="Complete"
                                                    className="w-2.5 h-2.5 object-contain opacity-0 group-hover/chk:opacity-50 transition-opacity"
                                                />
                                            </button>

                                            {/* Task Info */}
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                                    <span className="text-[11px] truncate font-semibold">
                                                        {task.title}
                                                    </span>
                                                    {task.sprouts > 0 && (
                                                        <span className="text-[9px] font-medium opacity-65 flex-shrink-0">
                                                            {task.sprouts} ({task.sprouts * 25}m)
                                                        </span>
                                                    )}
                                                    {hasSubtasks && (
                                                        <span className="text-[9px] font-semibold text-[#256959] dark:text-[#adf1dc] opacity-75 flex items-center gap-0.5 flex-shrink-0 ml-1">
                                                            <span>{task.subtasks.length} steps</span>
                                                            <img
                                                                src={isExpanded ? "/chevron_up.png" : "/chevron_down.png"}
                                                                alt={isExpanded ? "Collapse" : "Expand"}
                                                                className="w-2.5 h-2.5 object-contain"
                                                            />
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Someday Status Deadline with Month, Day, and Time */}
                                                {task.priority === "later" && deadlineFormatted && (
                                                    <div className="flex items-center gap-1 text-[9px] font-medium text-[#256959] dark:text-[#adf1dc] opacity-80 mt-0.5">
                                                        <img
                                                            src="/calendar_clock.png"
                                                            alt="Deadline"
                                                            className="w-3 h-3 object-contain inline-block flex-shrink-0"
                                                        />
                                                        <span>Due: {deadlineFormatted}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {task.priority === "focus" && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-[#ffdade] text-[#874e58] text-[8px] uppercase font-bold tracking-wider">
                                                    Priority
                                                </span>
                                            )}
                                            {task.priority === "later" && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-[#ebd5ff] text-[#6b21a8] text-[8px] uppercase font-bold tracking-wider">
                                                    Someday
                                                </span>
                                            )}

                                            {/* Ongoing / Start */}
                                            {isOngoing ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onStopTask(task);
                                                    }}
                                                    title="Click to Stop"
                                                    className="relative group/btn overflow-hidden px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#002019] text-[#adf1dc] dark:bg-[#adf1dc] dark:text-[#002019] ring-1.5 ring-[#adf1dc]/70 shadow-xs cursor-pointer min-w-[70px] h-6 flex items-center justify-center transition-all"
                                                >
                                                    <span className="flex items-center gap-1 transition-opacity duration-200 group-hover/btn:opacity-0">
                                                        <img src="/Timer.png" alt="Ongoing" className="w-3 h-3 object-contain inline-block" />
                                                        <span>Ongoing</span>
                                                    </span>
                                                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1 bg-[#ffdade] text-[#874e58] font-bold text-[10px] rounded-full">
                                                        <img src="/stop.png" alt="Stop" className="w-3 h-3 object-contain inline-block" />
                                                        <span>Stop</span>
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onStartTask(task);
                                                    }}
                                                    className="px-3 py-0.5 rounded-full bg-[#adf1dc] text-[#002019] text-[10px] font-bold hover:bg-[#8ee9cc] hover:scale-105 active:scale-95 transition shadow-xs cursor-pointer h-6 flex items-center justify-center"
                                                >
                                                    Start
                                                </button>
                                            )}

                                            {/* Edit Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditTask(task);
                                                }}
                                                className="opacity-70 hover:opacity-100 hover:text-[#256959] dark:hover:text-[#adf1dc] p-0.5 transition cursor-pointer"
                                                title="Edit task"
                                            >
                                                <img src="/edit.png" alt="Edit" className="w-3.5 h-3.5 object-contain" />
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteTask(task.id);
                                                }}
                                                className="opacity-70 hover:opacity-100 hover:text-red-400 p-0.5 transition cursor-pointer"
                                                title="Delete task"
                                            >
                                                <img src="/close.png" alt="Delete" className="w-3.5 h-3.5 object-contain" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subtask stepping stones */}
                                    {hasSubtasks && isExpanded && (
                                        <div className="mt-1.5 pt-1 border-t border-black/5 dark:border-white/5 pl-2 ml-1.5 border-l-2 border-[#adf1dc]/50 space-y-0.5">
                                            {task.subtasks.map((subtask) => (
                                                <div
                                                    key={subtask.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleSubtask(task.id, subtask.id);
                                                    }}
                                                    className="flex items-center gap-1.5 py-0.5 px-1 rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                                                >
                                                    <span
                                                        className={`w-3 h-3 rounded-full flex items-center justify-center transition flex-shrink-0 ${subtask.completed
                                                                ? "bg-[#adf1dc] text-[#002019]"
                                                                : "border border-black/20 dark:border-white/20 text-transparent"
                                                            }`}
                                                    >
                                                        {subtask.completed && (
                                                            <img
                                                                src="/check.png"
                                                                alt="Completed"
                                                                className="w-2 h-2 object-contain"
                                                            />
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`text-[10px] ${subtask.completed ? "line-through opacity-50" : "opacity-85"
                                                            }`}
                                                    >
                                                        {subtask.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* COMPLETED TASKS SECTION */}
                {completedTasks.length > 0 && (
                    <div className="pt-1 mt-1 border-t border-black/5 dark:border-white/5">
                        <button
                            type="button"
                            onClick={() => setShowCompleted(!showCompleted)}
                            className="w-full flex items-center justify-between text-[10px] font-semibold opacity-60 hover:opacity-100 py-1 transition cursor-pointer"
                        >
                            <span className="flex items-center gap-1">
                                <img
                                    src={showCompleted ? "/chevron_down.png" : "/chevron_right.png"}
                                    alt={showCompleted ? "Collapse" : "Expand"}
                                    className="w-3 h-3 object-contain"
                                />
                                <span>Completed Tasks ({completedTasks.length})</span>
                            </span>
                            <span className="text-[9px] underline opacity-75">
                                {showCompleted ? "Hide" : "Show"}
                            </span>
                        </button>

                        {showCompleted && (
                            <ul className="space-y-1 mt-1 animate-in fade-in duration-150">
                                {completedTasks.map((task) => (
                                    <li
                                        key={task.id}
                                        className={`flex items-center justify-between p-1.5 rounded-lg border transition ${isDark
                                                ? "bg-[#161b1a]/60 border-white/5 text-zinc-400"
                                                : "bg-[#ebf6ef]/50 border-black/5 text-zinc-600"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <button
                                                type="button"
                                                onClick={() => onToggleTask(task.id)}
                                                title="Click to restore to active tasks"
                                                className="w-4 h-4 rounded-full bg-[#adf1dc] text-[#002019] flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                                            >
                                                <img
                                                    src="/check.png"
                                                    alt="Completed"
                                                    className="w-2.5 h-2.5 object-contain"
                                                />
                                            </button>
                                            <span className="text-[11px] truncate line-through opacity-60">
                                                {task.title}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => onToggleTask(task.id)}
                                                className="text-[9px] px-1.5 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition cursor-pointer"
                                            >
                                                Restore
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDeleteTask(task.id)}
                                                className="opacity-50 hover:opacity-100 hover:text-red-400 p-0.5 transition cursor-pointer"
                                                title="Delete completed task"
                                            >
                                                <img src="/close.png" alt="Delete" className="w-3.5 h-3.5 object-contain" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}