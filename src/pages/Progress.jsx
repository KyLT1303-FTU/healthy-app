import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  TrendingUp,
  Award,
  Scale,
  Flame,
  Calendar,
  Activity,
  Plus,
  CheckCircle2,
  Target,
  ChevronRight,
  Sparkles,
  Clock,
  ArrowDown,
  ArrowUp,
  BarChart3
} from 'lucide-react';

export default function Progress({ setCurrentPage }) {
  // Lấy dữ liệu hồ sơ cá nhân
  const profile = useLiveQuery(() => db.profile?.get(1), []);

  // An toàn khi truy xuất nhật ký cân nặng và lịch sử tập luyện
  const weightLogs =
    useLiveQuery(() => (db.weight_logs ? db.weight_logs.toArray() : Promise.resolve([])), []) || [];
  const workoutHistory =
    useLiveQuery(() => (db.workout_history ? db.workout_history.toArray() : Promise.resolve([])), []) || [];

  // State quản lý Modal cập nhật cân nặng
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Các chỉ số tính toán an toàn
  const currentWeight = Number(profile?.weight) || 0;
  const targetWeight = Number(profile?.target_weight) || currentWeight;
  const height = Number(profile?.height) || 0;

  // Tính BMI
  const bmi =
    height > 0 && currentWeight > 0
      ? (currentWeight / Math.pow(height / 100, 2)).toFixed(1)
      : null;

  const getBMICategory = (val) => {
    if (!val) return { text: 'Chưa xác định', color: 'text-gray-500' };
    if (val < 18.5) return { text: 'Gầy', color: 'text-amber-600' };
    if (val < 24.9) return { text: 'Bình thường (Lý tưởng)', color: 'text-emerald-600' };
    if (val < 29.9) return { text: 'Thừa cân', color: 'text-amber-600' };
    return { text: 'Béo phì', color: 'text-red-600' };
  };

  const bmiInfo = getBMICategory(bmi ? parseFloat(bmi) : null);

  // Xử lý lưu cân nặng mới
  const handleSaveWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(newWeight)) return;

    try {
      const weightVal = Number(newWeight);

      // 1. Cập nhật cân nặng trong Profile
      if (db.profile) {
        await db.profile.update(1, { weight: weightVal });
      }

      // 2. Thêm vào nhật ký cân nặng (nếu bảng tồn tại)
      if (db.weight_logs) {
        await db.weight_logs.add({
          weight: weightVal,
          date: new Date().toISOString().split('T')[0]
        });
      }

      setNewWeight('');
      setIsWeightModalOpen(false);
    } catch (err) {
      console.error('Lỗi khi lưu cân nặng:', err);
    }
  };

  // Dữ liệu giả lập biểu đồ tuần (mô phỏng tiến độ 7 ngày gần nhất)
  const weeklyData = [
    { day: 'T2', mins: 45, done: true },
    { day: 'T3', mins: 0, done: false },
    { day: 'T4', mins: 60, done: true },
    { day: 'T5', mins: 30, done: true },
    { day: 'T6', mins: 50, done: true },
    { day: 'T7', mins: 0, done: false },
    { day: 'CN', mins: 40, done: true }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. HERO BANNER TIẾN ĐỘ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-8 shadow-xl border border-emerald-700/30">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> Theo dõi sự thay đổi mỗi ngày
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Báo cáo tiến độ & Thành tựu
            </h1>
            <p className="text-emerald-100/80 text-xs md:text-sm leading-relaxed">
              Ghi nhận từng bước chuyển biến của cơ thể. Sự kiên trì hôm nay sẽ mang lại vóc dáng mơ ước ngày mai!
            </p>
          </div>

          <button
            onClick={() => setIsWeightModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-400/20 transition-all transform hover:-translate-y-0.5 whitespace-nowrap self-start md:self-center"
          >
            <Plus className="w-4 h-4" /> Cập nhật cân nặng hôm nay
          </button>
        </div>
      </div>

      {/* 2. CHỈ SỐ CÂN NẶNG & MỤC TIÊU (PROGRESS CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thẻ Cân nặng hiện tại */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 border border-emerald-100/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Cân nặng hiện tại
            </span>
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">
              {currentWeight > 0 ? currentWeight : '--'}
            </span>
            <span className="text-sm font-bold text-gray-500">kg</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Chiều cao khai báo: {height > 0 ? `${height} cm` : 'Chưa nhập'}
          </p>
        </div>

        {/* Thẻ Cân nặng mục tiêu */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-50/80 via-white to-sky-50/30 border border-teal-100/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Mục tiêu hướng tới
            </span>
            <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-md shadow-teal-600/20">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">
              {targetWeight > 0 ? targetWeight : '--'}
            </span>
            <span className="text-sm font-bold text-gray-500">kg</span>
          </div>
          <p className="text-[11px] text-teal-700 font-medium">
            {currentWeight > 0 && targetWeight > 0
              ? currentWeight > targetWeight
                ? `Cần giảm ${(currentWeight - targetWeight).toFixed(1)} kg`
                : currentWeight < targetWeight
                ? `Cần tăng ${(targetWeight - currentWeight).toFixed(1)} kg`
                : 'Đã đạt cân nặng lý tưởng! 🎉'
              : 'Hãy cập nhật hồ sơ để theo dõi'}
          </p>
        </div>

        {/* Thẻ Chỉ số BMI */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/30 border border-indigo-100/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
              Chỉ số BMI
            </span>
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{bmi || '--'}</span>
            <span className={`text-xs font-black ${bmiInfo.color}`}>({bmiInfo.text})</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-medium">
            Chuẩn BMI cho người Châu Á
          </p>
        </div>
      </div>

      {/* 3. THỐNG KÊ TẬP LUYỆN & BIỂU ĐỒ HOẠT ĐỘNG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ thời gian tập trong tuần */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900">Hoạt động tuần này</h2>
                <p className="text-xs text-gray-400">Thời gian tập luyện theo phút</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Tổng: 225 phút
            </span>
          </div>

          {/* Biểu đồ cột tự tùy biến */}
          <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6 pb-2 border-b border-gray-100">
            {weeklyData.map((item, idx) => {
              const maxMins = 60;
              const heightPercent = Math.min(100, Math.round((item.mins / maxMins) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-gray-400">
                    {item.mins > 0 ? `${item.mins}m` : ''}
                  </span>
                  <div className="w-full bg-gray-100 rounded-xl h-full flex items-end overflow-hidden p-1">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        item.done
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-md" />
              <span>Đã hoàn thành buổi tập</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-200 rounded-md" />
              <span>Ngày nghỉ / Chưa tập</span>
            </div>
          </div>
        </div>

        {/* Tổng quan chỉ số tiêu hao */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-gray-900">Thành tích tổng quan</h2>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/60 to-orange-50/20 border border-amber-100/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-xl">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Tổng calo đã đốt</p>
                    <p className="text-base font-black text-gray-900">1,840 kcal</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 to-cyan-50/20 border border-blue-100/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 text-white rounded-xl">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Tổng thời gian tập</p>
                    <p className="text-base font-black text-gray-900">320 phút</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-teal-50/20 border border-emerald-100/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Số buổi hoàn thành</p>
                    <p className="text-base font-black text-gray-900">8 buổi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentPage && setCurrentPage('workout')}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-800/10"
          >
            Tiếp tục luyện tập ngay <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODAL CẬP NHẬT CÂN NẶNG HÔM NAY */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-gray-900">Ghi nhận cân nặng mới</h3>
              </div>
              <button
                onClick={() => setIsWeightModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Cân nặng hôm nay (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="Ví dụ: 55.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 text-xs font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                >
                  Lưu kết quả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}