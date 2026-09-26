import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Calendar, Plus, Sparkles, Trash2, Clock, X } from 'lucide-react';

const DAYS = [
  { id: 0, label: 'T2', name: 'Thứ 2' },
  { id: 1, label: 'T3', name: 'Thứ 3' },
  { id: 2, label: 'T4', name: 'Thứ 4' },
  { id: 3, label: 'T5', name: 'Thứ 5' },
  { id: 4, label: 'T6', name: 'Thứ 6' },
  { id: 5, label: 'T7', name: 'Thứ 7' },
  { id: 6, label: 'CN', name: 'Chủ Nhật' }
];

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState(5); // Mặc định Thứ 7
  const [isAddBusyModalOpen, setIsAddBusyModalOpen] = useState(false);
  const [busyTitle, setBusyTitle] = useState('');
  const [busyTime, setBusyTime] = useState('18:00 - 19:00');

  const events = useLiveQuery(() => db.schedule_events.toArray(), []) || [];

  const handleAutoSchedule = async () => {
    try {
      const workoutEvents = events.filter((e) => e.type === 'workout');
      await Promise.all(workoutEvents.map((e) => db.schedule_events.delete(e.id)));

      await db.schedule_events.bulkAdd([
        { day_index: 0, type: 'workout', title: 'Tập toàn thân (Fullbody)', time_slot: '07:00 - 08:00' },
        { day_index: 2, type: 'workout', title: 'Tập nửa thân trên (Upper)', time_slot: '07:00 - 08:00' },
        { day_index: 4, type: 'workout', title: 'Tập nửa thân dưới (Lower)', time_slot: '07:00 - 08:00' }
      ]);
    } catch (err) {
      console.error('Lỗi xếp lịch:', err);
    }
  };

  const handleSaveBusyTime = async (e) => {
    e.preventDefault();
    if (!busyTitle.trim()) return;

    try {
      await db.schedule_events.add({
        day_index: selectedDay,
        type: 'busy',
        title: busyTitle.trim(),
        time_slot: busyTime
      });

      setBusyTitle('');
      setIsAddBusyModalOpen(false);
    } catch (err) {
      console.error('Lỗi thêm lịch bận:', err);
    }
  };

  const handleDeleteEvent = async (id) => {
    await db.schedule_events.delete(id);
  };

  const dayEvents = events.filter((e) => e.day_index === selectedDay);
  const workoutEvents = dayEvents.filter((e) => e.type === 'workout');
  const busyEvents = dayEvents.filter((e) => e.type === 'busy');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-700 text-white rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Lịch tập tuần này</h1>
            <p className="text-xs text-gray-500">Quản lý lịch tập luyện và thiết lập khung giờ bận cá nhân.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoSchedule}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> Tự động xếp lịch (3 buổi/tuần)
          </button>
          <button
            onClick={() => setIsAddBusyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Thêm lịch bận
          </button>
        </div>
      </div>

      {/* Day Selector Bar */}
      <div className="grid grid-cols-7 gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        {DAYS.map((d) => {
          const isActive = selectedDay === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`py-3.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-[11px] font-semibold opacity-90">{d.label}</span>
              <span className="text-xs font-extrabold mt-0.5">{d.name}</span>
            </button>
          );
        })}
      </div>

      {/* Schedule Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Events Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Buổi tập cho {DAYS.find((d) => d.id === selectedDay)?.name}</h2>

          {workoutEvents.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl space-y-3">
              <Calendar className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-xs text-gray-400">Không có lịch tập nào cho ngày này.</p>
              <button
                onClick={handleAutoSchedule}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Nhấn vào đây để tạo lịch tự động →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {workoutEvents.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-900">{item.title}</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                      <Clock className="w-3.5 h-3.5" /> {item.time_slot}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteEvent(item.id)} className="text-gray-400 hover:text-red-500 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Busy Events Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Lịch bận ngày này</h2>

          {busyEvents.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-100 rounded-2xl space-y-3">
              <p className="text-xs text-gray-400">Chưa có lịch bận nào được khai báo.</p>
              <button
                onClick={() => setIsAddBusyModalOpen(true)}
                className="text-xs font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                + Thêm lịch bận khác
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {busyEvents.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-amber-900">{item.title}</p>
                    <p className="text-[10px] text-amber-700">{item.time_slot}</p>
                  </div>
                  <button onClick={() => handleDeleteEvent(item.id)} className="text-gray-400 hover:text-red-500 p-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Busy Time */}
      {isAddBusyModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Thêm lịch bận cá nhân</h3>
              <button onClick={() => setIsAddBusyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBusyTime} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tên công việc / Lý do bận</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tăng ca, Đi công tác..."
                  value={busyTitle}
                  onChange={(e) => setBusyTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Khung giờ bận</label>
                <input
                  type="text"
                  value={busyTime}
                  onChange={(e) => setBusyTime(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBusyModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
                >
                  Lưu lịch bận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}