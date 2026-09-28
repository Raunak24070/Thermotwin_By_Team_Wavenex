# ThermoTwin: Thermal Conductivity Virtual Laboratory

ThermoTwin is a browser-based virtual laboratory for determining the thermal conductivity of a metallic rod. It combines an interactive Three.js apparatus with a numerical heat-conduction simulation, live thermocouple telemetry, observation capture, Fourier analysis, and student/faculty workflows.

The current application is a Vite-powered React single-page application. It is not a Next.js application and does not require a backend to run the demo.

## Current Stack

- React 19 and Vite 5
- React Router 7 for client-side navigation
- TypeScript and TSX for the physics, stores, and application pages
- Three.js 0.186, React Three Fiber 9, and Drei 10 for the 3D lab
- Zustand 5 for persisted authentication, class, physics, and monitoring state
- Recharts for live curves and jsPDF for report export
- Tailwind CSS 4, Lucide React, GSAP, and Framer Motion for the interface

## Quick Start

From the project root (`Thermotwin`):

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

To create and preview the production bundle:

```bash
npm run build
npm run preview
```

The build output is written to `dist/`. The project currently provides `dev`, `build`, and `preview` scripts; there is no `npm start` script.

## What The Simulation Does

The experiment is driven by `src/physics/1dRodSolver.ts`, a 50-node explicit finite-difference thermal-conduction solver. It advances the rod temperature field with CFL-stable sub-stepping and models:

- Axial conduction through the rod
- Electrical heating at the hot end using $P = V^2/R$
- Water cooling at the jacket end
- Heat loss through the insulated casing
- Water outlet temperature and heat removal
- Temperature gradient from a linear regression across the rod sensors
- Experimental conductivity using Fourier's law, $k_{exp} = Q/(A|dT/dx|)$

The default apparatus is a 0.50 m long, 25 mm diameter rod with a 15 ohm heater, 20 °C ambient temperature, and a maximum water flow of 3 L/min. The available materials are:

| Material | Thermal conductivity |
| --- | ---: |
| Copper (Pure) | 385.0 W/(m·K) |
| Aluminium Alloy (6061) | 205.0 W/(m·K) |
| Stainless Steel (304) | 50.2 W/(m·K) |

The live sensor set contains T1-T7 along the rod, T8 at the water inlet, and T9 at the water outlet. The simulator also reports voltage, current, power, flow rate, heat removed by water, heat loss, temperature gradient, and steady-state status.

## Main Experiment Workflow

1. Register a student or teacher profile, then sign in.
2. Open the student dashboard and launch the thermal-conductivity experiment.
3. Select copper, aluminium, or steel.
4. Set the voltage, water flow, and apparatus dimensions in the control panel.
5. Use the 3D apparatus view, thermal/flux modes, live sensor strip, and temperature curves to observe the run.
6. Wait for the simulation to reach its steady-state or ready-to-record status.
7. Capture observations in the virtual tablet.
8. Review the Fourier workbench results and export the report when needed.
9. Faculty users can view class data, live student telemetry, and submitted results.

## Route Map

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/experiment-guide` | Experiment theory, apparatus guidance, and formulas |
| `/about` | About and technical information |
| `/login` | Sign in to a locally registered profile |
| `/register` | Create a student or teacher profile |
| `/profile` | View and edit the current profile |
| `/student/dashboard` | Student overview |
| `/student/experiment/:id` | Authenticated 3D virtual laboratory |
| `/student/history` | Student experiment history |
| `/teacher/dashboard` | Faculty overview |
| `/teacher/classes` | Class and assignment management |
| `/teacher/live-lab` | Live telemetry for monitored students |
| `/teacher/live-lab/:studentId` | Individual student supervision |
| `/teacher/results` | Faculty results and review queue |

## Deployment

The included `Dockerfile` builds the Vite bundle with Node 20 and serves `dist/` through nginx. `nginx.conf` includes the SPA fallback required for client-side routes. `deployment.yaml` describes the Kubernetes deployment and service using the image `thermotwin:latest`.

The Vite configuration reads the optional `BASE_PATH` environment variable. Set it when deploying beneath a nested URL so generated assets and React Router navigation use the same base path.

Example container build:

```bash
docker build -t thermotwin:latest .
docker run --rm -p 8080:80 thermotwin:latest
```

Open `http://localhost:8080` after the container starts.

## Project Structure

```text
src/
	app/          Route-level pages
	components/   3D apparatus and experiment UI
	physics/      Solver, materials, sensors, and simulation types
	store/        Zustand application stores
	types/        Shared data types
```

## Demo Limitations

Authentication, classes, observations, submissions, and monitoring data are maintained by persisted client-side Zustand stores. This is suitable for a local demonstration, but it is not production authentication or multi-user synchronization. There is no connected database or server-side authorization in the current build. The 3D and report-export dependencies also make the production bundle relatively large.
