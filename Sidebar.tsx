
import React, { useRef } from 'react';
import { X, Sun, Moon, Download, Upload, Info } from 'lucide-react';
import { Theme, APP_VERSION } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeToggle: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  theme, 
  onThemeToggle, 
  onBackup,
  onRestore 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Theme Section */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Appearance</h3>
            <button 
              onClick={onThemeToggle}
              className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 group"
            >
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Sun size={20} className="text-orange-500" /> : <Moon size={20} className="text-blue-400" />}
                <span className="font-medium dark:text-slate-200">Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
              </div>
              <div className="w-10 h-5 bg-slate-200 dark:bg-slate-600 rounded-full relative p-1">
                <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
          </section>

          {/* Data Section */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Data Management</h3>
            <div className="space-y-2">
              <button 
                onClick={onBackup}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors dark:text-slate-200"
              >
                <Download size={20} className="text-emerald-500" />
                <span className="font-medium">Backup Data</span>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors dark:text-slate-200"
              >
                <Upload size={20} className="text-indigo-500" />
                <span className="font-medium">Restore Data</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json"
                  onChange={handleFileChange}
                />
              </button>
            </div>
          </section>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-2 text-center">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">App For Trainer of BIOM</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">App by Md Roni (20th bach)</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Version {APP_VERSION}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
