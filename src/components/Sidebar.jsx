import React from 'react';
import { LayoutDashboard, Calendar, Dumbbell, TrendingUp, User } from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: LayoutDashboard },
    { id: 'schedule', label: 'Lịch tuần', icon: Calendar },
    { id: 'workout', label: 'Tập luyện', icon: Dumbbell },
    { id: 'progress', label: 'Tiến độ', icon: TrendingUp },
    { id: 'profile', label: 'Hồ sơ', icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-healthy-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            BH
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">BeHealthy</span>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-healthy-50 text-healthy-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-healthy-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quote Đáy Sidebar */}
      <div className="p-4 m-4 bg-healthy-50/60 rounded-2xl border border-healthy-100 text-xs text-healthy-800 leading-relaxed italic">
        "Sức khỏe hôm nay là nền tảng cho cuộc sống tốt đẹp hơn — BeHealthy"
      </div>
    </aside>
  );
}