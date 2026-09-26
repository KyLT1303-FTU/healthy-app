import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  User,
  ShieldAlert,
  Scale,
  Ruler,
  Target,
  Save,
  Check,
  Activity,
  Sparkles,
  HeartPulse,
  Info,
  Flame,
  Zap,
  CheckCircle2
} from 'lucide-react';

// Danh sách các vùng chấn thương hỗ trợ cảnh báo
const INJURY_OPTIONS = [
  { id: 'knee_pain', title: 'Đau khớp gối', desc: 'Hạn chế các bài Squat sâu, Lunges, Burpees' },
  { id: 'lower_back_pain', title: 'Đau lưng / Cột sống', desc: 'Hạn chế gập bụng mạnh, nhấc tạ nặng' },
  { id: 'shoulder_pain', title: 'Đau / Chấn thương vai', desc: 'Hạn chế hít đất nặng, nâng vai' },
  { id: 'wrist_pain', title: 'Đau cổ tay', desc: 'Hạn chế chống tay trực tiếp xuống sàn' },
  { id: 'ankle_sprain', title: 'Trật / Đau cổ chân', desc: 'Hạn chế các bài tập nhảy, Cardio tác động cao' }
];

export default function Profile({ setCurrentPage }) {
  // Lấy dữ liệu hồ sơ và chấn thương từ Dexie DB
  const profile = useLiveQuery(() => db.profile?.get(1), []);
  const userInjuries =
    useLiveQuery(() => (db.profile_injuries ? db.profile_injuries.toArray() : Promise.resolve([])), []) || [];

  const activeInjuryIds = userInjuries.map((i) => i.injury_id);

  // States lưu thông tin form
  const [formData, setFormData] = useState({
    name: 'Người dùng',
    age: 25,
    gender: 'nam',
    height: 170,
    weight: 65,
    targetWeight: 60,
    goal: 'Giảm mỡ & Săn chắc cơ',
    activityLevel: 'Vừa phải (3-4 buổi/tuần)'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Đồng bộ dữ liệu từ Dexie DB vào State khi dữ liệu tải xong
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || 'Người dùng',
        age: profile.age || 25,
        gender: profile.gender || 'nam',
        height: profile.height || 170,
        weight: profile.weight || 65,
        targetWeight: profile.targetWeight || 60,
        goal: profile.goal || 'Giảm mỡ & Săn chắc cơ',
        activityLevel: profile.activityLevel || 'Vừa phải (3-4 buổi/tuần)'
      });
    }
  }, [profile]);

  // Tính BMI chuẩn Châu Á (Asian BMI)
  const calculateBMI = () => {
    const hInMeters = formData.height / 100;
    if (!hInMeters || hInMeters === 0) return 0;
    const bmi = formData.weight / (hInMeters * hInMeters);
    return bmi.toFixed(1);
  };

  const bmiValue = parseFloat(calculateBMI());

  // Phân loại BMI chuẩn Châu Á
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Thiếu cân', color: 'text-blue-500 bg-blue-50 border-blue-200' };
    if (bmi <= 22.9) return { label: 'Cân đối (Lý tưởng)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (bmi <= 24.9) return { label: 'Thừa cân nhẹ', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Béo phì', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  const bmiCategory = getBMICategory(bmiValue);

  // Xử lý Thay đổi ô nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' || name === 'targetWeight' ? Number(value) : value
    }));
  };

  // Lưu hồ sơ vào Dexie DB
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      if (db.profile) {
        await db.profile.put({
          id: 1,
          ...formData,
          bmi: bmiValue,
          updated_at: new Date().toISOString()
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Lỗi khi lưu hồ sơ:', err);
    }
  };

  // Logic Bật/Tắt Chấn thương trong Dexie DB
  const toggleInjury = async (injury) => {
    try {
      if (!db.profile_injuries) return;
      const existing = await db.profile_injuries.where('injury_id').equals(injury.id).first();

      if (existing) {
        await db.profile_injuries.delete(existing.id);
      } else {
        await db.profile_injuries.add({
          injury_id: injury.id,
          title: injury.title,
          created_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật chấn thương:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans pb-12">
      {/* 1. HERO BANNER THÔNG TIN TỔNG QUAN */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-emerald-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20 border-2 border-white/20">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" /> Hồ sơ hội viên
              </div>
              <h1 className="text-2xl md:text-3xl font-black">{formData.name}</h1>
              <p className="text-xs text-emerald-100/80">
                {formData.gender === 'nam' ? 'Nam' : 'Nữ'} • {formData.age} tuổi • Mục tiêu: <strong className="text-emerald-300">{formData.goal}</strong>
              </p>
            </div>
          </div>

          {/* Thẻ BMI Quick View */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 self-start md:self-center">
            <div className="p-3 bg-emerald-400 text-emerald-950 rounded-xl font-bold">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-emerald-200 font-medium">Chỉ số BMI</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{bmiValue || '--'}</span>
                <span className="text-xs font-bold text-emerald-300">({bmiCategory.label})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 2. KHU VỰC THÔNG TIN CHỈ SỐ CƠ THỂ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CỘT LEFT: CHỈ SỐ THỂ TRẠNG */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Chỉ số thể trạng</h2>
                <p className="text-[11px] text-gray-400">Cập nhật để hệ thống tính toán lượng calo chính xác</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-gray-700">Họ và Tên</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tuổi</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Giới tính</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                >
                  <option value="nam">Nam</option>
                  <option value="nu">Nữ</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Chiều cao (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Cân nặng hiện tại (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* CỘT RIGHT: MỤC TIÊU TẬP LUYỆN */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Mục tiêu & Vận động</h2>
                  <p className="text-[11px] text-gray-400">Định hướng giáo án tập luyện của bạn</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Cân nặng mục tiêu (kg)</label>
                  <input
                    type="number"
                    name="targetWeight"
                    value={formData.targetWeight}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Mục tiêu chính</label>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  >
                    <option value="Giảm mỡ & Săn chắc cơ">Giảm mỡ & Săn chắc cơ</option>
                    <option value="Tăng cơ bắp">Tăng cơ bắp (Hypertrophy)</option>
                    <option value="Tăng sức bền & Cardio">Tăng sức bền & Cardio</option>
                    <option value="Duy trì vóc dáng">Duy trì vóc dáng khỏe mạnh</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Mức độ vận động hàng ngày</label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  >
                    <option value="Ít vận động (Dân văn phòng)">Ít vận động (Dân văn phòng)</option>
                    <option value="Vừa phải (3-4 buổi/tuần)">Vừa phải (3-4 buổi/tuần)</option>
                    <option value="Năng động (5-6 buổi/tuần)">Năng động (5-6 buổi/tuần)</option>
                    <option value="Vận động viên / Cường độ cao">Vận động viên / Cường độ cao</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Thước đo BMI visual */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase">Trạng thái BMI</span>
                <p className="text-xs font-bold text-gray-900">{bmiCategory.label}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${bmiCategory.color}`}>
                {bmiValue} BMI
              </span>
            </div>
          </div>
        </div>

        {/* 3. KHU VỰC KHAI BÁO CHẤN THƯƠNG (INJURY SAFETY CENTER) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                  Khai báo vị trí chấn thương / Đau mỏi
                </h2>
                <p className="text-[11px] text-gray-400">
                  Hệ thống sẽ tự động dán nhãn cảnh báo đỏ ở các bài tập gây áp lực lên vùng đau này.
                </p>
              </div>
            </div>

            {activeInjuryIds.length > 0 && (
              <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Đang bật {activeInjuryIds.length} cảnh báo
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INJURY_OPTIONS.map((injury) => {
              const isActive = activeInjuryIds.includes(injury.id);

              return (
                <button
                  type="button"
                  key={injury.id}
                  onClick={() => toggleInjury(injury)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 ${
                    isActive
                      ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                      : 'bg-gray-50/60 border-gray-100 hover:bg-gray-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black ${isActive ? 'text-amber-950' : 'text-gray-800'}`}>
                      {injury.title}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        isActive ? 'bg-amber-500 text-white' : 'border border-gray-300 bg-white'
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{injury.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. ACTION BAR (NÚT LƯU HỒ SƠ) */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã lưu thông tin hồ sơ thành công!
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 ml-auto"
          >
            <Save className="w-4 h-4" /> Lưu thông tin hồ sơ
          </button>
        </div>
      </form>
    </div>
  );
}