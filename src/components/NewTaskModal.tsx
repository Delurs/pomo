import { useState, useEffect } from "react";
import { type Task, type Subtask, CATEGORY_LIST } from "../types/pomo";

interface NewTaskModalProps {
    isDark: boolean;
    isOpen: boolean;
    initialTitle?: string;
    editingTask?: Task | null;
    onClose: () => void;
    onCreateTask: (task: Task) => void;
    onUpdateTask?: (task: Task) => void;
}

export default function NewTaskModal({
    isDark,
    isOpen,
    initialTitle = "",
    editingTask = null,
    onClose,
    onCreateTask,
    onUpdateTask,
}: NewTaskModalProps) {
    const [taskTitle, setTaskTitle] = useState<string>(initialTitle);
    const [taskCategory, setTaskCategory] = useState<Task["category"]>("reading");
    const [taskSprouts, setTaskSprouts] = useState<number>(1);
    const [taskPriority, setTaskPriority] = useState<Task["priority"]>("flow");
    const [reminderDate, setReminderDate] = useState<string>("");
    const [reminderTime, setReminderTime] = useState<string>("");
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);

    useEffect(() => {
        if (editingTask) {
            setTaskTitle(editingTask.title);
            setTaskCategory(editingTask.category);
            setTaskSprouts(editingTask.sprouts || 1);
            setTaskPriority(editingTask.priority || "flow");
            setReminderDate(editingTask.reminderDate || "");
            setReminderTime(editingTask.reminderTime || "");
            setSubtasks(editingTask.subtasks ? [...editingTask.subtasks] : []);
        } else {
            setTaskTitle(initialTitle);
            setTaskCategory("reading");
            setTaskSprouts(1);
            setTaskPriority("flow");
            setReminderDate("");
            setReminderTime("");
            setSubtasks([]);
        }
    }, [editingTask, initialTitle, isOpen]);

    if (!isOpen) return null;

    const handleAddSubtaskField = () => {
        setSubtasks([
            ...subtasks,
            { id: Date.now().toString(), text: "", completed: false },
        ]);
    };

    const handleUpdateSubtask = (id: string, text: string) => {
        setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, text } : s)));
    };

    const handleRemoveSubtask = (id: string) => {
        setSubtasks(subtasks.filter((s) => s.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        const todayLocal = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"

        if (editingTask && onUpdateTask) {
            const updatedTask: Task = {
                ...editingTask,
                title: taskTitle.trim(),
                category: taskCategory,
                sprouts: taskSprouts,
                priority: taskPriority,
                reminderDate: taskPriority === "later" ? reminderDate : undefined,
                reminderTime: taskPriority === "later" ? reminderTime : undefined,
                subtasks: subtasks.filter((s) => s.text.trim() !== ""),
            };
            onUpdateTask(updatedTask);
        } else {
            const newTask: Task = {
                id: Date.now().toString(),
                title: taskTitle.trim(),
                category: taskCategory,
                sprouts: taskSprouts,
                priority: taskPriority,
                reminderDate: taskPriority === "later" ? reminderDate : undefined,
                reminderTime: taskPriority === "later" ? reminderTime : undefined,
                subtasks: subtasks.filter((s) => s.text.trim() !== ""),
                completed: false,
                createdAt: todayLocal,
            };
            onCreateTask(newTask);
        }

        // Reset and close
        setTaskTitle("");
        setTaskCategory("reading");
        setTaskSprouts(1);
        setTaskPriority("flow");
        setReminderDate("");
        setReminderTime("");
        setSubtasks([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div
                className={`w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl p-6 border shadow-2xl relative ${isDark ? "bg-[#1f2725] border-white/10" : "bg-white border-black/5"
                    }`}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#adf1dc] text-[#002019] flex items-center justify-center font-bold">
                            <img src={editingTask ? "/edit_note.png" : "/notes.png"} alt="Task" className="w-5 h-5 object-contain" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base">
                                {editingTask ? "Edit Task" : "New Task"}
                            </h3>
                            <p className="text-xs opacity-60">
                                {editingTask
                                    ? "Refine your intention and stepping stones."
                                    : "Sow a mindful intention for your desk session."}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${isDark
                            ? "bg-[#161b1a] text-slate-300 hover:text-white hover:bg-[#283330] border border-white/10"
                            : "bg-[#ebf6ef] text-[#002019] hover:bg-[#dfeee5]"
                            }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>

                {/* Clean Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Task Title */}
                    <div>
                        <label className="block text-xs font-bold mb-1">Task Focus *</label>
                        <input
                            type="text"
                            autoFocus
                            required
                            placeholder="What accomplishment is calling you?"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            className={`w-full h-10 px-3.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${isDark
                                ? "bg-[#161b1a] border-white/5 placeholder-white/30"
                                : "bg-[#ebf6ef] border-black/5 placeholder-black/40"
                                }`}
                        />
                    </div>

                    {/* Subtasks */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-bold">
                                Subtasks
                            </label>
                            <button
                                type="button"
                                onClick={handleAddSubtaskField}
                                className="text-[11px] font-semibold text-[#256959] dark:text-[#adf1dc] flex items-center gap-1 cursor-pointer"
                            >
                                <img src="/add.png" alt="Add" className="w-3.5 h-3.5 object-contain" />
                                <span>Add step</span>
                            </button>
                        </div>

                        {subtasks.length === 0 ? (
                            <p className="text-[11px] opacity-40 italic">
                                No subtasks added. Click "Add step" to break this task down.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {subtasks.map((sub, index) => (
                                    <div key={sub.id} className="flex items-center gap-2">
                                        <span className="text-[10px] opacity-40">{index + 1}.</span>
                                        <input
                                            type="text"
                                            placeholder={`Step ${index + 1}...`}
                                            value={sub.text}
                                            onChange={(e) =>
                                                handleUpdateSubtask(sub.id, e.target.value)
                                            }
                                            className={`flex-1 h-8 px-2.5 rounded-lg text-xs border focus:outline-none ${isDark
                                                ? "bg-[#161b1a] border-white/5"
                                                : "bg-[#ebf6ef] border-black/5"
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSubtask(sub.id)}
                                            className="opacity-40 hover:opacity-100 hover:text-red-400 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">
                                                close
                                            </span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pomo Sessions */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-bold">Pomo Sessions</label>
                            <span className="text-[11px] font-semibold text-[#256959] dark:text-[#adf1dc]">
                                {taskSprouts * 25} mins focus
                            </span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setTaskSprouts(num)}
                                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${taskSprouts === num
                                        ? "bg-[#adf1dc] text-[#002019] border-[#adf1dc] shadow-sm"
                                        : isDark
                                            ? "bg-[#161b1a] border-white/5 hover:bg-[#283330]"
                                            : "bg-[#ebf6ef] border-black/5 hover:bg-[#e0ebe3]"
                                        }`}
                                >
                                    <span className="font-extrabold">{num}</span>
                                    <span className="text-[10px] font-medium opacity-75">{num * 25}m</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Selector */}
                    <div>
                        <label className="block text-xs font-bold mb-1.5">Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {CATEGORY_LIST.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setTaskCategory(cat.id)}
                                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${taskCategory === cat.id
                                        ? "bg-[#adf1dc] text-[#002019] border-[#adf1dc] shadow-sm font-bold"
                                        : isDark
                                            ? "bg-[#161b1a] border-white/5 hover:bg-[#283330] text-zinc-300"
                                            : "bg-[#ebf6ef] border-black/5 hover:bg-[#e0ebe3] text-zinc-700"
                                        }`}
                                >
                                    <img src={cat.icon} alt={cat.name} className="w-4 h-4 object-contain flex-shrink-0" />
                                    <span className="truncate">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority Selector (Pace) */}
                    <div>
                        <label className="block text-xs font-bold mb-1">Pace</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(["flow", "focus", "later"] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setTaskPriority(p)}
                                    className={`py-1.5 rounded-full text-xs transition cursor-pointer ${taskPriority === p
                                        ? "bg-[#adf1dc] text-[#002019] font-bold shadow-sm"
                                        : isDark
                                            ? "bg-[#161b1a]"
                                            : "bg-[#ebf6ef]"
                                        }`}
                                >
                                    {p === "focus"
                                        ? "Priority"
                                        : p === "flow"
                                            ? "Gentle Flow"
                                            : "Someday"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Someday Reminder Picker (Date & Time) to avoid deadline cramping */}
                    {taskPriority === "later" && (
                        <div
                            className={`p-3.5 rounded-2xl border space-y-2.5 transition ${isDark
                                ? "bg-[#161b1a] border-white/10 text-slate-200"
                                : "bg-[#ebf6ef] border-[#adf1dc]/40 text-[#141e19]"
                                }`}
                        >
                            <div
                                className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-[#adf1dc]" : "text-[#256959]"
                                    }`}
                            >
                                <img src="/calendar_clock.png" alt="Calendar Clock" className="w-4 h-4 object-contain" />
                                <span>Reminder & Recommended Schedule</span>
                            </div>
                            <p
                                className={`text-[11px] leading-snug ${isDark ? "text-slate-300 opacity-90" : "text-slate-600 opacity-90"
                                    }`}
                            >
                                Schedule a calm calendar date & time recommended for this task so it never feels rushed or cramped.
                            </p>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label
                                        className={`block text-[10px] font-bold mb-1 ${isDark ? "text-slate-200" : "text-slate-700"
                                            }`}
                                    >
                                        Recommended Date
                                    </label>
                                    <input
                                        type="date"
                                        value={reminderDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setReminderDate(e.target.value)}
                                        className={`w-full h-8 px-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${isDark
                                            ? "bg-[#1f2725] border-white/15 text-[#e8f3ec] [color-scheme:dark]"
                                            : "bg-white border-black/10 text-[#141e19]"
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label
                                        className={`block text-[10px] font-bold mb-1 ${isDark ? "text-slate-200" : "text-slate-700"
                                            }`}
                                    >
                                        Recommended Time
                                    </label>
                                    <input
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className={`w-full h-8 px-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#adf1dc] ${isDark
                                            ? "bg-[#1f2725] border-white/15 text-[#e8f3ec] [color-scheme:dark]"
                                            : "bg-white border-black/10 text-[#141e19]"
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-full text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-full bg-[#adf1dc] text-[#002019] font-bold text-xs hover:scale-105 transition shadow-sm cursor-pointer"
                        >
                            {editingTask ? "Save Changes" : "Add to My Day"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
