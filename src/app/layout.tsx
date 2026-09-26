import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'ThermoTwin Web — 3D Virtual Thermal Laboratory & Student/Teacher Platform',
  description: 'Interactive 3D Virtual Physics Simulation + Student/Teacher Experiment Management Platform for Thermal Conductivity Determination.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`}>
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased flex flex-col selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
          ThermoTwin Web &copy; 2026. Interactive 3D Physics Virtual Laboratory System.
        </footer>
      </body>
    </html>
  );
}
