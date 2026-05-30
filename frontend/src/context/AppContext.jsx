import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [activeDownloads, setActiveDownloads] = useState({});

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateDownload = useCallback((taskId, data) => {
    setActiveDownloads((prev) => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), ...data },
    }));
  }, []);

  const removeDownload = useCallback((taskId) => {
    setActiveDownloads((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((v) => !v);
  }, []);

  return (
    <AppContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        darkMode,
        toggleDarkMode,
        activeDownloads,
        updateDownload,
        removeDownload,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
