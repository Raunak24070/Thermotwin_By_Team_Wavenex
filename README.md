# ThermoTwin — Thermal Conductivity Digital Twin Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Project-2ea44f?style=flat-square)](https://your-live-project-url.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/your-username/thermotwin)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Simulation-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

> An interactive browser-based virtual laboratory for determining the thermal conductivity of metallic rods through numerical simulation, 3D visualization, virtual instrumentation, and Fourier-law analysis.

---

## 🔬 Overview

ThermoTwin is a browser-based virtual laboratory that digitally simulates the thermal conductivity experiment for a metallic rod.

The application combines an interactive Three.js apparatus with a numerical heat-conduction solver, virtual thermocouples, live telemetry, temperature visualization, observation capture, and Fourier-law analysis.

The objective is to provide students with an environment where they can configure an experiment, observe the simulated thermal behaviour, collect readings, perform calculations, and generate a report without requiring physical laboratory equipment for every practice session.

> ThermoTwin is designed as an educational simulation and demonstration platform and does not claim to replace physical laboratory measurements.

---

## ✨ Key Features

- 🧪 Interactive thermal-conductivity experiment
- 🧊 Virtual water-cooling system
- 🌡️ Nine virtual temperature sensors
- 🔥 Electrical heater simulation
- 📈 Live temperature curves
- 🌐 Interactive Three.js laboratory apparatus
- 🌡️ Thermal and heat-flow visualization
- ⚙️ Adjustable voltage and water-flow parameters
- 🧮 Fourier-law thermal-conductivity calculation
- 📊 Temperature-gradient analysis
- ⏱️ Steady-state detection
- 📝 Observation recording
- 📄 PDF experiment report generation
- 👨‍🏫 Faculty monitoring workflow
- 📚 Student experiment history
- 🔐 Student and teacher profiles

---

## 🧠 How It Works

The experiment follows the general flow:

Student Configuration
→ Thermal Simulation
→ Temperature Field
→ Virtual Thermocouples
→ Live Telemetry
→ Steady-State Detection
→ Fourier Analysis
→ Experimental Result
→ Report

The thermal model continuously updates the temperature distribution along the rod based on the selected material and experimental parameters.

---

## ⚙️ Thermal Simulation

The core numerical model is implemented in:

`src/physics/1dRodSolver.ts`

The solver uses a **50-node explicit finite-difference model** to approximate one-dimensional heat conduction along the rod.

The simulation considers:

- Axial heat conduction
- Electrical heating
- Water cooling
- Heat loss through insulation
- Water-side heat removal
- Temperature distribution
- Water outlet temperature
- Temperature gradient
- Experimental thermal conductivity
- Steady-state behaviour

### Electrical Heating

The heater power is calculated using:

\[
P = \frac{V^2}{R}
\]

### Fourier's Law

The experimental conductivity is calculated from:

\[
Q = -kA\frac{dT}{dx}
\]

and therefore:

\[
k_{exp} =
\frac{Q}
{A\left|\frac{dT}{dx}\right|}
\]

---

## 🧱 Material Models

| Material | Reference Thermal Conductivity |
|---|---:|
| Copper (Pure) | 385.0 W/(m·K) |
| Aluminium Alloy (6061) | 205.0 W/(m·K) |
| Stainless Steel (304) | 50.2 W/(m·K) |

These values form the reference material configurations used by the simulation.

---

## 🌡️ Virtual Instrumentation

ThermoTwin provides nine virtual temperature sensors.

### Rod

`T1 → T7`

These sensors are distributed along the rod and are used to estimate the temperature gradient.

### Cooling System

`T8` — Water inlet temperature  
`T9` — Water outlet temperature

Additional live parameters include:

- Voltage
- Current
- Electrical power
- Water flow rate
- Heat removed by water
- Heat loss
- Temperature gradient
- Steady-state status

---

## 🧪 Experiment Configuration

The default apparatus configuration is:

| Parameter | Value |
|---|---:|
| Rod Length | 0.50 m |
| Rod Diameter | 25 mm |
| Heater Resistance | 15 Ω |
| Ambient Temperature | 20 °C |
| Maximum Water Flow | 3 L/min |
| Numerical Nodes | 50 |

Students can modify supported experiment parameters through the control interface.

---

## 🖥️ 3D Laboratory

The virtual apparatus is built using:

- Three.js
- React Three Fiber
- Drei

The 3D environment provides an interactive representation of the experimental setup rather than a static illustration.

Visualization includes:

- Apparatus view
- Thermal visualization
- Heat/flux visualization
- Sensor indicators
- Temperature curves
- Interactive camera controls

---

## 📋 Experiment Workflow

1. Create a student or teacher profile.
2. Sign in to the application.
3. Open the thermal-conductivity experiment.
4. Select the required material.
5. Configure voltage, water flow, and apparatus parameters.
6. Start the simulation.
7. Monitor the 3D apparatus and sensor telemetry.
8. Wait for the simulation to reach the required steady-state condition.
9. Capture experimental observations.
10. Analyse the temperature gradient.
11. Calculate experimental thermal conductivity.
12. Review or export the experiment report.

---

## 👨‍🏫 Faculty Workflow

Faculty users have access to a separate workflow for:

- Class management
- Assignment management
- Live laboratory monitoring
- Individual student monitoring
- Experiment results
- Result review

The current implementation uses persisted client-side application state for demonstration purposes.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, TypeScript |
| Build Tool | Vite 5 |
| Routing | React Router 7 |
| 3D | Three.js, React Three Fiber, Drei |
| State | Zustand 5 |
| Styling | Tailwind CSS 4 |
| Animation | GSAP, Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Reports | jsPDF |
| Deployment | Docker, nginx |

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        Student UI        Faculty UI       3D Laboratory
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Zustand Stores   │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Thermal Rod Solver  │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Sensor Telemetry    │
                    └──────────┬──────────┘
                               ▼
              ┌────────────────┴────────────────┐
              ▼                                 ▼
       Live Visualization                 Fourier Analysis
              │                                 │
              └────────────────┬────────────────┘
                               ▼
                       Experiment Report
