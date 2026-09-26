import React, { useState } from 'react';
import { db } from '../db/db';
import { 
  ArrowRight, ArrowLeft, User, Activity, 
  ShieldAlert, Sparkles, Check 
} from 'lucide-react';

const INJURY_OPTIONS = [
  { id: 'knee_pain', name: 'Đau khớp gối' },
  { id: 'lower_back_pain', name: 'Đau thắt lưng' },
  { id: 'shoulder_pain', name: 'Đau khớp vai' },
  { id: 'wrist_pain', name: 'Đau cổ tay' },
  { id: 'ankle_sprain', name: 'Lật cổ chân' }
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '25',
    gender: 'male',
    weight: '65',
    height: '170',
    selectedInjuries: []
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInjury = (id) => {
    setFormData((prev) => {
      const exists = prev.selectedInjuries.includes(id);
      return {
        ...prev,
        selectedInjuries: exists
          ? prev.selectedInjuries.filter((i) => i !== id)
          : [...prev.selectedInjuries, id]
      };
    });
  };

  const handleNext = () => {
    if (step < 4) setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  // NÚT KẾT THÚC BƯỚC 4
  const handleFinish = async () => {
    try {
      // 1. Lưu thông tin Hồ sơ cá nhân
      await db.profile.put({
        id: 1,
        name: formData.name.trim() || 'Người dùng BeHealthy',
        age: Number(formData.age) || 25,
        gender: formData.gender,
        weight: Number(formData.weight) || 65,
        height: Number(formData.height) || 170,
        updated_at: new Date().toISOString()
      });

      // 2. Lưu thông tin chấn thương
      await db.profile_injuries.clear();
      if (formData.selectedInjuries.length > 0) {
        await db.profile_injuries.bulkAdd(
          formData.selectedInjuries.map((injId) => ({ injury_id: injId }))
        );
      }

      // 3. Ghi nhận trạng thái hoàn thành Onboarding
      await db.local_app_state.put({
        key: 'app_state',
        onboarding_completed: true
      });

      // 4. Kích hoạt chuyển trang sang Dashboard
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Lỗi khi hoàn thành Onboarding:', error);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 flex flex-col justify-between p-4 md:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 text-white font-black rounded-xl flex items-center justify-center text-xs">
              BH
            </div>
            <span className="font-extrabold text-lg text-gray-900 tracking-tight">BeHealthy</span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Bước {step} / 4
          </span>
        </div>

        {/* Thanh Tiến Độ */}
        <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Content */}
      <div className="max-w-lg mx-auto w-full my-auto py-6">
        <div className="bg-white border border-emerald-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-950/5 space-y-6">
          {/* BƯỚC 1: TÊN & GIỚI TÍNH */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <User className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-extrabold text-gray-900">Xin chào! Bạn tên là gì?</h2>
                <p className="text-xs text-gray-500">Giúp BeHealthy xưng hô với bạn thân mật hơn.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Họ và Tên</label>
                  <input
                    type="text"
                    placeholder="Nhập tên của bạn..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Giới tính</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['male', 'female'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleInputChange('gender', g)}
                        className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          formData.gender === g
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {g === 'male' ? 'Nam' : 'Nữ'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 2: CHỈ SỐ CƠ THỂ */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Activity className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-extrabold text-gray-900">Chỉ số thể trạng</h2>
                <p className="text-xs text-gray-500">Thông tin này dùng để tính toán cường độ tập tối ưu.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Tuổi</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Cân nặng (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Chiều cao (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 3: CHẤN THƯƠNG & VÙNG ĐAU */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-extrabold text-gray-900">Tình trạng cơ thể</h2>
                <p className="text-xs text-gray-500">Chọn vùng đang bị đau để ứng dụng loại trừ các bài tập nguy hiểm.</p>
              </div>

              <div className="space-y-2 pt-2">
                {INJURY_OPTIONS.map((item) => {
                  const isSelected = formData.selectedInjuries.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInjury(item.id)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-amber-900'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{item.name}</span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* BƯỚC 4: HOÀN THÀNH */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in text-center py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
                <User className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
                  Sẵn sàng trải nghiệm! <Sparkles className="w-6 h-6 text-amber-500" />
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                  BeHealthy đã ghi nhận đầy đủ chỉ số của bạn. Hãy bắt đầu hành trình nâng cao sức khỏe ngay hôm nay!
                </p>
              </div>
            </div>
          )}

          {/* Nút Điều Hướng bên dưới Card */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
              >
                Tiếp tục <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                Bắt đầu ngay <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-gray-400">
        BeHealthy Local-First Health & Fitness App
      </div>
    </div>
  );
}