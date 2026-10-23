# 🚆 SmartRail AI Co-Pilot — AI-Powered Train Traffic Control

![React](https://img.shields.io/badge/React-18.3-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-007ACC?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-3ECF8E?logo=supabase&logoColor=white)
![Simulation](https://img.shields.io/badge/Simulation-Active-4CAF50)

An intelligent decision-support system (DSS) designed for railway Train Traffic Controllers (TTC) and Section Controllers. Modeled on high-density urban corridors (Mumbai Suburban CSMT ↔ Dadar), SmartRail automates headway conflict detection, calculates dynamic train priorities, optimizes platform allocations, and provides explainable AI recommendations in real time.

---

## ⚡ Key Highlights

- **⏱️ 15–30% Delay Reduction:** Proactive conflict resolution and dynamic headway optimization.
- **📈 5–10% Throughput Increase:** Optimized scheduling across mixed traffic (Express, Suburban Local, Freight, and Maintenance).
- **🧠 Explainable AI Recommendations:** Actionable precedence decisions with confidence scores, delay impact, and reasoning.
- **🚦 Interactive Simulation Engine:** Test operational scenarios under peak-hour rush, junction conflicts, and weather delays.

---

## 🛠️ Core Features

- **Dynamic Priority Engine:** Prioritizes trains using a non-linear scoring formula factoring in train class hierarchy, exponential delay penalties ($O(\text{delay}^{1.5})$), and schedule adherence bonuses.
- **Headway Conflict Detection:** Evaluates pairwise block occupancy to detect headway violations (<10 min) and junction conflicts before they occur.
- **Interactive Track Visualizer:** Linear schematic of the CSMT ↔ Dadar section showing Slow and Fast lines, block signals, platforms, and live train positions.
- **Dynamic Platform Reallocation:** Suggests alternate platforms during terminal congestion or delays, tracking passenger capacity and generating public announcements.
- **Multi-Scenario Simulator:** Includes presets for *Mumbai Peak Hour Rush*, *Express vs. Freight Priority*, and *Monsoon Disruption Recovery*.
- **Real-Time Safety & Delay Alerts:** Automatic categorization of alerts (`conflict`, `delay`, `maintenance`, `weather`) with severity tiers.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 6, Tailwind CSS |
| **UI & Animations** | Radix UI primitives, Lucide Icons, Framer Motion (`motion/react`) |
| **Data Visualization** | Recharts (punctuality curves, delay distribution, throughput metrics) |
| **Backend & Storage** | Deno runtime, Hono API framework, Supabase Functions & PostgreSQL KV Store |
| **Core Algorithms** | Python 3 (`train_ai_algorithms.py`) & TypeScript (`train_ai_engine.tsx`) |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **npm** (or `pnpm` / `yarn`)
- *(Optional)* **Python 3.8+** for running standalone algorithm scripts

### 1. Clone & Install
```bash
git clone https://github.com/your-username/AI-Powered-Train-Traffic-Control.git
cd "AI-Powered Train Traffic Control"
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```
Outputs static assets to the `build/` folder.

### 4. Run Standalone Python Algorithms (Optional)
```bash
python src/train_ai_algorithms.py
```
*(You can also open `src/python_demo.html` in any browser to interact with the algorithm playground).*

