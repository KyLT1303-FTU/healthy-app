import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  Flame,
  Clock,
  Trophy,
  Activity,
  Calendar,
  ChevronRight,
  Droplets,
  Plus,
  Minus,
  Sparkles,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard({ setCurrentPage }) {
  const profile = useLiveQuery(() => db.profile.get(1), []);
  const events = useLiveQuery(() => db.schedule_events.toArray(), []) || [];
  
  // State theo dõi lượng nước uống trong ngày (ml)
  const [waterIntake, setWaterIntake] = useState(1250);
  const waterTarget = 2000;

  // Lấy lịch tập hôm nay (Ví dụ lấy ngày hiện tại)
  const todayIndex = (new Date().getDay() + 6) % 7; // Chuyển T2=0 ... CN=6
  const todayEvents = events.filter((e) => e.day_index === todayIndex && e.type === 'workout');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. HERO BANNER BỔ SUNG GRADIENT NỔI BẬT */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-8 shadow-xl shadow-emerald-900/10 border border-emerald-700/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Chúc bạn một ngày năng lượng!
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Xin chào, {profile?.name || 'Người dùng'} 👋
          </h1>
          <p className="text-emerald-100/80 text-xs md:text-sm leading-relaxed">
            Hôm nay là cơ hội tuyệt vời để hoàn thành mục tiêu sức khỏe của bạn. Đừng quên duy trì chuỗi tập luyện nhé!
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentPage && setCurrentPage('workout')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-400/20 transition-all transform hover:-translate-y-0.5"
            >
              Vào tập ngay <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage && setCurrentPage('schedule')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-md transition-all border border-white/10"
            >
              Xem lịch tuần
            </button>
          </div>
        </div>
      </div>

      {/* 2. CHỈ SỐ NHANH (STATS GRID) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-700">Chuỗi ngày tập</span>
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">5 ngày</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">🔥 Giữ vững phong độ!</p>
        </div>

        {/* Calo */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-700">Calo tiêu hao</span>
            <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">420 kcal</div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Đạt 70% mục tiêu ngày</p>
        </div>

        {/* Thời gian */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-700">Thời gian vận động</span>
            <div className="p-2.5 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">45 phút</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Trung bình 40p/buổi</p>
        </div>

        {/* Chỉ số BMI */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800">Chỉ số BMI</span>
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {profile?.height && profile?.weight
              ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
              : '20.2'}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Thể trạng cân đối</p>
        </div>
      </div>

      {/* 3. NỘI DUNG CHÍNH (LỊCH HÔM NAY + TIỆN ÍCH UỐNG NƯỚC) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lịch tập hôm nay */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-gray-900">Lịch tập hôm nay</h2>
            </div>
            <button
              onClick={() => setCurrentPage && setCurrentPage('schedule')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayEvents.length > 0 ? (
            <div className="space-y-3">
              {todayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/30 border border-emerald-100/60 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">{evt.title}</h3>
                      <p className="text-[11px] text-gray-500">{evt.time_slot || '07:00 - 08:00'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('workout')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    Bắt đầu
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
              <p className="text-xs text-gray-500 font-medium">Hôm nay không có lịch tập cố định.</p>
              <button
                onClick={() => setCurrentPage && setCurrentPage('workout')}
                className="text-xs font-bold text-emerald-700 hover:underline inline-block"
              >
                + Khám phá danh sách bài tập tự do →
              </button>
            </div>
          )}
        </div>

        {/* Tiện ích Theo dõi Uống nước */}
        <div className="bg-gradient-to-br from-cyan-900 via-sky-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-500/20 text-sky-300 rounded-xl border border-sky-400/20">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black">Nước uống hôm nay</h3>
              </div>
              <span className="text-xs font-bold text-sky-300 bg-sky-500/20 px-2.5 py-1 rounded-full border border-sky-400/20">
                {Math.round((waterIntake / waterTarget) * 100)}%
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{waterIntake}</span>
                <span className="text-xs text-sky-200 font-medium">/ {waterTarget} ml</span>
              </div>
              {/* Thanh tiến trình */}
              <div className="w-full bg-sky-950/80 rounded-full h-3 mt-3 overflow-hidden p-0.5 border border-sky-400/20">
                <div
                  className="bg-gradient-to-r from-sky-400 to-cyan-300 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (waterIntake / waterTarget) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-6 relative z-10">
            <button
              onClick={() => setWaterIntake((prev) => Math.max(0, prev - 250))}
              className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 backdrop-blur-md transition-all border border-white/10"
            >
              <Minus className="w-3.5 h-3.5" /> 250ml
            </button>
            <button
              onClick={() => setWaterIntake((prev) => prev + 250)}
              className="flex-1 py-2.5 bg-sky-400 hover:bg-sky-300 text-sky-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-sky-400/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> 250ml
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}