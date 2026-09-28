# Thermotwin

### Problem Statement Fit

ThermoTwin addresses the need for accessible, repeatable thermal-conductivity laboratory practice by simulating the metallic-rod experiment in an interactive browser-based environment.

### Target Users

Students can practice the experiment and analyze observations without exclusive access to physical equipment. Teachers can assign work, monitor live telemetry, and review submissions.

### What We Built

We built a Vite React application with a 3D thermal laboratory, physics simulation, student and teacher workflows, authentication state, experiment observations, live monitoring, and result export.

### Core Features

- Interactive 3D metallic-rod thermal-conduction laboratory
- Student dashboards, experiment history, class joining, and observation capture
- Teacher assignments, live student telemetry monitoring, and result review
- Fourier workbench, temperature graphs, and PDF export

### Technical Architecture

The deployable root is `Thermotwin`, a Vite application using React Router for client-side navigation. Physics solvers and sensor models are isolated in `src/physics`, Zustand stores manage application state, and Three.js components render the laboratory apparatus.

### Tech Stack

React, Vite, React Router, TypeScript/TSX, Three.js, React Three Fiber, Drei, Zustand, Recharts, GSAP, Framer Motion, and jsPDF.

### Innovation / Uniqueness

The project combines a visual 3D apparatus with a numerical thermal model and classroom workflows, allowing the same experiment to be explored individually or supervised by a teacher.

### Demo Instructions

From `Thermotwin`, run `npm install` and `npm run dev`, then open the Vite URL. Use Register Profile to create a student or teacher account, enter the dashboard, and open the virtual lab. Use `npm run build` to verify the deployment bundle.

### Known Limitations

Authentication, class data, and live monitoring state are client-side demo stores; there is no production backend or persistent database integration. The production bundle is large because the 3D and export libraries are included.

### Future Work

Add a production API and database, persistent accounts and submissions, role-based server authorization, and code-splitting for the 3D laboratory route.