import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";
import type { Task } from "./types/pomo";
import Header from "./components/Header";
import TimerCard from "./components/TimerCard";
import TaskListCard from "./components/TaskListCard";
import MusicPlayerCard from "./components/MusicPlayerCard";
import NewTaskModal from "./components/NewTaskModal";
import ProfileModal from "./components/ProfileModal";
import LoginPage from "./components/LoginPage";
import ResetPasswordPage from "./components/ResetPasswordPage";

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // AUTH STATE
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [_userName, setUserName] = useState<string>("Mindful Sprout");
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() => {
    return (
      window.location.hash.includes("type=recovery") ||
      window.location.hash.includes("reset-password")
    );
  });

  // APP STATES
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

  // 1. SUPABASE SESSION LISTENER
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        const name = session.user.user_metadata?.username || "Mindful Sprout";
        setUserName(name);
        localStorage.setItem("pomo_user_name", name);
        localStorage.setItem("pomo_user_id", session.user.id);
      } else {
        const savedId = localStorage.getItem("pomo_user_id");
        if (savedId === "guest") {
          setIsAuthenticated(true);
          setUserId("guest");
          const name = localStorage.getItem("pomo_user_name") || "Mindful Guest";
          setUserName(name);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }
      if (session) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        const name = session.user.user_metadata?.username || "Mindful Sprout";
        setUserName(name);
        localStorage.setItem("pomo_user_name", name);
        localStorage.setItem("pomo_user_id", session.user.id);
      } else {
        const savedId = localStorage.getItem("pomo_user_id");
        if (savedId !== "guest") {
          setIsAuthenticated(false);
          setUserId(null);
          setTasks([]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. FETCH TASKS ON LOGIN / USER CHANGE
  const fetchTasks = useCallback(async (uid: string) => {
    if (uid === "guest") {
      const saved = localStorage.getItem("pomo_guest_tasks");
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch {
          setTasks([]);
        }
      }
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks from Supabase:", error.message);
      return;
    }

    if (data) {
      const formattedTasks: Task[] = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        sprouts: row.sprouts,
        priority: row.priority,
        subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
        completed: Boolean(row.completed),
        createdAt: row.created_at,
        deadline: row.deadline || undefined,
        reminderDate: row.reminder_date || undefined,
        reminderTime: row.reminder_time || undefined,
        notified: Boolean(row.notified),
      }));
      setTasks(formattedTasks);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTasks(userId);
    }
  }, [userId, fetchTasks]);

  const handleLogin = (name: string, id: string) => {
    setUserName(name);
    setUserId(id);
    localStorage.setItem("pomo_user_name", name);
    localStorage.setItem("pomo_user_id", id);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    if (userId !== "guest") {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("pomo_is_logged_in");
    sessionStorage.removeItem("pomo_is_logged_in");
    localStorage.removeItem("pomo_user_id");
    localStorage.removeItem("pomo_user_name");
    setIsAuthenticated(false);
    setUserId(null);
    setTasks([]);
    setIsProfileOpen(false);
  };

  // 3. TASK HANDLERS WITH SUPABASE PERSISTENCE
  const handleOpenTaskModal = (initialTitle: string = "") => {
    setEditingTask(null);
    setModalInitialTitle(initialTitle);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCreateDetailedTask = async (newTask: Task) => {
    // 1. Optimistic Update (shows immediately)
    setTasks((prev) => [newTask, ...prev]);

    // 2. Persist to Supabase
    if (userId && userId !== "guest") {
      const { error } = await supabase.from("tasks").insert({
        id: newTask.id,
        user_id: userId,
        title: newTask.title,
        category: newTask.category,
        sprouts: newTask.sprouts,
        priority: newTask.priority,
        subtasks: newTask.subtasks,
        completed: newTask.completed,
        created_at: newTask.createdAt,
        reminder_date: newTask.reminderDate || null,
        reminder_time: newTask.reminderTime || null,
      });

      if (error) {
        console.error("SUPABASE TASK INSERT FAILED:", error.message);
      }
    } else {
      localStorage.setItem(
        "pomo_guest_tasks",
        JSON.stringify([newTask, ...tasks])
      );
    }
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
    handleCreateDetailedTask(newTask);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    if (activeTaskId === updatedTask.id) {
      setTargetSessions(updatedTask.sprouts || 1);
    }
    setEditingTask(null);

    if (userId && userId !== "guest") {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: updatedTask.title,
          category: updatedTask.category,
          sprouts: updatedTask.sprouts,
          priority: updatedTask.priority,
          subtasks: updatedTask.subtasks,
          completed: updatedTask.completed,
          reminder_date: updatedTask.reminderDate || null,
          reminder_time: updatedTask.reminderTime || null,
        })
        .eq("id", updatedTask.id)
        .eq("user_id", userId);

      if (error) console.error("SUPABASE TASK UPDATE FAILED:", error.message);
    } else {
      localStorage.setItem(
        "pomo_guest_tasks",
        JSON.stringify(
          tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        )
      );
    }
  };

  const handleStartTask = (task: Task) => {
    setActiveTaskId(task.id);
    setTargetSessions(task.sprouts || 1);
    setTaskCompletedSessions(0);
    setStartTimerSignal((prev) => prev + 1);
  };

  const handleStopTask = (_task: Task) => {
    setActiveTaskId(null);
    setTaskCompletedSessions(0);
    setTargetSessions(1);
    setStopTimerSignal((prev) => prev + 1);
  };

  const handleToggleTask = async (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const newCompleted = !target.completed;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, completed: newCompleted };
      })
    );

    if (newCompleted && activeTaskId === taskId) {
      setActiveTaskId(null);
      setTaskCompletedSessions(0);
      setTargetSessions(1);
      setStopTimerSignal((prev) => prev + 1);
    }

    if (userId && userId !== "guest") {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: newCompleted })
        .eq("id", taskId)
        .eq("user_id", userId);

      if (error) {
        console.error("SUPABASE TOGGLE COMPLETION FAILED:", error.message);
      }
    } else {
      localStorage.setItem(
        "pomo_guest_tasks",
        JSON.stringify(
          tasks.map((t) =>
            t.id === taskId ? { ...t, completed: newCompleted } : t
          )
        )
      );
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    let updatedSubtasks: any[] = [];

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        updatedSubtasks = task.subtasks.map((sub) =>
          sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        );
        return {
          ...task,
          subtasks: updatedSubtasks,
        };
      })
    );

    if (userId && userId !== "guest") {
      await supabase
        .from("tasks")
        .update({ subtasks: updatedSubtasks })
        .eq("id", taskId)
        .eq("user_id", userId);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
      setTaskCompletedSessions(0);
      setTargetSessions(1);
      setStopTimerSignal((prev) => prev + 1);
    }

    if (userId && userId !== "guest") {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", userId);

      if (error) console.error("SUPABASE TASK DELETE FAILED:", error.message);
    } else {
      localStorage.setItem(
        "pomo_guest_tasks",
        JSON.stringify(tasks.filter((t) => t.id !== taskId))
      );
    }
  };

  const handleSessionComplete = () => {
    setTotalSessions((prev) => prev + 1);
    setTaskCompletedSessions((prev) => {
      const next = prev + 1;
      if (next >= targetSessions && activeTaskId) {
        handleToggleTask(activeTaskId);
        setActiveTaskId(null);
      }
      return next;
    });
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  if (isPasswordRecovery) {
    return (
      <ResetPasswordPage
        isDark={isDark}
        setIsDark={setIsDark}
        onComplete={async () => {
          setIsPasswordRecovery(false);
          window.history.replaceState(null, "", window.location.pathname);
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsAuthenticated(true);
            setUserId(session.user.id);
            setUserName(session.user.user_metadata?.username || "Mindful Sprout");
          }
        }}
        onLater={async () => {
          await supabase.auth.signOut();
          setIsPasswordRecovery(false);
          setIsAuthenticated(false);
          setUserId(null);
          window.history.replaceState(null, "", window.location.pathname);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        isDark={isDark}
        setIsDark={setIsDark}
        onLogin={handleLogin}
      />
    );
  }

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

      {/* Main Bento Grid */}
      <main className="w-full flex-1 max-w-[1280px] mx-auto px-4 sm:px-6 pt-18 pb-1.5 flex flex-col justify-center min-h-0">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch h-auto lg:h-[calc(100vh-120px)] lg:max-h-[540px] min-h-0">
          {/* Left Column: Pomodoro Timer */}
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

          {/* Right Column: Tasks + Study Beats */}
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
          onLogout={handleLogout}
          isGuest={userId === "guest"}
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