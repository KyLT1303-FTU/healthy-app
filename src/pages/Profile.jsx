import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { User, Edit, RotateCcw, Check, ArrowRight, Trash2 } from 'lucide-react';

const INJURY_OPTIONS = [
  { id: 'knee_pain', name: 'Đau khớp gối' },
  { id: 'lower_back_pain', name: 'Đau thắt lưng' },
  { id: 'shoulder_pain', name: 'Đau khớp vai' },
  { id: 'wrist_pain', name: 'Đau cổ tay' },
  { id: 'ankle_sprain', name: 'Lật cổ chân' }
];

export default function Profile({ setCurrentPage }) {
  const profileData = useLiveQuery(() => db.profile.get(1), []);
  const userInjuries = useLiveQuery(() => db.profile_injuries.toArray(), []) || [];

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female',
    height: '',
    weight: '',
    target_weight: '',
    goal: 'CHƯA CHỌN',
    frequency: '3 buổi / tuần',
    selectedInjuries: []
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || 'Người dùng',
        gender: profileData.gender || 'female',
        height: profileData.height || '',
        weight: profileData.weight || '',
        target_weight: profileData.target_weight || '',
        goal: profileData.goal || 'CHƯA CHỌN',
        frequency: profileData.frequency || '3 buổi / tuần',
        selectedInjuries: userInjuries.map((i) => i.injury_id)
      });
    }
  }, [profileData, userInjuries]);

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await db.profile.put({
        id: 1,
        name: formData.name.trim() || 'Người dùng',
        gender: formData.gender,
        height: Number(formData.height) || 0,
        weight: Number(formData.weight) || 0,
        target_weight: Number(formData.target_weight) || 0,
        goal: formData.goal,
        frequency: formData.frequency,
        updated_at: new Date().toISOString()
      });

      await db.profile_injuries.clear();
      if (formData.selectedInjuries.length > 0) {
        await db.profile_injuries.bulkAdd(
          formData.selectedInjuries.map((injId) => ({ injury_id: injId }))
        );
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Lỗi lưu hồ sơ:', err);
    }
  };

  const handleResetProfile = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ và làm lại từ đầu?')) {
      await db.local_app_state.put({ key: 'app_state', onboarding_completed: false });
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-700 text-white rounded-full">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Hồ sơ của bạn</h1>
            <p className="text-xs text-gray-400">Quản lý thông tin cá nhân và theo dõi tình trạng sức khỏe của bạn.</p>
          </div>
        </div>
        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
          "Khỏe mạnh là hạnh phúc" ♡
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Main Box */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900">Thông tin cá nhân</h2>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 py-1 rounded-full text-xs font-semibold transition-all"
              >
                <Edit className="w-3.5 h-3.5" /> Chỉnh sửa
              </button>
            )}
          </div>

          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50/80 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 block font-medium">Giới tính</span>
                  <span className="text-sm font-bold text-gray-800">
                    {profileData?.gender === 'male' ? 'Nam' : 'Nữ'}
                  </span>
                </div>
                <div className="p-4 bg-gray-50/80 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 block font-medium">Chiều cao</span>
                  <span className="text-sm font-bold text-gray-800">
                    {profileData?.height ? `${profileData.height} cm` : '-- cm'}
                  </span>
                </div>
                <div className="p-4 bg-gray-50/80 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 block font-medium">Cân nặng hiện tại</span>
                  <span className="text-sm font-bold text-gray-800">
                    {profileData?.weight ? `${profileData.weight} kg` : '-- kg'}
                  </span>
                </div>
                <div className="p-4 bg-gray-50/80 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 block font-medium">Cân nặng mục tiêu</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {profileData?.target_weight ? `${profileData.target_weight} kg` : '-- kg'}
                  </span>
                </div>
                <div className="p-4 bg-gray-50/80 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 block font-medium">Mục tiêu tập luyện</span>
                  <span className="text-sm font-bold text-gray-800">{profileData?.goal || 'CHƯA CHỌN'}</span>
                </div>
                <div className="p-4 bg-gray-50/80 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 block font-medium">Tần suất tập luyện</span>
                  <span className="text-sm font-bold text-gray-800">{profileData?.frequency || '3 buổi / tuần'}</span>
                </div>
              </div>

              {/* Injury Badges */}
              <div className="p-4 bg-gray-50/80 rounded-xl space-y-2">
                <span className="text-xs text-gray-400 block font-medium">Chấn thương khai báo</span>
                <div className="flex flex-wrap gap-2">
                  {userInjuries.length > 0 ? (
                    userInjuries.map((item) => {
                      const name = INJURY_OPTIONS.find((o) => o.id === item.injury_id)?.name || item.injury_id;
                      return (
                        <span key={item.id} className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-lg">
                          {name}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-400">Không có chấn thương nào.</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <Edit className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
                </button>
                <button
                  onClick={handleResetProfile}
                  className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa hồ sơ và làm lại
                </button>
              </div>
            </div>
          ) : (
            /* EDIT FORM MODE */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Chiều cao (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Cân nặng hiện tại (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Cân nặng mục tiêu (kg)</label>
                  <input
                    type="number"
                    value={formData.target_weight}
                    onChange={(e) => handleInputChange('target_weight', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tần suất tập</label>
                  <input
                    type="text"
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Injury Toggle */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-gray-700 block">Cập nhật chấn thương</label>
                <div className="grid grid-cols-2 gap-2">
                  {INJURY_OPTIONS.map((item) => {
                    const isSelected = formData.selectedInjuries.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleInjury(item.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                          isSelected ? 'bg-amber-500/10 border-amber-500 text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        <span>{item.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Sidebar Avatar & Workout Button */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 font-extrabold text-2xl rounded-full flex items-center justify-center">
            {profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'N'}
          </div>

          <div>
            <h3 className="text-base font-extrabold text-gray-900">{profileData?.name || 'Người dùng'}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Thành viên BeHealthy</p>
          </div>

          <div className="p-4 bg-gray-50/80 rounded-2xl text-xs text-gray-500 italic text-center leading-relaxed">
            "Cùng nhau xây dựng thói quen lành mạnh và phiên bản tốt hơn mỗi ngày!"
          </div>

          <button
            onClick={() => setCurrentPage && setCurrentPage('workout')}
            className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            Bắt đầu tập luyện ngay <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}