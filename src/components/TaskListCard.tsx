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
    // Subtasks are hidden by default. Stored per task id.
    const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

    const toggleExpand = (taskId: string) => {
        setExpandedTaskIds((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        onOpenDetailedModal(quickInput.trim());
        setQuickInput("");
    };

    const completedCount = tasks.filter((t) => t.completed).length;

    // Sort tasks: Priority tasks ("focus") go to the top of the list!
    const sortedTasks = [...tasks].sort((a, b) => {
        const aPriority = a.priority === "focus";
        const bPriority = b.priority === "focus";
        if (aPriority && !bPriority) return -1;
        if (!aPriority && bPriority) return 1;
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return 0;
    });

    return (
        <section
            className={`w-full h-[200px] sm:h-[210px] flex-shrink-0 rounded-2xl p-3 border shadow-sm transition-colors flex flex-col justify-between overflow-hidden ${isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5"
                }`}
        >
            {/* Header */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                        <img src="/edit_note.png" alt="Today's Tasks" className="w-4 h-4 object-contain inline-block" />
                        <h2 className="text-xs font-bold">Today's Tasks</h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#adf1dc] text-[#002019] text-[11px] font-bold">
                            {completedCount} of {tasks.length} Done
                        </span>
                    </div>
                </div>

                {/* Quick Task Input Bar */}
                <form onSubmit={handleAddTask} className="relative flex items-center mb-1.5">
                    <input
                        type="text"
                        value={quickInput}
                        onChange={(e) => setQuickInput(e.target.value)}
                        placeholder="Add a gentle task..."
                        className={`w-full h-7 pl-3 pr-8 rounded-full text-[11px] border focus:outline-none focus:ring-1 focus:ring-[#adf1dc] transition ${isDark
                            ? "bg-[#161b1a] border-white/5 placeholder-white/30"
                            : "bg-[#ebf6ef] border-black/5 placeholder-black/40"
                            }`}
                    />
                    <button
                        type="submit"
                        aria-label="Add task"
                        className="absolute right-1 w-5.5 h-5.5 rounded-full bg-[#adf1dc] text-[#002019] flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer shadow-xs"
                    >
                        <img src="/add.png" alt="Add" className="w-3.5 h-3.5 object-contain" />
                    </button>
                </form>
            </div>

            {/* Task List: Internal scrollable area that absorbs overflowing tasks */}
            {sortedTasks.length === 0 ? (
                <div
                    className={`flex-1 min-h-0 flex items-center justify-center rounded-lg py-3 px-3 text-center border border-dashed ${isDark ? "border-white/10" : "border-black/10"
                        }`}
                >
                    <p className="text-[10px] opacity-50">
                        No tasks scheduled yet. Add a task above or click "+" to begin.
                    </p>
                </div>
            ) : (
                <ul className="space-y-1 flex-1 min-h-0 overflow-y-auto pr-1">
                    {sortedTasks.map((task) => {
                        const isOngoing = activeTaskId === task.id;
                        const isCompleted = task.completed;
                        const hasSubtasks = Boolean(task.subtasks && task.subtasks.length > 0);
                        const isExpanded = Boolean(expandedTaskIds[task.id]);

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
                                {/* Main Task Header Row: Clicking here expands/collapses subtasks (NO start) */}
                                <div
                                    onClick={() => hasSubtasks && toggleExpand(task.id)}
                                    className={`flex items-center justify-between gap-2 ${hasSubtasks ? "cursor-pointer" : ""
                                        }`}
                                    title={hasSubtasks ? (isExpanded ? "Click to collapse subtasks" : "Click to view subtasks") : undefined}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {/* Toggle Complete Checkbox */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleTask(task.id);
                                            }}
                                            className={`w-4 h-4 rounded-full flex items-center justify-center transition flex-shrink-0 cursor-pointer ${isCompleted
                                                ? "bg-[#adf1dc] text-[#002019]"
                                                : isDark
                                                    ? "bg-[#29332e] text-transparent hover:border-[#adf1dc]/50 border border-white/15"
                                                    : "bg-white text-transparent hover:border-[#adf1dc] border border-black/20"
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[10px]">
                                                check
                                            </span>
                                        </button>

                                        {/* Task Title & Details */}
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span
                                                    className={`text-[11px] truncate ${isCompleted
                                                        ? "line-through opacity-50"
                                                        : "font-semibold"
                                                        }`}
                                                >
                                                    {task.title}
                                                </span>
                                                {task.reminderDate && (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-medium text-[#256959] dark:text-[#adf1dc] opacity-80 flex-shrink-0">
                                                        <img src="/calendar_clock.png" alt="Reminder" className="w-3 h-3 object-contain inline-block" />
                                                        <span>
                                                            Reminder {task.reminderDate} {task.reminderTime ? `@ ${task.reminderTime}` : ""}
                                                        </span>
                                                    </span>
                                                )}
                                                {task.sprouts > 0 && (
                                                    <span className="text-[9px] font-medium opacity-65 flex-shrink-0">
                                                        {task.sprouts} ({task.sprouts * 25}m)
                                                    </span>
                                                )}
                                                {hasSubtasks && (
                                                    <span className="text-[9px] font-semibold text-[#256959] dark:text-[#adf1dc] opacity-75 flex items-center gap-0.5 flex-shrink-0 ml-1">
                                                        <span>{task.subtasks.length} steps</span>
                                                        <span className="material-symbols-outlined text-[12px]">
                                                            {isExpanded ? "expand_less" : "expand_more"}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Priority Badge, Ongoing (with hover Stop), Start, Done, Edit, Delete */}
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

                                        {/* Distinct Visual States */}
                                        {isCompleted ? (
                                            <div className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-semibold opacity-60 flex items-center gap-1 h-6">
                                                <span className="material-symbols-outlined text-[12px] text-emerald-600 dark:text-emerald-400">
                                                    check_circle
                                                </span>
                                                <span>Done</span>
                                            </div>
                                        ) : isOngoing ? (
                                            /* Ongoing Button: No animation, fades to Stop button on hover */
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onStopTask(task);
                                                }}
                                                title="Click to Stop ritual"
                                                className="relative group/btn overflow-hidden px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#002019] text-[#adf1dc] dark:bg-[#adf1dc] dark:text-[#002019] ring-1.5 ring-[#adf1dc]/70 shadow-xs cursor-pointer min-w-[70px] h-6 flex items-center justify-center transition-all"
                                            >
                                                {/* Default Ongoing State: Static icon */}
                                                <span className="flex items-center gap-1 transition-opacity duration-200 group-hover/btn:opacity-0">
                                                    <img src="/Timer.png" alt="Ongoing" className="w-3 h-3 object-contain inline-block" />
                                                    <span>Ongoing</span>
                                                </span>

                                                {/* Hover Stop State: Fades smoothly in */}
                                                <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1 bg-[#ffdade] text-[#874e58] font-bold text-[10px] rounded-full">
                                                    <span className="material-symbols-outlined text-[12px]">
                                                        stop
                                                    </span>
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
                                                title={`Start Focus on "${task.title}" (${task.sprouts || 1} session${(task.sprouts || 1) > 1 ? "s" : ""})`}
                                                className="px-3 py-0.5 rounded-full bg-[#adf1dc] text-[#002019] text-[10px] font-bold hover:bg-[#8ee9cc] hover:scale-105 active:scale-95 transition shadow-xs cursor-pointer h-6 flex items-center justify-center"
                                            >
                                                <span>Start</span>
                                            </button>
                                        )}

                                        {/* Pencil Edit Button (Beside "X" button) */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditTask(task);
                                            }}
                                            className="opacity-70 hover:opacity-100 hover:text-[#256959] dark:hover:text-[#adf1dc] p-0.5 transition cursor-pointer"
                                            title="Edit task"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">
                                                edit
                                            </span>
                                        </button>

                                        {/* "X" Delete Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteTask(task.id);
                                            }}
                                            className="opacity-70 hover:opacity-100 hover:text-red-400 p-0.5 transition cursor-pointer"
                                            title="Delete task"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">
                                                close
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Subtasks: Hidden by default, expands only when user clicks the task area */}
                                {hasSubtasks && isExpanded && (
                                    <div className="mt-1.5 pt-1 border-t border-black/5 dark:border-white/5 pl-2 ml-1.5 border-l-2 border-[#adf1dc]/50 space-y-0.5 transition-all">
                                        <div className="flex items-center justify-between text-[8.5px] font-semibold opacity-50 mb-0.5">
                                            <span className="flex items-center gap-1">
                                                <img src="/notes.png" alt="Notes" className="w-2.5 h-2.5 object-contain inline-block" />
                                                <span>Stepping Stones</span>
                                            </span>
                                            <span>
                                                {task.subtasks.filter((s) => s.completed).length} of{" "}
                                                {task.subtasks.length} done
                                            </span>
                                        </div>
                                        {task.subtasks.map((subtask) => (
                                            <div
                                                key={subtask.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleSubtask(task.id, subtask.id);
                                                }}
                                                className={`flex items-center gap-1.5 py-0.5 px-1 rounded-md cursor-pointer transition ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                                                    }`}
                                            >
                                                <span
                                                    className={`w-3 h-3 rounded-full flex items-center justify-center transition flex-shrink-0 ${subtask.completed
                                                        ? "bg-[#adf1dc] text-[#002019]"
                                                        : isDark
                                                            ? "border border-white/20 text-transparent"
                                                            : "border border-black/20 text-transparent"
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-[7px] font-bold">
                                                        check
                                                    </span>
                                                </span>
                                                <span
                                                    className={`text-[10px] leading-tight break-words ${subtask.completed
                                                        ? "line-through opacity-50"
                                                        : "opacity-85"
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
        </section>
    );
}