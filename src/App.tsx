import { useState, useEffect } from "react";
import type { Task } from "./types/pomo";
import Header from "./components/Header";
import TimerCard from "./components/TimerCard";
import TaskListCard from "./components/TaskListCard";
import MusicPlayerCard from "./components/MusicPlayerCard";
import NewTaskModal from "./components/NewTaskModal";
import ProfileModal from "./components/ProfileModal";

export default function App() {
  // 1. Clean Blank States (No pre-populated dummy data!)
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [taskCompletedSessions, setTaskCompletedSessions] = useState<number>(0);
  const [targetSessions, setTargetSessions] = useState<number>(1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [startTimerSignal, setStartTimerSignal] = useState<number>(0);
  const [stopTimerSignal, setStopTimerSignal] = useState<number>(0);
  const [stopMusicSignal, setStopMusicSignal] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalInitialTitle, setModalInitialTitle] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // 2. Task Handlers
  const handleOpenTaskModal = (initialTitle: string = "") => {
    setEditingTask(null);
    setModalInitialTitle(initialTitle);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleQuickAddTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      category: "reading",
      sprouts: 1,
      priority: "flow",
      subtasks: [],
      completed: false,
      createdAt: new Date().toLocaleDateString("en-CA"),
    };
    setTasks([...tasks, newTask]);
  };

  const handleCreateDetailedTask = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (activeTaskId === updatedTask.id) {
      setTargetSessions(updatedTask.sprouts || 1);
    }
    setEditingTask(null);
  };

  const handleStartTask = (task: Task) => {
    setActiveTaskId(task.id);
    // Apply assigned sessions from this task to the timer & reset task session progress
    setTargetSessions(task.sprouts || 1);
    setTaskCompletedSessions(0);
    // Signal TimerCard to reset to Focus and start countdown immediately
    setStartTimerSignal((prev) => prev + 1);
  };

  const handleStopTask = (_task: Task) => {
    setActiveTaskId(null);
    setTaskCompletedSessions(0);
    setTargetSessions(1);
    setStopTimerSignal((prev) => prev + 1);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;
        const newCompleted = !t.completed;
        if (newCompleted && activeTaskId === taskId) {
          setActiveTaskId(null);
          setTaskCompletedSessions(0);
          setTargetSessions(1);
          setStopTimerSignal((prev) => prev + 1);
        }
        return { ...t, completed: newCompleted };
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSubtasks = task.subtasks.map((sub) =>
          sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        );
        return {
          ...task,
          subtasks: updatedSubtasks,
        };
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
      setTaskCompletedSessions(0);
      setTargetSessions(1);
      setStopTimerSignal((prev) => prev + 1);
    }
  };

  const handleSessionComplete = () => {
    setTotalSessions((prev) => prev + 1);
    setTaskCompletedSessions((prev) => {
      const next = prev + 1;
      if (next >= targetSessions && activeTaskId) {
        // Mark task as completed when all required sessions are finished
        setTasks((currentTasks) =>
          currentTasks.map((t) =>
            t.id === activeTaskId ? { ...t, completed: true } : t
          )
        );
        setActiveTaskId(null);
      }
      return next;
    });
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${isDark ? "bg-[#141e19] text-[#e8f3ec]" : "bg-[#f1fcf4] text-[#141e19]"
        }`}
    >
      {/* Top Navbar */}
      <Header
        isDark={isDark}
        setIsDark={setIsDark}
        completedSessions={totalSessions}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Bento Grid with matching height between Timer and (Tasks + Study Beats), fits comfortably on-screen */}
      <main className="w-full flex-1 max-w-[1280px] mx-auto px-4 sm:px-6 pt-18 pb-1.5 flex flex-col justify-center min-h-0">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch h-auto lg:h-[calc(100vh-120px)] lg:max-h-[540px] min-h-0">
          {/* Left Column: Pomodoro Timer (Strictly 55% width) */}
          <div className="w-full lg:w-[calc(55%-8px)] h-full flex flex-col min-h-0">
            <TimerCard
              isDark={isDark}
              completedSessions={taskCompletedSessions}
              targetSessions={targetSessions}
              activeTaskTitle={activeTask ? `🎯 ${activeTask.title}` : undefined}
              startTimerSignal={startTimerSignal}
              stopTimerSignal={stopTimerSignal}
              onSessionComplete={handleSessionComplete}
              onTimerFinish={() => setStopMusicSignal((prev) => prev + 1)}
              onSelectSessions={(sessions) => {
                setTargetSessions(sessions);
                setTaskCompletedSessions(0);
              }}
            />
          </div>

          {/* Right Column: Tasks + Study Beats (Strictly 45% width) */}
          <div className="w-full lg:w-[calc(45%-8px)] h-full flex flex-col gap-3 min-h-0">
            <TaskListCard
              isDark={isDark}
              tasks={tasks}
              activeTaskId={activeTaskId}
              onQuickAddTask={handleQuickAddTask}
              onToggleTask={handleToggleTask}
              onToggleSubtask={handleToggleSubtask}
              onEditTask={handleEditTask}
              onStartTask={handleStartTask}
              onStopTask={handleStopTask}
              onDeleteTask={handleDeleteTask}
              onOpenDetailedModal={handleOpenTaskModal}
            />

            <MusicPlayerCard isDark={isDark} stopMusicSignal={stopMusicSignal} />
          </div>
        </div>
      </main>

      {/* Detailed Task Creation / Edit Modal */}
      {isModalOpen && (
        <NewTaskModal
          isDark={isDark}
          isOpen={isModalOpen}
          initialTitle={modalInitialTitle}
          editingTask={editingTask}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onCreateTask={handleCreateDetailedTask}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {/* Profile & Focus Analytics Modal */}
      {isProfileOpen && (
        <ProfileModal
          isDark={isDark}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          tasks={tasks}
          completedSessions={totalSessions}
        />
      )}

      {/* Minimal Relaxed Footer */}
      <footer className="w-full py-2.5 text-center text-xs opacity-50 flex-shrink-0 flex items-center justify-center gap-2">
        <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
        <img
          src="/logo-name.png"
          alt="Pomodoro Tortoise"
          className={`h-4 object-contain opacity-80 ${isDark ? "brightness-[2] contrast-125" : ""}`}
        />
        <span> Crafted for quiet minds</span>
      </footer>
    </div>
  );
}