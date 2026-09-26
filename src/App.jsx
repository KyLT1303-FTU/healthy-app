import React, { useState } from 'react';

// Import Sidebar
import Sidebar from './components/Sidebar';

// Import ĐẦY ĐỦ tất cả các trang
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule'; // Trang Lịch tuần
import Workout from './pages/Workout'; // Trang Tập luyện
import ActiveWorkout from './pages/ActiveWorkout'; // Trang Tập trực tiếp
import Progress from './pages/Progress'; // Trang Tiến độ
import Profile from './pages/Profile'; // Trang Hồ sơ

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeWorkoutData, setActiveWorkoutData] = useState(null);

  // Hàm kích hoạt mở Chế độ tập trực tiếp
  const handleStartActiveWorkout = (workoutData) => {
    setActiveWorkoutData(workoutData);
    setCurrentPage('active-workout');
  };

  return (
    <div className="flex min-h-screen bg-slate-50/70">
      {/* 1. SIDEBAR HIP HIỆN DẦU DỦ (Ẩn khi vào chế độ tập trực tiếp) */}
      {currentPage !== 'active-workout' && (
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}

      {/* 2. KHU VỰC HIỂN THỊ CÁC TRANG */}
      <main className="flex-1 overflow-y-auto">
        {/* Trang 1: Trang chủ */}
        {currentPage === 'dashboard' && (
          <Dashboard setCurrentPage={setCurrentPage} />
        )}

        {/* Trang 2: Lịch tuần */}
        {currentPage === 'schedule' && (
          <Schedule setCurrentPage={setCurrentPage} />
        )}

        {/* Trang 3: Thư viện Bài tập */}
        {currentPage === 'workout' && (
          <Workout
            setCurrentPage={setCurrentPage}
            onStartActiveWorkout={handleStartActiveWorkout}
          />
        )}

        {/* Trang 3.1: Chế độ Tập trực tiếp (Focus Mode) */}
        {currentPage === 'active-workout' && (
          <ActiveWorkout
            workoutData={activeWorkoutData}
            onFinish={() => setCurrentPage('workout')}
            onCancel={() => setCurrentPage('workout')}
          />
        )}

        {/* Trang 4: Tiến độ */}
        {currentPage === 'progress' && (
          <Progress setCurrentPage={setCurrentPage} />
        )}

        {/* Trang 5: Hồ sơ cá nhân */}
        {currentPage === 'profile' && (
          <Profile setCurrentPage={setCurrentPage} />
        )}
      </main>
    </div>
  );
}