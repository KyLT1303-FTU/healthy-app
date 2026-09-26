import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import ActiveWorkout from './ActiveWorkout';
import { Dumbbell, Play, ShieldAlert } from 'lucide-react';

export default function Workout({ setCurrentPage }) {
  const [inActiveSession, setInActiveSession] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');

  const exercises = useLiveQuery(() => db.exercises.toArray()) || [];
  const profileInjuries = useLiveQuery(() => db.profile_injuries.toArray()) || [];
  const userInjuryIds = profileInjuries.map((pi) => pi.injury_id);

  const handleStartWorkout = (title = 'Buổi tập đề xuất') => {
    setSessionTitle(title);
    setInActiveSession(true);
  };

  // Nếu người dùng đang trong buổi tập -> Render ActiveWorkout Player
  if (inActiveSession) {
    return (
      <ActiveWorkout
        workoutTitle={sessionTitle}
        onFinish={() => setInActiveSession(false)}
        onCancel={() => setInActiveSession(false)}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Trang */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-healthy-700 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Phòng tập luyện</h1>
            <p className="text-sm text-gray-500">Danh sách bài tập được cá nhân hóa theo thể trạng của bạn.</p>
          </div>
        </div>
      </div>

      {/* Hero Banner Bắt Đầu Tập */}
      <div className="bg-gradient-to-br from-healthy-600 to-healthy-800 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full uppercase">Sẵn sàng ngay</span>
          <h2 className="text-2xl font-bold">Buổi tập toàn thân hôm nay</h2>
          <p className="text-healthy-100 text-sm">
            Hệ thống đếm Hiệp (Set/Rep), đồng hồ nghỉ đếm ngược và kiểm tra chấn thương theo thời gian thực.
          </p>
        </div>
        <button
          onClick={() => handleStartWorkout('Buổi tập toàn thân đề xuất')}
          className="flex items-center gap-3 px-6 py-4 bg-white text-healthy-800 font-bold rounded-2xl shadow-md hover:bg-healthy-50 transition-all text-sm shrink-0"
        >
          <Play className="w-5 h-5 fill-current" /> Bắt đầu ngay
        </button>
      </div>

      {/* Thư viện danh sách Bài Tập */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Thư viện bài tập ({exercises.length} bài)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((ex) => {
            const isContraindicated = userInjuryIds.some((id) => ex.contraindicated_injuries?.includes(id));

            return (
              <div
                key={ex.id}
                className={`p-5 rounded-2xl border shadow-sm transition-all flex justify-between items-start ${
                  isContraindicated ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{ex.name}</span>
                    {isContraindicated && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-md">
                        <ShieldAlert className="w-3 h-3" /> Tránh do chấn thương
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{ex.description || 'Bài tập rèn luyện thể lực.'}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-medium pt-1">
                    <span>🎯 {ex.target_muscle || 'Toàn thân'}</span>
                    <span>⏱️ {ex.duration_sec ? `${ex.duration_sec}s` : '3 sets x 12 reps'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}