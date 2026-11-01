import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import {
  getProjects,
  getProject,
  createProject,
  deleteProject,
  loadSampleScenario,
} from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard' | 'workspace'
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
      return data;
    } catch (err) {
      console.warn('Could not fetch projects:', err);
      return [];
    }
  };

  const handleSelectProject = async (projectId) => {
    const existing = projects.find((p) => p.id === projectId);
    if (existing) {
      setActiveProject(existing);
      setCurrentView('workspace');
    } else {
      try {
        const p = await getProject(projectId);
        setActiveProject(p);
        setCurrentView('workspace');
      } catch (e) {
        console.error('Failed to open project:', e);
      }
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      const created = await createProject(formData);
      await fetchProjects();
      setActiveProject(created);
      setCurrentView('workspace');
    } catch (err) {
      alert('Failed to create project: ' + err.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      await fetchProjects();
      if (activeProject && activeProject.id === projectId) {
        setActiveProject(null);
        setCurrentView('dashboard');
      }
    } catch (err) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  const handleLoadSample = async () => {
    setIsSampleLoading(true);
    try {
      const result = await loadSampleScenario(true, false);
      await fetchProjects();
      if (result.project) {
        setActiveProject(result.project);
        setCurrentView('workspace');
      }
    } catch (err) {
      alert('Failed to load sample scenario: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSampleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'dashboard') {
            fetchProjects();
            setActiveProject(null);
          }
          setCurrentView(view);
        }}
        onLoadSample={handleLoadSample}
        isSampleLoading={isSampleLoading}
      />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onOpenDashboard={() => {
              fetchProjects();
              setCurrentView('dashboard');
            }}
            onLoadSample={handleLoadSample}
            isSampleLoading={isSampleLoading}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onLoadSample={handleLoadSample}
            isSampleLoading={isSampleLoading}
          />
        )}

        {currentView === 'workspace' && activeProject && (
          <WorkspacePage
            project={activeProject}
            onBackToDashboard={() => {
              fetchProjects();
              setActiveProject(null);
              setCurrentView('dashboard');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">RELAY</span>
            <span>•</span>
            <span>WCC Forge 48 Hackathon Build</span>
          </div>
          <div>
            "Never let critical project knowledge leave with people."
          </div>
          <div className="font-mono text-[11px] text-teal-400/80">
            Node.js • Express • React • Tailwind • Zod
          </div>
        </div>
      </footer>
    </div>
  );
}
