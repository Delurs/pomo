# 🐢 Pomodoro Tortoise — Mindful Productivity Sanctuary

> A calm, single-screen Pomodoro focus timer, task manager, and ambient study beats sanctuary built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row-Level Security)**.

[![Live Demo](https://img.shields.io/badge/Live_Demo-pomodoro--tortoise.vercel.app-256959?style=for-the-badge&logo=vercel)](https://pomodoro-tortoise.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-React_19_|_TypeScript_|_Tailwind_|_Supabase-002019?style=for-the-badge)](https://github.com/Delurs/pomo)
[![License: MIT](https://img.shields.io/badge/License-MIT-adf1dc?style=for-the-badge)](LICENSE)

---

## 🌿 Executive Summary

**Pomodoro Tortoise** is an intentional, distraction-free productivity web application designed to encourage steady focus and reduce digital fatigue. Built with a modular React architecture and custom pastel aesthetic themes, it blends ritual-based time management with persistent cloud task tracking and ambient media playback.

Live Production URL: [https://pomodoro-tortoise.vercel.app](https://pomodoro-tortoise.vercel.app)

---

## ✨ Key Features & User Experience

### ⏱️ Adaptive Ritual Timer
- **Preset Focus Rhythms:** 25m Focus Ritual, 5m Short Break, and 15m Long Break recharge periods.
- **Granular Custom Timer:** Interactive modal supporting manual hours, minutes, and seconds configuration.
- **Live SVG Countdown Dial:** Real-time animated circular progress ring with adaptive timing adjustments (`+15s` / `-15s`).
- **Dynamic Tab Sync:** Browser tab dynamically updates with active session status: `(24:59) Pomodoro Tortoise`.
- **Dual Alarm Engine:** Looping audio alert with an automated Web Audio API fallback synthesizer chime.

### 📋 Stepping Stone Tasks
- **Subtask Deconstruction:** Dynamic stepping stones with interactive progress tracking.
- **Intentional Pacing:** Categorize work by `Priority`, `Gentle Flow`, or `Someday`.
- **Scheduled Reminders:** Integrated date and time picker for "Someday" tasks to prevent deadline crowding.
- **Completed Drawer:** Collapsible archive drawer with single-click task restoration and cleanup.

### 🎨 7-Tone Palette & Fluid Micro-Interactions
- **Custom Color Engines:** Seven switchable theme palettes (*Green, Red, Orange, Yellow, Blue, Indigo, Violet*) driven by dynamic CSS Custom Properties.
- **Spring Physics:** Smooth micro-interactions powered by `motion/react` and Animate UI physics (`stiffness: 400`, `damping: 32`).
- **Accessible Sanctuary Theming:** High-contrast Dark and Light modes engineered for day study and low-light focus sessions.

### 🎧 Study Beats Media Companion
- **Curated Ambience:** Built-in Lo-Fi rain, cozy cafe, soft piano, and forest breeze audio presets.
- **Dynamic Media Embedder:** Custom URL parser supporting continuous streaming embeds from both YouTube and Spotify.
- **Smart Focus Mute:** Ambient audio automatically pauses when focus intervals expire so completion alarms ring clearly.

### 📊 Focus Analytics & Profile Dashboard
- **Category Rituals Donut:** Interactive SVG distribution chart tracking completed tasks by category (*Reading, Writing, Coding, Creative, Well-being, Chores*).
- **Interactive Calendar:** Monthly heat tracker displaying daily task density and historical drilldowns across Day, Week, and Month filters.

### 🔐 Secure Cloud Persistence & Identity
- **PostgreSQL Database:** Multi-device synchronization powered by Supabase with Row-Level Security (RLS) guaranteeing total user isolation.
- **Authentication Lifecycle:** Sign up, sign in, update password drawer, and password recovery workflows.
- **Mindful Guest Mode:** Zero-friction local-storage exploration session without immediate account registration.

---

## 🛠️ Architecture & Tech Stack

```text
pomodoro-tortoise/
├── src/
│   ├── components/
│   │   ├── auth/            # Authentication modals & domain validation
│   │   ├── profile/         # SVG Analytics donut, interactive calendar & task history
│   │   ├── timer/           # SVG countdown dial, modal pickers & Web Audio synthesizers
│   │   ├── Header.tsx       # Theme engine, palette popover & navigation
│   │   ├── TimerCard.tsx    # Pomodoro core state controller
│   │   ├── TaskListCard.tsx # Task CRUD, filters & subtask accordion
│   │   └── MusicPlayerCard.tsx # Media stream parser (YouTube / Spotify)
│   ├── lib/
│   │   └── supabaseClient.ts # Initialized Supabase client with RLS
│   ├── types/
│   │   ├── pomo.ts          # Strict TypeScript interfaces
│   │   └── themeColors.ts   # 7-color token dictionary
│   ├── App.tsx              # Master application state & layout shell
│   └── index.css            # Tailwind CSS v4 styling rules
```

| Layer | Technologies / Tools |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite |
| **Language** | TypeScript (Strict type safety, custom interfaces) |
| **Styling & Design System** | Tailwind CSS v4, CSS Custom Properties |
| **Animation & Micro-interactions** | Motion (`motion/react`), Animate UI spring physics |
| **Backend & Cloud Database** | Supabase (PostgreSQL, Row-Level Security, Auth) |
| **Deployment & Hosting** | Vercel (Continuous Deployment CI/CD) |

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- A **Supabase** project instance

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Delurs/pomo.git
   cd pomo
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**  
   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Production Verification Build:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 👤 Author & Design Engineering

**Justine Ryan Deluria**  
*BS Computer Science Student — Mapúa Malayan Colleges Laguna*  
- **GitHub:** [@Delurs](https://github.com/Delurs)  
- **LinkedIn:** [Justine Deluria](https://www.linkedin.com/in/justine-deluria)  

*Crafted with quiet focus for productive minds.*
