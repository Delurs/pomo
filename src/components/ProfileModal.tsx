import { useState, useEffect } from "react";
import { type Task } from "../types/pomo";
import LogoutConfirmModal from "./profile/LogoutConfirmModal";
import PasswordChangeDrawer from "./profile/PasswordChangeDrawer";
import CategoryPieChart from "./profile/CategoryPieChart";
import InteractiveCalendar from "./profile/InteractiveCalendar";
import ProfileTaskList from "./profile/ProfileTaskList";

export interface ProfileModalProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  completedSessions?: number;
  onLogout?: () => void;
  isGuest?: boolean;
}

type TimeFilter = "day" | "week" | "month";

export default function ProfileModal({
  isDark,
  isOpen,
  onClose,
  tasks,
  onLogout,
  isGuest: isGuestProp,
}: ProfileModalProps) {
  const isGuest =
    isGuestProp ??
    (typeof window !== "undefined" &&
      (localStorage.getItem("pomo_user_id") === "guest" ||
        localStorage.getItem("pomo_user_name") === "Mindful Guest"));

  // 1. Profile State
  const [userName, setUserName] = useState<string>(() => {
    if (isGuest) return "Mindful Guest";
    return localStorage.getItem("pomo_user_name") || "Mindful Sprout";
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // 2. Modals & Drawers
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 3. Overview Filter State
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) {
      setUserName("Mindful Guest");
      setIsEditingName(false);
    } else {
      const stored = localStorage.getItem("pomo_user_name") || "Mindful Sprout";
      setUserName(stored);
      setTempName(stored);
    }
  }, [isGuest]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveName = () => {
    const trimmed = tempName.trim() || "Mindful Sprout";
    setUserName(trimmed);
    localStorage.setItem("pomo_user_name", trimmed);
    setIsEditingName(false);
  };

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      onClose();
    }
  };

  // Filter tasks based on day, week, or month
  const todayStr = currentTime.toLocaleDateString("en-CA");

  const filteredTasks = tasks.filter((task) => {
    const taskDateStr = task.createdAt || todayStr;
    const [y, m, d] = taskDateStr.split("-").map(Number);
    const taskDate = new Date(y, m - 1, d);
    const now = currentTime;

    if (timeFilter === "day") {
      return (
        taskDate.getFullYear() === now.getFullYear() &&
        taskDate.getMonth() === now.getMonth() &&
        taskDate.getDate() === now.getDate()
      );
    }

    if (timeFilter === "week") {
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    }

    return (
      taskDate.getFullYear() === now.getFullYear() &&
      taskDate.getMonth() === now.getMonth()
    );
  });

  const displayedTasks = selectedDateStr
    ? tasks.filter(
        (t) => (t.createdAt || todayStr) === selectedDateStr || t.reminderDate === selectedDateStr
      )
    : filteredTasks;

  const totalTasksFinished = tasks.filter((t) => t.completed).length;
  const filteredCompleted = filteredTasks.filter((t) => t.completed).length;
  const completedFilteredTasks = filteredTasks.filter((t) => t.completed);

  // Tasks mapped by date string "YYYY-MM-DD" for calendar dots
  const tasksByDate = tasks.reduce((acc, t) => {
    if (t.createdAt) acc[t.createdAt] = (acc[t.createdAt] || 0) + 1;
    if (t.reminderDate && t.reminderDate !== t.createdAt) {
      acc[t.reminderDate] = (acc[t.reminderDate] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${
          isGuest ? "max-w-xl" : "max-w-3xl"
        } max-h-[92vh] overflow-y-auto rounded-3xl p-6 md:p-8 border shadow-2xl relative transition-all ${
          isDark
            ? "bg-[#1f2725] border-white/10 text-[#e8f3ec]"
            : "bg-white border-black/5 text-[#141e19]"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-black/5 dark:border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#adf1dc] text-[#002019] flex items-center justify-center font-bold shadow-sm p-1.5">
              <img src="/profile.png" alt="Profile" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight">Profile & Sanctuary</h3>
              <p className="text-xs opacity-60">
                {isGuest
                  ? "Mindful Guest workspace session"
                  : "Manage your account and productivity overview"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Profile"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
              isDark
                ? "bg-[#161b1a] text-slate-300 hover:text-white hover:bg-[#283330] border border-white/10"
                : "bg-[#ebf6ef] text-[#002019] hover:bg-[#dfeee5]"
            }`}
          >
            <img src="/close.png" alt="Close" className="w-4 h-4 object-contain" />
          </button>
        </div>

        {/* Profile Card & Account Controls */}
        <div
          className={`rounded-2xl p-6 border mb-6 transition-all ${
            isDark ? "bg-[#161b1a] border-white/5" : "bg-[#f1fcf4] border-black/5"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            {/* User Info */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl bg-[#adf1dc] text-[#002019] flex items-center justify-center font-bold shadow-sm p-2.5 flex-shrink-0">
                <img src="/profile.png" alt="Profile" className="w-full h-full object-contain" />
              </div>

              <div className="flex flex-col items-center sm:items-start justify-center">
                {!isGuest && isEditingName ? (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      autoFocus
                      className={`px-3 py-1 text-sm font-bold rounded-lg border focus:outline-none text-center sm:text-left w-40 ${
                        isDark
                          ? "bg-[#1f2725] border-white/20 text-white"
                          : "bg-white border-black/20 text-black"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#adf1dc] text-[#002019] cursor-pointer hover:opacity-90 flex-shrink-0"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-lg font-bold">{isGuest ? "Mindful Guest" : userName}</h4>
                    {!isGuest && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempName(userName);
                          setIsEditingName(true);
                        }}
                        className="opacity-50 hover:opacity-100 transition cursor-pointer p-0.5"
                        title="Edit name"
                      >
                        <img src="/edit.png" alt="Edit" className="w-3.5 h-3.5 object-contain" />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-xs opacity-50 mt-0.5">
                  {isGuest ? "Mindful Guest Mode" : "Mindful Practitioner"}
                </p>
              </div>
            </div>

            {/* Actions: Change Password & Log out */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 mt-2 sm:mt-0">
              {!isGuest && !isChangingPassword && (
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-1.5 rounded-full bg-[#adf1dc] text-[#002019] text-xs font-bold hover:scale-105 active:scale-95 transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <img src="/lock_reset.png" alt="Lock Reset" className="w-4 h-4 object-contain inline-block" />
                  <span>Change Password</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
                  isDark
                    ? "bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20"
                    : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200"
                }`}
                title={isGuest ? "Exit Mindful Guest mode" : "Log out"}
              >
                <img
                  src="/logout.png"
                  alt={isGuest ? "Exit Mindful Guest mode" : "Log out"}
                  className="w-4 h-4 object-contain inline-block"
                />
                <span>{isGuest ? "Exit Mindful Guest mode" : "Log out"}</span>
              </button>
            </div>
          </div>

          {/* Inline Change Password Form */}
          <PasswordChangeDrawer
            isDark={isDark}
            isOpen={!isGuest && isChangingPassword}
            onClose={() => setIsChangingPassword(false)}
          />
        </div>

        {/* Task Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className={`p-3.5 rounded-2xl border text-center ${
              isDark ? "bg-[#161b1a] border-white/5" : "bg-[#f1fcf4] border-black/5"
            }`}
          >
            <div className="text-xs opacity-60 font-medium mb-1">Total Tasks Finished</div>
            <div className="text-2xl font-black text-[#256959] dark:text-[#adf1dc]">
              {totalTasksFinished}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border text-center ${
              isDark ? "bg-[#161b1a] border-white/5" : "bg-[#f1fcf4] border-black/5"
            }`}
          >
            <div className="text-xs opacity-60 font-medium mb-1">Total Tasks</div>
            <div className="text-2xl font-black text-[#256959] dark:text-[#adf1dc]">
              {tasks.length}
            </div>
          </div>
        </div>

        {/* Overview Section (Hidden in Guest Mode) */}
        {!isGuest && (
          <div
            className={`rounded-2xl p-5 border ${
              isDark ? "bg-[#161b1a] border-white/5" : "bg-[#ebf6ef]/60 border-black/5"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3 mb-5">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <img src="/dashboard.png" alt="Dashboard" className="w-5 h-5 object-contain inline-block" />
                <span className="text-sm font-bold">Overview</span>
                <span className="px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px] font-semibold opacity-80 whitespace-nowrap">
                  {filteredCompleted} of {filteredTasks.length} completed
                </span>
              </div>

              <div
                className={`inline-flex p-1 rounded-full border ${
                  isDark ? "bg-[#1f2725] border-white/5" : "bg-white border-black/5"
                }`}
              >
                {(["day", "week", "month"] as TimeFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setTimeFilter(f);
                      setSelectedDateStr(null);
                    }}
                    className={`px-4 py-1 rounded-full text-xs font-semibold capitalize transition cursor-pointer ${
                      timeFilter === f
                        ? "bg-[#adf1dc] text-[#002019] shadow-sm font-bold"
                        : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-600 hover:text-black"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <CategoryPieChart
                isDark={isDark}
                timeFilter={timeFilter}
                completedFilteredTasks={completedFilteredTasks}
              />

              <InteractiveCalendar
                isDark={isDark}
                currentTime={currentTime}
                viewDate={viewDate}
                setViewDate={setViewDate}
                selectedDateStr={selectedDateStr}
                onSelectDate={setSelectedDateStr}
                tasksByDate={tasksByDate}
              />
            </div>

            <ProfileTaskList
              isDark={isDark}
              displayedTasks={displayedTasks}
              selectedDateStr={selectedDateStr}
              timeFilter={timeFilter}
              onClearDateFilter={() => setSelectedDateStr(null)}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        isDark={isDark}
        isGuest={isGuest}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogoutAction();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}