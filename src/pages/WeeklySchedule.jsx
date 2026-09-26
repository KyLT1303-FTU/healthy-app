import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { 
  Calendar, Clock, Plus, Dumbbell, Ban, CheckCircle2, 
  Trash2, X, AlertCircle 
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { key: 0, label: 'Thứ 2', short: 'T2' },
  { key: 1, label: 'Thứ 3', short: 'T3' },
  { key: 2, label: 'Thứ 4', short: 'T4' },
  { key: 3, label: 'Thứ 5', short: 'T5' },
  { key: 4, label: 'Thứ 6', short: 'T6' },
  { key: 5, label: 'Thứ 7', short: 'T7' },
  { key: 6, label: 'Chủ Nhật', short: 'CN' },
];

export default function WeeklySchedule({ onStartWorkout }) {
  const events = useLiveQuery(() => db.schedule_events?.toArray()) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form thêm sự kiện
  const [selectedDay, setSelectedDay] = useState(0);
  const [eventType, setEventType] = useState('workout'); // 'workout' hoặc 'busy'
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('07:00 - 08:00');

  // Thêm lịch tập hoặc lịch bận mới
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await db.schedule_events.add({
      day_index: Number(selectedDay),
      type: eventType, // 'workout' | 'busy'
      title: title.trim(),
      time_slot: timeSlot,
      is_completed: false,
    });

    // Reset Form & Đóng Modal
    setTitle('');
    setIsModalOpen(false);
  };

  // Xóa lịch
  const handleDeleteEvent = async (id) => {
    await db.schedule_events.delete(id);
  };

  // Đánh dấu hoàn thành lịch tập
  const handleToggleComplete = async (event) => {
    if (event.type !== 'workout') return;
    await db.schedule_events.update(event.id, {
      is_completed: !event.is_completed,
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Calendar className="w-7 h-7 text-healthy-400" />
            Thời khóa biểu & Lịch tập tuần
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Quản lý song song thời gian bận và kế hoạch tập luyện trong tuần.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-healthy-500 hover:bg-healthy-600 text-gray-950 font-bold text-xs rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm lịch mới
        </button>
      </div>

      {/* Chú thích màu sắc */}
      <div className="flex items-center gap-6 text-xs text-gray-400 bg-gray-900/60 p-3.5 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-healthy-500/20 border border-healthy-500" />
          <span>Lịch tập luyện</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500" />
          <span>Lịch bận / Không thể tập</span>
        </div>
      </div>

      {/* Grid Thời khóa biểu 7 ngày */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayEvents = events.filter((e) => e.day_index === day.key);

          return (
            <div 
              key={day.key} 
              className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex flex-col justify-between min-h-[280px]"
            >
              <div className="space-y-3">
                {/* Tiêu đề Thứ */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="font-bold text-sm text-gray-200">{day.label}</span>
                  <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded-full text-gray-400 font-mono">
                    {dayEvents.length} lịch
                  </span>
                </div>

                {/* Danh sách sự kiện trong ngày */}
                <div className="space-y-2.5">
                  {dayEvents.length === 0 ? (
                    <p className="text-[11px] text-gray-600 italic py-4 text-center">Trống</p>
                  ) : (
                    dayEvents.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border text-xs space-y-2 relative group transition-all ${
                          item.type === 'workout'
                            ? item.is_completed
                              ? 'bg-healthy-950/20 border-healthy-500/30 opacity-60 line-through'
                              : 'bg-healthy-500/10 border-healthy-500/30 text-healthy-300'
                            : 'bg-red-500/10 border-red-500/30 text-red-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            {item.type === 'workout' ? (
                              <Dumbbell className="w-3.5 h-3.5 text-healthy-400 shrink-0" />
                            ) : (
                              <Ban className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[110px]">{item.title}</span>
                          </div>

                          <button
                            onClick={() => handleDeleteEvent(item.id)}
                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {item.time_slot}
                          </span>

                          {item.type === 'workout' && (
                            <button
                              onClick={() => handleToggleComplete(item)}
                              className="hover:scale-110 transition-transform"
                            >
                              <CheckCircle2
                                className={`w-4 h-4 ${
                                  item.is_completed ? 'text-healthy-400 fill-healthy-400/20' : 'text-gray-600'
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Nút thêm nhanh cho ngày này */}
              <button
                onClick={() => {
                  setSelectedDay(day.key);
                  setIsModalOpen(true);
                }}
                className="w-full mt-3 py-1.5 border border-dashed border-gray-800 hover:border-gray-700 text-gray-500 hover:text-gray-300 text-[11px] rounded-xl flex items-center justify-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" /> Thêm lịch
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL THÊM SỰ KIỆN MỚI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-md w-full space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-base">Thêm vào Thời khóa biểu</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
              {/* Chọn loại lịch */}
              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium">Loại lịch</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEventType('workout')}
                    className={`py-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                      eventType === 'workout'
                        ? 'bg-healthy-500/20 border-healthy-500 text-healthy-400'
                        : 'bg-gray-950 border-gray-800 text-gray-400'
                    }`}
                  >
                    <Dumbbell className="w-4 h-4" /> Lịch tập luyện
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType('busy')}
                    className={`py-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                      eventType === 'busy'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-gray-950 border-gray-800 text-gray-400'
                    }`}
                  >
                    <Ban className="w-4 h-4" /> Lịch bận
                  </button>
                </div>
              </div>

              {/* Tên nội dung */}
              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium">
                  {eventType === 'workout' ? 'Tên buổi tập' : 'Lý do bận'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    eventType === 'workout'
                      ? 'Ví dụ: Tập ngực & Tay sau'
                      : 'Ví dụ: Họp công ty, Đi công tác...'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-healthy-500"
                />
              </div>

              {/* Chọn Thứ & Khung giờ */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium">Ngày trong tuần</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-healthy-500"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium">Khung giờ</label>
                  <input
                    type="text"
                    required
                    placeholder="07:00 - 08:00"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-healthy-500 font-mono"
                  />
                </div>
              </div>

              {/* Nút lưu */}
              <button
                type="submit"
                className="w-full py-3 bg-healthy-500 hover:bg-healthy-600 text-gray-950 font-bold rounded-xl transition-all mt-2"
              >
                Lưu vào lịch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}