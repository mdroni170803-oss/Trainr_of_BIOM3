
import { AppData, APP_VERSION } from '../types';

const STORAGE_KEY = 'biom_trainer_app_data';

export const getInitialData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // Ensure missing fields are initialized for older backups
      return {
        admins: data.admins || [],
        sedulous: data.sedulous || [],
        courses: data.courses || [],
        version: data.version || APP_VERSION,
        lastUpdated: data.lastUpdated || new Date().toISOString()
      };
    } catch (e) {
      console.error("Failed to parse stored data", e);
    }
  }
  return {
    admins: [],
    sedulous: [],
    courses: [],
    version: APP_VERSION,
    lastUpdated: new Date().toISOString()
  };
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const backupToJSON = (data: AppData) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `biom_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const restoreFromJSON = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Basic validation: must at least have the admins array
        if (Array.isArray(data.admins)) {
          const processedData: AppData = {
            admins: data.admins,
            sedulous: data.sedulous || [],
            courses: data.courses || [],
            version: data.version || APP_VERSION,
            lastUpdated: new Date().toISOString()
          };
          saveData(processedData);
          resolve(processedData);
        } else {
          reject(new Error("Invalid backup file format: Missing admins array"));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsText(file);
  });
};
