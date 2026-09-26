import Dexie from 'dexie';

export const db = new Dexie('FitnessAppDB');

// Khai báo đầy đủ các bảng bao gồm cả local_app_state
db.version(12).stores({
  exercises: 'id, name, target_muscle',
  injuries: 'id, name',
  profile_injuries: '++id, injury_id',
  workout_history: '++id, completed_date',
  schedule_events: '++id, day_index, type, time_slot',
  local_app_state: 'key', // <--- Bảng lưu trạng thái ứng dụng (Onboarding)
  profile: '++id'
});

export default db;