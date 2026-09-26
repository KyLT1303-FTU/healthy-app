import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';
import { seedDatabase } from './db/seedData';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import Workout from './pages/Workout';
import Progress from './pages/Progress';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    seedDatabase().catch((err) => console.error('Lỗi seed data:', err));
  }, []);

  const appState = useLiveQuery(async () => {
    const state = await db.local_app_state.get('app_state');
    return state ?? { onboarding_completed: false };
  });

  if (appState === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!appState.onboarding_completed) {
    return <Onboarding onComplete={() => setCurrentPage('dashboard')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'schedule':
        return <Schedule setCurrentPage={setCurrentPage} />;
      case 'workout':
        return <Workout setCurrentPage={setCurrentPage} />;
      case 'progress':
        return <Progress setCurrentPage={setCurrentPage} />;
      case 'profile':
        return <Profile setCurrentPage={setCurrentPage} />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar setCurrentPage={setCurrentPage} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}