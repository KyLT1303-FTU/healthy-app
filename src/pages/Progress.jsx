import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { 
  TrendingUp, Scale, Calendar, Trophy, Plus, X, 
  Flame, CheckCircle2, Dumbbell, History, ArrowDown, ArrowUp 
} from 'lucide-react';

export default function Progress({ setCurrentPage }) {
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Đọc dữ liệu từ Dexie IndexedDB
  const profile = useLiveQuery(() => db.local_profile.get('user_profile'));
  
  const weightLogs = useLiveQuery(() => 
    db.weight_logs.orderBy('logged_date').reverse().toArray()
  ) || [];

  const workoutHistory = useLiveQuery(() => 
    db.workout_history.orderBy('completed_date').reverse().toArray()
  ) || [];

  // Tính toán chỉ số thống kê
  const totalWorkouts = workoutHistory.length;
  const totalMinutes = workoutHistory.reduce((acc, curr) => acc + (curr.duration_min || 0), 0);
  
  const initialWeight = profile?.current_weight_kg || 0;
  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight_kg : initialWeight;
  const weightDiff = (latestWeight - initialWeight).toFixed(1);

  // Thêm bản ghi cân nặng mới
  const handleAddWeight = async () => {
    if (!newWeight || isNaN(newWeight)) return;

    const val = Number(newWeight);
    const today = new Date().toISOString().split('T')[0];

    await db.weight_logs.add({
      weight_kg: val,
      logged_date: today,
    });

    // Cập nhật lại cân nặng hiện tại trong profile
    if (profile) {
      await db.local_profile.put({
        ...profile,
        current_weight_kg: val,
      });
    }

    setNewWeight('');
    setShowWeightModal(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Trang */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-healthy-700 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tiến độ & Kết quả</h1>
            <p className="text-sm text-gray-500">Theo dõi sự thay đổi vóc dáng và lịch sử rèn luyện của bạn.</p>
          </div>
        </div>

        <button
          onClick={() => setShowWeightModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-healthy-600 text-white font-semibold text-xs rounded-xl hover:bg-healthy-700 shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Cập nhật cân nặng
        </button>
      </div>

      {/* 3 Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-healthy-100 text-healthy-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Buổi tập hoàn thành</p>
            <p className="text-2xl font-bold text-gray-800">{totalWorkouts} buổi</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Tổng thời gian tập</p>
            <p className="text-2xl font-bold text-gray-800">{totalMinutes} phút</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Cân nặng hiện tại</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-800">{latestWeight} kg</p>
              {Number(weightDiff) !== 0 && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                  Number(weightDiff) < 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {Number(weightDiff) < 0 ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                  {Math.abs(weightDiff)} kg
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Nhật Ký Lịch Sử Cân Nặng */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-healthy-600" />
              <h2 className="text-lg font-bold text-gray-800">Lịch sử cân nặng</h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">Mục tiêu: {profile?.target_weight_kg || '--'} kg</span>
          </div>

          {weightLogs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Chưa có bản ghi cân nặng nào.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {weightLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-healthy-600" />
                    <span className="font-semibold text-gray-700">{log.weight_kg} kg</span>
                  </div>
                  <span className="text-xs text-gray-400">{log.logged_date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nhật Ký Lịch Sử Tập Luyện */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-healthy-600" />
              <h2 className="text-lg font-bold text-gray-800">Nhật ký buổi tập</h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">Gần đây nhất</span>
          </div>

          {workoutHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs space-y-2">
              <p>Chưa có buổi tập nào được ghi nhận.</p>
              <button
                onClick={() => setCurrentPage('workout')}
                className="text-healthy-600 font-semibold hover:underline"
              >
                Tập ngay buổi đầu tiên →
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {workoutHistory.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 text-sm">{item.workout_title}</h4>
                    <span className="text-xs text-gray-400">{item.completed_date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <span>⏱️ {item.duration_min} phút</span>
                    <span>✅ {item.completed_exercises} / {item.total_exercises} bài tập</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL CẬP NHẬT CÂN NẶNG */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-800 text-base">Cập nhật cân nặng hôm nay</h3>
              <button onClick={() => setShowWeightModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-gray-700">Cân nặng mới (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ví dụ: 64.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-healthy-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowWeightModal(false)}
                className="w-full py-2.5 border rounded-xl font-semibold text-gray-600 hover:bg-gray-50 text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleAddWeight}
                className="w-full py-2.5 bg-healthy-600 text-white rounded-xl font-semibold hover:bg-healthy-700 text-xs shadow-md"
              >
                Ghi nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}