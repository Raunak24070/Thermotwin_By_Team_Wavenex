import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/ui/Navbar';
import LandingPage from './app/page';
import AboutPage from './app/about/page';
import ExperimentGuidePage from './app/experiment-guide/page';
import LoginPage from './app/login/page';
import ProfilePage from './app/profile/page';
import RegisterPage from './app/register/page';
import StudentDashboard from './app/student/dashboard/page';
import VirtualLabExperimentPage from './app/student/experiment/[id]/page';
import StudentHistoryPage from './app/student/history/page';
import TeacherDashboard from './app/teacher/dashboard/page';
import TeacherClassesPage from './app/teacher/classes/page';
import TeacherLiveLabPage from './app/teacher/live-lab/page';
import IndividualStudentSupervisionPage from './app/teacher/live-lab/[studentId]/page';
import TeacherResultsPage from './app/teacher/results/page';
import './app/globals.css';

function App() {
  const basename = import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <BrowserRouter basename={basename}>
      <div className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/experiment-guide" element={<ExperimentGuidePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/experiment/:id" element={<VirtualLabExperimentPage />} />
            <Route path="/student/history" element={<StudentHistoryPage />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/classes" element={<TeacherClassesPage />} />
            <Route path="/teacher/live-lab" element={<TeacherLiveLabPage />} />
            <Route path="/teacher/live-lab/:studentId" element={<IndividualStudentSupervisionPage />} />
            <Route path="/teacher/results" element={<TeacherResultsPage />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
          ThermoTwin Web &copy; 2026. Interactive 3D Physics Virtual Laboratory System.
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
