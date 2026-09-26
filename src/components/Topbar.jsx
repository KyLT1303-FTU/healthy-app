import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { User, ChevronDown } from 'lucide-react';

export default function Topbar({ setCurrentPage }) {
  const [isOpen, setIsOpen] = useState(false);

  // Lấy tên người dùng từ DB
  const profile = useLiveQuery(() => db.local_profile.get('user_profile'));
  const userName = profile?.full_name || 'Người dùng';

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-end sticky top-0 z-10">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-healthy-100 text-healthy-700 flex items-center justify-center font-bold text-sm border border-healthy-200">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700">Xin chào, {userName}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
            <button
              onClick={() => {
                setCurrentPage('profile');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-healthy-50 hover:text-healthy-700"
            >
              <User className="w-4 h-4" />
              <span>Hồ sơ cá nhân</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}