import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Dumbbell, Flame, Trophy, Calendar, Play } from 'lucide-react';

export default function Dashboard({ setCurrentPage }) {
  const profile = useLiveQuery(() => db.local_profile.get('user_profile'));
  const userName = profile?.full_name || 'Người dùng';

  // Lấy các buổi tập sắp tới
  const upcomingSchedules = useLiveQuery(() =>
    db.schedules
      .where('status')
      .equals('planned')
      .limit(3)
      .toArray()
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Banner Chào Mừng */}
      <div className="bg-gradient-to-r from-healthy-700 to-healthy-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
            Hôm nay là một ngày tuyệt vời
          </span>
          <h1 className="text-3xl font-bold">Xin chào, {userName}! 👋</h1>
          <p className="text-healthy-100 text-sm leading-relaxed">
            Sẵn sàng cho các mục tiêu sức khỏe hôm nay chưa? Hãy duy trì thói quen tập luyện để có một cơ thể dẻo dai và khỏe mạnh!
          </p>
        </div>
      </div>

      {/* 3 Thẻ Chỉ Số Nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Chuỗi tập luyện (Streak)</p>
            <p className="text-2xl font-bold text-gray-800">0 Ngày</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-healthy-100 text-healthy-600 flex items-center justify-center">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Buổi tập tuần này</p>
            <p className="text-2xl font-bold text-gray-800">0 / {profile?.weekly_target_sessions || 3}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Huy hiệu đã đạt</p>
            <p className="text-2xl font-bold text-gray-800">0 Huy hiệu</p>
          </div>
        </div>
      </div>

      {/* Khối Lịch Tập Tiếp Theo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-healthy-600" />
            <h2 className="text-lg font-bold text-gray-800">Lịch tập tiếp theo</h2>
          </div>
          <button 
            onClick={() => setCurrentPage('workout')} 
            className="text-sm font-semibold text-healthy-600 hover:text-healthy-700"
          >
            Xem tất cả ›
          </button>
        </div>

        {!upcomingSchedules || upcomingSchedules.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Chưa có lịch tập nào được xếp. Hãy hoàn tất khai báo thông tin!
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSchedules.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-800">{item.session_title}</p>
                  <p className="text-xs text-gray-500">{item.scheduled_date} · {item.start_time}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-healthy-600 text-white rounded-lg text-sm font-semibold hover:bg-healthy-700 transition-colors">
                  <Play className="w-4 h-4 fill-current" />
                  Bắt đầu
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}