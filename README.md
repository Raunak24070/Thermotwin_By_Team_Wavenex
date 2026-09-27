<<<<<<< HEAD
# ThermoTwin — Thermal Conductivity Digital Twin Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r128%2B-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Physics](https://img.shields.io/badge/Physics-1D_FDTD_Explicit-orange?style=flat-square)](https://en.wikipedia.org/wiki/Finite-difference_time-domain_method)

**ThermoTwin** is an autonomous virtual laboratory digital twin engineered according to the **YCCE September 2026 Problem Statement** for the **Determination of Thermal Conductivity of a Metallic Rod**. 

It couples an authentic 1D Finite Difference Time Domain (FDTD) thermal diffusion solver directly to an interactive 3D WebGL laboratory apparatus, a live multi-sensor telemetry suite, an observation tablet, a Fourier's Law calculator, and a faculty-routed academic review pipeline.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18.17+ or v20+
- **npm** v9+ (or pnpm / yarn)

### 2. Installation & Running

```bash
# Clone the repository
git clone https://github.com/<your-username>/thermotwin-web.git
cd thermotwin-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

### 3. Production Build & Verification

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

---

## 🧪 Core Scientific & Digital Twin Capabilities

### 1. Single Authoritative Physics State
- Powered by a 50-node explicit **1D FDTD heat conduction solver** with sub-stepping for CFL numerical stability:
  $$\Delta t \le \frac{0.35 \cdot \rho \cdot C_p \cdot (\Delta x)^2}{2k}$$
- Models non-steady state transient thermal wave fronts, radiative emission, convective water cooling, and ambient casing losses without artificial hardcoded curves.

### 2. User-Configurable Apparatus Parameters
Students can test non-standard specimens by modifying physical geometry directly in the control panel:
- **Rod Diameter ($D$)**: Configurable from $10\text{ mm}$ to $50\text{ mm}$ (auto-derives cross-sectional area $A = \frac{\pi D^2}{4}$).
- **Rod Length ($L$)**: Configurable from $20\text{ cm}$ to $100\text{ cm}$.
- **Heater Resistance ($R$)**: Configurable from $5\text{ }\Omega$ to $50\text{ }\Omega$.
- Real-time binding: Changes immediately propagate to the solver's node heat capacity, thermal resistance, and Fourier conductivity calculations.

### 3. Decoupled Dimmer-Stat (Voltage / Current)
- **Voltage Slider ($0 - 12\text{ V}$)**: Primary user input dial controlling electrical heater excitation.
- **Current Readout ($I = V/R$)**: Displayed via a read-only live telemetry meter governed strictly by Ohm's Law. Adjusting voltage smoothly updates the derived current without conflicting dual inputs.

### 4. 9-Channel Thermocouple Telemetry Suite
- **$T_1 - T_7$**: Seven physical thermocouples placed at 5 cm intervals along the rod ($x = 0.05\text{m}$ to $0.35\text{m}$).
- **$T_8$**: Cooling water inlet temperature ($20.0^\circ\text{C}$ ambient supply).
- **$T_9$**: Cooling water outlet temperature ($T_8 + \Delta T_w$), tracking enthalpy extraction in real time.
- **Spatial Temperature Gradient ($dT/dx$)**: Computed via online linear regression across $T_1 - T_7$.

### 5. Multi-Mode 3D Laboratory Visualization
- **Normal View**: Realistic brushed metal textures, ceramic heater casing, and acrylic water jacket.
- **Thermal Gradient View**: Vertex-colored continuous temperature spectrum ($20^\circ\text{C}$ deep blue $\rightarrow$ cyan $\rightarrow$ yellow $\rightarrow$ fiery orange $\rightarrow$ incandescent red).
- **Flux / Heatflow Mode**: Dynamic axial heat flux streamline particles showing directional thermal conduction towards the cooling jacket.
- **Cutaway View**: Internal cross-section revealing core conductor and thermocouple junction embedding.

### 6. Four-Stage Thermal Steady-State Stability Engine
Categorizes experimental stability based on maximum node temperature variation rate ($|dT/dt|$):
1. **TRANSIENT** ($|dT/dt| \ge 0.05^\circ\text{C/s}$)
2. **APPROACHING STEADY STATE** ($|dT/dt| < 0.02^\circ\text{C/s}$)
3. **STEADY STATE** ($|dT/dt| < 0.008^\circ\text{C/s}$)
4. **READY TO RECORD** (Maintained steady state for $\ge 15\text{ seconds}$)

---

## 👥 Clean User Architecture & Faculty Submission Routing

The project starts in a **clean, unseeded state** (zero mock accounts or dummy submissions in localStorage).

### Setting Up Genuine Accounts:
You can register your intended **7 student accounts** and **3 teacher accounts** directly via the `/register` page:

1. **Teacher Registration**:
   - Go to `/register`
   - Select Role: **Faculty / Instructor**
   - Provide Name, Email, Password, Institution, and Faculty ID (e.g., `FAC-ME-01`).
   - Log in to access the **Teacher Dashboard**, **Live Lab Monitor**, and **Submissions Queue**.

2. **Student Registration**:
   - Go to `/register`
   - Select Role: **Student**
   - Provide Name, Email, Password, Institution, and Student ID (e.g., `2026-ME-001`).
   - Log in to conduct experiments in the **3D Virtual Lab**.

### Faculty-Targeted Submission Routing:
- When a student completes an experiment in the **Fourier Workbench**, they select their target instructor from the **Faculty Dropdown** or enter their teacher's email address / classroom code.
- Each teacher's **Submissions Queue** (`/teacher/results`) and **Dashboard** (`/teacher/dashboard`) strictly filter and display **only submissions directed to that specific faculty member**.

---

## 🗺️ Application Route Sitemap

| Route | Role / Access | Description |
|---|---|---|
| `/` | Public | Landing page with 3D hero digital twin, feature highlights & quick launch |
| `/experiment-guide` | Public | Comprehensive experiment theory, parameter tables, sensor positions & formulas |
| `/about` | Public | Alias / redirect to Experiment Guide & Technical Documentation |
| `/login` | Public | Authentication sign-in for registered students and faculty |
| `/register` | Public | Clean user registration form for student and teacher profiles |
| `/profile` | Authenticated | View and edit user credentials, institution, bio, and role details |
| `/student/experiment/[id]` | Student / Demo | Main 3D virtual apparatus, controls, live graphs, tablet, & Fourier calculator |
| `/student/dashboard` | Student | Student laboratory overview, recent attempts, and class assignments |
| `/student/history` | Student | Past experimental records, certified exam submissions, and grades |
| `/teacher/dashboard` | Faculty | Instructor portal showing real-time statistics and pending student reviews |
| `/teacher/live-lab` | Faculty | Real-time multi-student telemetry grid and remote apparatus monitoring |
| `/teacher/classes` | Faculty | Classroom creation, enrollment code generation, and assignment manager |
| `/teacher/results` | Faculty | Submission review queue filtered strictly to the logged-in faculty member |

---

## 📖 Standard Laboratory Procedure

1. **Launch Lab**: Open `/student/experiment/thermal_conductivity`.
2. **Select Material**: Choose Copper ($k \approx 385$), Aluminium ($k \approx 205$), or Steel ($k \approx 50.2$).
3. **Verify Apparatus Parameters**: Inspect Rod Diameter $D$, Length $L$, and Heater Resistance $R$.
4. **Circulate Water**: Open virtual needle valve to $\approx 1.5\text{ L/min}$. Verify inlet temperature $T_8 = 20.0^\circ\text{C}$.
5. **Set Voltage**: Adjust dimmer-stat voltage between $7.0\text{V}$ and $10.0\text{V}$. Current ($I$) is auto-derived via Ohm's Law.
6. **Reach Steady State**: Monitor live charts until $|dT/dt| < 0.008^\circ\text{C/s}$ and status reads `STEADY STATE / READY TO RECORD`.
7. **Record Observations**: In the Virtual Tablet, take at least 3 timed observation snapshots.
8. **Fourier Analysis**: Review experimental conductivity $k_{exp}$, error percentage, and energy balance.
9. **Submit to Faculty**: Choose your professor from the dropdown and submit your certified lab report.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **3D Graphics**: Three.js r186, React Three Fiber v9, React Three Drei v10
- **State Management**: Zustand v5 with persistent localStorage
- **Animations**: GSAP v3, Framer Motion v13
- **Charts**: Recharts v3
- **PDF Export**: jsPDF v4
=======
# Thermotwin_By_Team_Wavenex
>>>>>>> 3b512a9ce327b743f1648bb60fe809f55cc79ac7
