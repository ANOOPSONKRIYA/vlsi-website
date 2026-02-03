import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { LightBeams, NoiseOverlay } from '@/components/BackgroundEffects';

import { Home } from '@/pages/Home';
import { Portfolio } from '@/pages/Portfolio';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { Team } from '@/pages/Team';
import { TeamMemberDetail } from '@/pages/TeamMemberDetail';
import { About } from '@/pages/About';
import { Admin } from '@/pages/Admin';
import { AdminTeamEdit } from '@/pages/AdminTeamEdit';
import { AdminProjectEdit } from '@/pages/AdminProjectEdit';

import './App.css';

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Layout with navigation and footer
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-void">
      {/* Background Effects */}
      <LightBeams />
      <NoiseOverlay />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

// Initialize AOS
function AOSInitializer() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
      delay: 0,
    });
  }, []);
  
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AOSInitializer />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Main Routes with Layout */}
          <Route
            path="/"
            element={
              <MainLayout>
                <PageTransition>
                  <Home />
                </PageTransition>
              </MainLayout>
            }
          />
          <Route
            path="/portfolio"
            element={
              <MainLayout>
                <PageTransition>
                  <Portfolio />
                </PageTransition>
              </MainLayout>
            }
          />
          <Route
            path="/portfolio/:slug"
            element={
              <MainLayout>
                <PageTransition>
                  <ProjectDetail />
                </PageTransition>
              </MainLayout>
            }
          />
          <Route
            path="/team"
            element={
              <MainLayout>
                <PageTransition>
                  <Team />
                </PageTransition>
              </MainLayout>
            }
          />
          <Route
            path="/team/:slug"
            element={
              <MainLayout>
                <PageTransition>
                  <TeamMemberDetail />
                </PageTransition>
              </MainLayout>
            }
          />
          <Route
            path="/about"
            element={
              <MainLayout>
                <PageTransition>
                  <About />
                </PageTransition>
              </MainLayout>
            }
          />
          
          {/* Admin Routes - No Layout */}
          <Route
            path="/admin"
            element={<Admin />}
          />
          <Route
            path="/admin/team"
            element={<Admin />}
          />
          <Route
            path="/admin/team/:slug"
            element={<AdminTeamEdit />}
          />
          <Route
            path="/admin/projects"
            element={<Admin />}
          />
          <Route
            path="/admin/projects/:slug"
            element={<AdminProjectEdit />}
          />
          <Route
            path="/admin/settings"
            element={<Admin />}
          />
          
          {/* 404 Route */}
          <Route
            path="*"
            element={
              <MainLayout>
                <PageTransition>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                      <p className="text-white/60 text-lg mb-8">Page not found</p>
                      <a
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
                      >
                        Go Home
                      </a>
                    </div>
                  </div>
                </PageTransition>
              </MainLayout>
            }
          />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
