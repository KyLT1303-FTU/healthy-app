import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Clock,
  Flame,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  X,
  Search,
  Check,
  Zap
} from 'lucide-react';

// Danh sách bài tập mặc định đa dạng, phân loại rõ ràng
const DEFAULT_EXERCISES = [
  {
    id: 'ex_1',
    title: 'Hít đất chuẩn (Push-up)',
    category: 'upper',
    categoryName: 'Thân trên',
    level: 'Cơ bản',
    duration: '15 phút',
    calories: '120 kcal',
    sets: '3 hiệp x 12 lần',
    affectedInjuries: ['shoulder_pain', 'wrist_pain'],
    description: 'Bài tập kinh điển giúp phát triển cơ ngực, vai và tay sau hiệu quả không cần dụng cụ.',
    steps: [
      'Nằm sấp, hai tay đặt rộng bằng vai trên sàn.',
      'Giữ thân người thẳng từ đầu đến gót chân.',
      'Hạ thấp người xuống cho đến khi ngực gần chạm sàn.',
      'Đẩy người trở lại vị trí ban đầu và thở ra.'
    ]
  },
  {
    id: 'ex_2',
    title: 'Squat vệ sĩ (Bodyweight Squat)',
    category: 'lower',
    categoryName: 'Thân dưới',
    level: 'Cơ bản',
    duration: '15 phút',
    calories: '140 kcal',
    sets: '4 hiệp x 15 lần',
    affectedInjuries: ['knee_pain'],
    description: 'Tăng cường sức mạnh cho đùi trước, mông và cơ đùi sau.',
    steps: [
      'Đứng thẳng, chân rộng bằng vai, mũi chân hơi hướng ra ngoài.',
      'Từ từ hạ hông xuống như đang ngồi ghế, giữ lưng thẳng.',
      'Hạ xuống đến khi đùi song song với sàn.',
      'Nhấn gót chân đẩy người đứng dậy.'
    ]
  },
  {
    id: 'ex_3',
    title: 'Plank giữ tĩnh',
    category: 'core',
    categoryName: 'Cơ bụng',
    level: 'Nhập môn',
    duration: '10 phút',
    calories: '80 kcal',
    sets: '3 hiệp x 45 giây',
    affectedInjuries: ['lower_back_pain', 'shoulder_pain'],
    description: 'Xây dựng sức bền cho cơ lõi, giúp cải thiện tư thế và giảm đau lưng.',
    steps: [
      'Tựa người trên hai cẳng tay và mũi chân.',
      'Giữ cơ thể thành một đường thẳng từ đầu tới gót chân.',
      'Gồng chặt cơ bụng và thở đều, không để võng lưng.'
    ]
  },
  {
    id: 'ex_4',
    title: 'Jumping Jacks (Nhảy dang tay chân)',
    category: 'cardio',
    categoryName: 'Cardio & Đốt mỡ',
    level: 'Mọi cấp độ',
    duration: '12 phút',
    calories: '150 kcal',
    sets: '4 hiệp x 40 giây',
    affectedInjuries: ['knee_pain', 'ankle_sprain'],
    description: 'Bài tập khởi động và đốt cháy calo toàn thân nhanh chóng.',
    steps: [
      'Đứng thẳng, hai chân khép, tay thả lỏng hai bên.',
      'Nhảy bật hai chân ra rộng hơn vai, đồng thời vỗ hai tay lên cao qua đầu.',
      'Nhảy bật trở lại vị trí ban đầu.'
    ]
  },
  {
    id: 'ex_5',
    title: 'Gập bụng (Crunch)',
    category: 'core',
    categoryName: 'Cơ bụng',
    level: 'Cơ bản',
    duration: '12 phút',
    calories: '90 kcal',
    sets: '3 hiệp x 15 lần',
    affectedInjuries: ['lower_back_pain'],
    description: 'Tập trung siết chặt phần cơ bụng trên, tạo múi bụng săn chắc.',
    steps: [
      'Nằm ngửa trên thảm, co gối, bàn chân đặt trên sàn.',
      'Đặt hai tay nhẹ sau đầu hoặc chéo trước ngực.',
      'Dùng cơ bụng nâng vai lên khỏi sàn, cuộn nhẹ người.',
      'Từ từ hạ người xuống vị trí ban đầu.'
    ]
  },
  {
    id: 'ex_6',
    title: 'Lunges (Bước chân chụm)',
    category: 'lower',
    categoryName: 'Thân dưới',
    level: 'Trung bình',
    duration: '15 phút',
    calories: '130 kcal',
    sets: '3 hiệp x 10 lần / chân',
    affectedInjuries: ['knee_pain', 'ankle_sprain'],
    description: 'Cải thiện sự thăng bằng và săn chắc vùng đùi, mông.',
    steps: [
      'Đứng thẳng, bước một chân về phía trước.',
      'Hạ hông xuống sao cho cả hai gối gấp góc 90 độ.',
      'Đẩy người trở lại vị trí ban đầu và đổi chân.'
    ]
  }
];

export default function Workout({ setCurrentPage }) {
  // Lấy dữ liệu hồ sơ và chấn thương an toàn từ IndexedDB
  const profile = useLiveQuery(() => db.profile?.get(1), []);
  const userInjuries =
    useLiveQuery(() => (db.profile_injuries ? db.profile_injuries.toArray() : Promise.resolve([])), []) || [];

  // Danh sách ID chấn thương của người dùng
  const injuryIds = userInjuries.map((i) => i.injury_id);

  // States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);

  // Lọc danh sách bài tập theo mục và từ khóa
  const filteredExercises = DEFAULT_EXERCISES.filter((ex) => {
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Hoàn thành bài tập & lưu vào DB
  const handleComplete = async (exercise) => {
    try {
      if (db.workout_history) {
        await db.workout_history.add({
          exercise_id: exercise.id,
          exercise_title: exercise.title,
          calories: parseInt(exercise.calories) || 100,
          duration: parseInt(exercise.duration) || 15,
          completed_at: new Date().toISOString()
        });
      }

      setCompletedIds((prev) => [...prev, exercise.id]);
      setSelectedExercise(null);
    } catch (err) {
      console.error('Lỗi khi lưu lịch sử tập:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. HERO BANNER BÀI TẬP */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-8 shadow-xl border border-emerald-700/30">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> Thư viện bài tập thông minh
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Chương trình & Bài tập cá nhân
            </h1>
            <p className="text-emerald-100/80 text-xs md:text-sm leading-relaxed">
              Các bài tập được tối ưu hóa theo thể trạng và tự động cảnh báo theo tình trạng chấn thương của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 self-start md:self-center">
            <div className="p-2.5 bg-emerald-400 text-emerald-950 rounded-xl font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-emerald-200 font-medium">Mục tiêu tập luyện</p>
              <p className="text-sm font-black text-white">{profile?.goal || 'Chưa chọn mục tiêu'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CẢNH BÁO CHẤN THƯƠNG (NẾU CÓ) */}
      {injuryIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">Chế độ bảo vệ chấn thương đang bật</p>
              <p className="text-[11px] text-amber-800">
                Hệ thống nhận diện bạn đang có khai báo chấn thương. Các bài tập có thể gây áp lực lên vùng đau sẽ được dán nhãn cảnh báo đỏ.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. THANH TÌM KIẾM & BỘ LỌC */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Lọc Category */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', name: 'Tất cả' },
            { id: 'upper', name: 'Thân trên' },
            { id: 'lower', name: 'Thân dưới' },
            { id: 'core', name: 'Cơ bụng' },
            { id: 'cardio', name: 'Cardio' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 4. DANH SÁCH BÀI TẬP (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((ex) => {
          // Kiểm tra xem bài tập này có ảnh hưởng tới vùng chấn thương không
          const hasInjuryRisk = ex.affectedInjuries.some((inj) => injuryIds.includes(inj));
          const isDone = completedIds.includes(ex.id);

          return (
            <div
              key={ex.id}
              className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group ${
                hasInjuryRisk ? 'border-red-200 bg-red-50/10' : 'border-gray-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {ex.categoryName}
                  </span>
                  {hasInjuryRisk ? (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Tránh nếu đau
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full">
                      {ex.level}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {ex.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {ex.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-bold text-gray-600 pt-1">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-3.5 h-3.5" /> {ex.duration}
                  </div>
                  <div className="flex items-center gap-1 text-rose-500">
                    <Flame className="w-3.5 h-3.5" /> {ex.calories}
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Dumbbell className="w-3.5 h-3.5" /> {ex.sets}
                  </div>
                </div>
              </div>

              {/* Thao tác */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setSelectedExercise(ex)}
                  className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-all border border-gray-200"
                >
                  Hướng dẫn
                </button>
                <button
                  onClick={() => handleComplete(ex)}
                  disabled={isDone}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check className="w-4 h-4" /> Đã xong
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Tập ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. MODAL HƯỚNG DẪN CHI TIẾT BÀI TẬP */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {selectedExercise.categoryName}
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-1">{selectedExercise.title}</h3>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-around text-center">
                <div>
                  <p className="text-[10px] text-emerald-800 font-bold uppercase">Thời gian</p>
                  <p className="text-sm font-black text-emerald-950">{selectedExercise.duration}</p>
                </div>
                <div className="w-px h-8 bg-emerald-200" />
                <div>
                  <p className="text-[10px] text-emerald-800 font-bold uppercase">Tiêu hao</p>
                  <p className="text-sm font-black text-emerald-950">{selectedExercise.calories}</p>
                </div>
                <div className="w-px h-8 bg-emerald-200" />
                <div>
                  <p className="text-[10px] text-emerald-800 font-bold uppercase">Khối lượng</p>
                  <p className="text-sm font-black text-emerald-950">{selectedExercise.sets}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-gray-900 mb-2 uppercase tracking-wider">
                  Các bước thực hiện:
                </h4>
                <div className="space-y-2">
                  {selectedExercise.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedExercise(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 text-xs font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleComplete(selectedExercise)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Hoàn thành bài tập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}