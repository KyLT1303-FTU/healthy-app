import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Dumbbell,
  Play,
  Sparkles,
  Coffee,
  Check,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

// Dữ liệu mẫu lịch tuần mặc định nếu trong Dexie chưa có
const DEFAULT_WEEKLY_SCHEDULE = [
  {
    dayId: 0,
    dayName: 'Thứ Hai',
    shortName: 'T2',
    focus: 'Ngực & Tay Sau (Push)',
    isRest: false,
    isCompleted: true,
    duration: 45,
    calories: 320,
    exercises: [
      { id: 'ex_1', title: 'Hít đất chuẩn (Push-up)', duration: 45, sets: 3, calories: 40 },
      { id: 'ex_2', title: 'Hít đất kim cương (Diamond Push-up)', duration: 45, sets: 3, calories: 45 },
      { id: 'ex_3', title: 'Plank giữ tĩnh', duration: 60, sets: 3, calories: 30 }
    ]
  },
  {
    dayId: 1,
    dayName: 'Thứ Ba',
    shortName: 'T3',
    focus: 'Lưng & Tay Trước (Pull)',
    isRest: false,
    isCompleted: true,
    duration: 50,
    calories: 350,
    exercises: [
      { id: 'ex_4', title: 'Kéo xà đơn (Pull-up)', duration: 45, sets: 3, calories: 50 },
      { id: 'ex_5', title: 'Gập người kéo tạ (Bent-over Row)', duration: 45, sets: 3, calories: 45 }
    ]
  },
  {
    dayId: 2,
    dayName: 'Thứ Tư',
    shortName: 'T4',
    focus: 'Phục hồi & Giãn cơ',
    isRest: true,
    isCompleted: false,
    duration: 20,
    calories: 80,
    exercises: []
  },
  {
    dayId: 3,
    dayName: 'Thứ Năm',
    shortName: 'T5',
    focus: 'Đùi & Mông (Legs)',
    isRest: false,
    isCompleted: false,
    duration: 45,
    calories: 400,
    exercises: [
      { id: 'ex_6', title: 'Squat vệ sĩ', duration: 45, sets: 3, calories: 50 },
      { id: 'ex_7', title: 'Lunge bước chân (Lunges)', duration: 45, sets: 3, calories: 45 }
    ]
  },
  {
    dayId: 4,
    dayName: 'Thứ Sáu',
    shortName: 'T6',
    focus: 'Vai & Bụng (Core)',
    isRest: false,
    isCompleted: false,
    duration: 40,
    calories: 280,
    exercises: [
      { id: 'ex_8', title: 'Gập bụng (Crunches)', duration: 45, sets: 3, calories: 35 },
      { id: 'ex_9', title: 'Plank nghiêng (Side Plank)', duration: 45, sets: 3, calories: 30 }
    ]
  },
  {
    dayId: 5,
    dayName: 'Thứ Bảy',
    shortName: 'T7',
    focus: 'HIET Cardio Toàn Thân',
    isRest: false,
    isCompleted: false,
    duration: 35,
    calories: 450,
    exercises: [
      { id: 'ex_10', title: 'Jumping Jacks', duration: 45, sets: 4, calories: 60 },
      { id: 'ex_11', title: 'Burpees bứt tốc', duration: 45, sets: 3, calories: 70 }
    ]
  },
  {
    dayId: 6,
    dayName: 'Chủ Nhật',
    shortName: 'CN',
    focus: 'Nghỉ ngơi hoàn toàn',
    isRest: true,
    isCompleted: false,
    duration: 0,
    calories: 0,
    exercises: []
  }
];

export default function Schedule({ setCurrentPage, onStartActiveWorkout }) {
  // Lấy thứ trong tuần hiện tại (0 = Thứ 2, ..., 6 = Chủ nhật)
  const todayIndex = (() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  })();

  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);
  const [weeklyData, setWeeklyData] = useState(DEFAULT_WEEKLY_SCHEDULE);

  // Lấy dữ liệu từ Dexie DB (nếu có bảng schedule)
  const dbSchedules = useLiveQuery(async () => {
    try {
      if (db?.schedules) {
        const data = await db.schedules.toArray();
        if (data && data.length > 0) return data;
      }
    } catch (e) {
      console.log('Chưa tìm thấy bảng schedules, dùng dữ liệu mặc định.');
    }
    return null;
  });

  useEffect(() => {
    if (dbSchedules && dbSchedules.length > 0) {
      setWeeklyData(dbSchedules);
    }
  }, [dbSchedules]);

  const selectedDay = weeklyData[selectedDayIndex] || weeklyData[0];

  // Logic Đánh dấu hoàn thành ngày tập & đồng bộ Dexie DB
  const toggleDayCompletion = async (dayId) => {
    const updated = weeklyData.map((item) =>
      item.dayId === dayId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setWeeklyData(updated);

    try {
      if (db?.schedules) {
        const target = updated.find((i) => i.dayId === dayId);
        await db.schedules.put(target);
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái ngày tập:', err);
    }
  };

  // HÀM XỬ LÝ NÚT TẬP NGAY (Đã sửa lỗi không chuyển trang)
  const handleStartWorkout = () => {
    const workoutData = {
      title: `${selectedDay.dayName}: ${selectedDay.focus}`,
      exercises:
        selectedDay.exercises?.length > 0
          ? selectedDay.exercises
          : [
              { id: 'ex_default', title: selectedDay.focus, duration: 45, sets: 3, calories: selectedDay.calories }
            ]
    };

    // 1. Kích hoạt ActiveWorkout nếu App.jsx có truyền hàm
    if (typeof onStartActiveWorkout === 'function') {
      onStartActiveWorkout(workoutData);
    }

    // 2. Chuyển hướng sang trang Tập luyện (Workout)
    if (typeof setCurrentPage === 'function') {
      setCurrentPage('workout');
    }
  };

  // Tính toán thống kê tuần
  const completedDaysCount = weeklyData.filter((d) => d.isCompleted).length;
  const totalWeeklyCalories = weeklyData.reduce(
    (acc, cur) => acc + (cur.isCompleted ? cur.calories : 0),
    0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. BANNER TIẾN ĐỘ TUẦN (HERO SECTION) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-xs font-semibold">
              <CalendarIcon className="w-3.5 h-3.5" /> Lịch tập luyện cá nhân hóa
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Kế Hoạch Tập Trong Tuần
            </h1>
            <p className="text-emerald-100/80 text-xs md:text-sm">
              Duy trì thói quen tập luyện đều đặn để đạt kết quả tối ưu. Bạn đã hoàn thành{' '}
              <strong className="text-emerald-300 font-black">{completedDaysCount}/7 ngày</strong> tuần này!
            </p>
          </div>

          {/* Thống kê nhanh */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 self-start md:self-center">
            <div className="p-3 bg-amber-400 text-amber-950 rounded-xl font-bold">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-[11px] text-emerald-200 font-medium">Calo đã tiêu hao</p>
              <p className="text-xl font-black text-white">{totalWeeklyCalories} <span className="text-xs text-amber-300 font-normal">kcal</span></p>
            </div>
          </div>
        </div>

        {/* Thanh Progress Bar tuần */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
          <div className="flex justify-between text-xs text-emerald-200 font-medium">
            <span>Tiến độ hoàn thành tuần</span>
            <span>{Math.round((completedDaysCount / 7) * 100)}%</span>
          </div>
          <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${(completedDaysCount / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. THANH CHỌN 7 NGÀY TRONG TUẦN (WEEKLY RIBBON TABS) */}
      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {weeklyData.map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          const isToday = idx === todayIndex;

          return (
            <button
              key={day.dayId}
              onClick={() => setSelectedDayIndex(idx)}
              className={`relative p-3 md:p-4 rounded-2xl transition-all duration-200 text-center flex flex-col items-center justify-between border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20 scale-[1.02]'
                  : day.isCompleted
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/60'
                  : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {/* Badge "Hôm nay" */}
              {isToday && (
                <span
                  className={`absolute -top-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    isSelected ? 'bg-amber-400 text-amber-950' : 'bg-emerald-600 text-white'
                  }`}
                >
                  Hôm nay
                </span>
              )}

              <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>
                {day.shortName}
              </span>

              <div className="my-1.5">
                {day.isCompleted ? (
                  <CheckCircle2
                    className={`w-6 h-6 ${isSelected ? 'text-amber-300' : 'text-emerald-600'}`}
                  />
                ) : day.isRest ? (
                  <Coffee
                    className={`w-5 h-5 ${isSelected ? 'text-emerald-200' : 'text-gray-300'}`}
                  />
                ) : (
                  <Circle
                    className={`w-5 h-5 ${isSelected ? 'text-emerald-300' : 'text-gray-300'}`}
                  />
                )}
              </div>

              <span className="text-[10px] font-bold line-clamp-1 truncate w-full">
                {day.isRest ? 'Nghỉ' : `${day.duration}p`}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. NỘI DUNG CHI TIẾT NGÀY ĐƯỢC CHỌN */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
        {/* Header Ngày tập */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {selectedDay.dayName}
              </span>
              {selectedDayIndex === todayIndex && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Buổi tập hôm nay
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">{selectedDay.focus}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Nút Đánh dấu hoàn thành */}
            <button
              onClick={() => toggleDayCompletion(selectedDay.dayId)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                selectedDay.isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {selectedDay.isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã hoàn thành
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-gray-400" /> Đánh dấu hoàn thành
                </>
              )}
            </button>

            {/* Nút Bắt đầu tập trực tiếp (Đã sửa kích hoạt & chuyển trang) */}
            {!selectedDay.isRest && (
              <button
                onClick={handleStartWorkout}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" /> Tập ngay
              </button>
            )}
          </div>
        </div>

        {/* THỜI GIAN / CALO BÀI TẬP */}
        {!selectedDay.isRest && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/60 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Thời lượng</p>
                <p className="text-sm font-black text-gray-900">{selectedDay.duration} phút</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/60 flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Calo ước tính</p>
                <p className="text-sm font-black text-gray-900">~{selectedDay.calories} kcal</p>
              </div>
            </div>

            <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/60 flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl font-bold">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Số bài tập</p>
                <p className="text-sm font-black text-gray-900">
                  {selectedDay.exercises?.length || 0} bài tập
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DANH SÁCH BÀI TẬP TRONG NGÀY HOẶC MÀN HÌNH NGÀY NGHĨ */}
        {selectedDay.isRest ? (
          /* THẺ NGÀY NGHĨ PHỤC HỒI CAO CẤP */
          <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/60 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Coffee className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-black text-gray-900">Ngày Nghỉ Phục Hồi Thể Lực</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Cơ bắp phát triển trong lúc nghỉ ngơi. Hãy ngủ đủ 8 tiếng, uống đủ 2.5L nước và giãn cơ nhẹ nhàng nhé!
              </p>
            </div>
          </div>
        ) : (
          /* DANH SÁCH BÀI TẬP CHI TIẾT */
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              Danh sách bài tập chi tiết
            </h3>

            {selectedDay.exercises && selectedDay.exercises.length > 0 ? (
              <div className="space-y-2">
                {selectedDay.exercises.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="flex items-center justify-between p-4 bg-gray-50/70 hover:bg-gray-100/70 rounded-2xl border border-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-800 rounded-xl font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{ex.title}</p>
                        <p className="text-[10px] text-gray-400">
                          {ex.sets || 3} hiệp x {ex.duration || 45}s (~{ex.calories || 30} kcal)
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                      Chuẩn bị
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                Chưa có danh sách bài tập cụ thể. Hãy bấm "Tập ngay" để bắt đầu bài tập tổng hợp.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}