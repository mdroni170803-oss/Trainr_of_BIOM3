
import React, { useState, useEffect } from 'react';
import { MoreVertical, Users, GraduationCap, Trophy } from 'lucide-react';
import Sidebar from './components/Sidebar.tsx';
import AdminSection from './components/AdminSection.tsx';
import SedulousSection from './components/SedulousSection.tsx';
import CourseSection from './components/CourseSection.tsx';
import { Theme, NavTab, AppData, Admin, SedulousEntry, Course } from './types.ts';
import { getInitialData, saveData, backupToJSON, restoreFromJSON } from './services/storageService.ts';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('biom_theme') as Theme;
    return saved || 'light';
  });
  const [activeTab, setActiveTab] = useState<NavTab>('Admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appData, setAppData] = useState<AppData>(getInitialData);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('biom_theme', theme);
  }, [theme]);

  // Sync local storage when data changes
  useEffect(() => {
    saveData(appData);
  }, [appData]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleBackup = () => {
    backupToJSON(appData);
  };

  const handleRestore = async (file: File) => {
    try {
      const restoredData = await restoreFromJSON(file);
      setAppData(restoredData);
      alert('Data restored successfully!');
    } catch (err) {
      alert('Failed to restore data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleUpdateAdmins = (admins: Admin[]) => {
    setAppData(prev => ({ ...prev, admins, lastUpdated: new Date().toISOString() }));
  };

  const handleUpdateSedulous = (sedulous: SedulousEntry[]) => {
    setAppData(prev => ({ ...prev, sedulous, lastUpdated: new Date().toISOString() }));
  };

  const handleUpdateCourses = (courses: Course[]) => {
    setAppData(prev => ({ ...prev, courses, lastUpdated: new Date().toISOString() }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Admin':
        return <AdminSection admins={appData.admins} onUpdateAdmins={handleUpdateAdmins} />;
      case 'Sedulous':
        return <SedulousSection entries={appData.sedulous} onUpdateEntries={handleUpdateSedulous} />;
      case 'Courses':
        return (
          <CourseSection 
            courses={appData.courses} 
            admins={appData.admins} 
            onUpdateCourses={handleUpdateCourses} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col theme-transition dark:bg-slate-950 max-h-screen overflow-hidden">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
            B
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
            BIOM
          </span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-slate-400"
        >
          <MoreVertical size={24} />
        </button>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="sticky bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 h-20 flex items-center justify-around px-2 z-30 flex-shrink-0">
        <NavItem 
          icon={<Users size={22} />} 
          label="Admin" 
          isActive={activeTab === 'Admin'} 
          onClick={() => setActiveTab('Admin')} 
        />
        <NavItem 
          icon={<Trophy size={22} />} 
          label="Sedulous" 
          isActive={activeTab === 'Sedulous'} 
          onClick={() => setActiveTab('Sedulous')} 
        />
        <NavItem 
          icon={<GraduationCap size={22} />} 
          label="Courses" 
          isActive={activeTab === 'Courses'} 
          onClick={() => setActiveTab('Courses')} 
        />
      </nav>

      {/* Sidebar Drawer */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        theme={theme}
        onThemeToggle={toggleTheme}
        onBackup={handleBackup}
        onRestore={handleRestore}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: NavTab;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 w-20 relative group`}
    >
      <div className={`p-2 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110' 
          : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400'
      }`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${
        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
      }`}>
        {label}
      </span>
    </button>
  );
};

export default App;
