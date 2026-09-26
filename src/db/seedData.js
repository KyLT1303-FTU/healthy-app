import { db } from './db';

export async function seedDatabase() {
  const injuryCount = await db.injuries.count();
  if (injuryCount === 0) {
    await db.injuries.bulkAdd([
      { id: 'knee_pain', name: 'Đau khớp gối' },
      { id: 'lower_back_pain', name: 'Đau thắt lưng' },
      { id: 'shoulder_pain', name: 'Đau khớp vai' },
      { id: 'wrist_pain', name: 'Đau cổ tay' },
      { id: 'ankle_sprain', name: 'Lật cổ chân' }
    ]);
  }

  const exerciseCount = await db.exercises.count();
  if (exerciseCount === 0) {
    await db.exercises.bulkAdd([
      {
        id: 'ex_1',
        name: 'Jumping Jacks (Nhảy dang tay chân)',
        target_muscle: 'Toàn thân / Cardio',
        duration_sec: 45,
        video_url: 'https://v.ftcdn.net/05/13/20/06/700_F_513200688_L1a73f62mZ0Wp45vK8xQGv2jZ8Lq3G8n_ST.mp4', // Đường dẫn MP4 mẫu
        description: 'Nhảy mở rộng tay chân kết hợp nhịp thở đều đặn để kích hoạt toàn bộ cơ thể.',
        contraindicated_injuries: ['knee_pain', 'ankle_sprain']
      },
      {
        id: 'ex_2',
        name: 'Bodyweight Squat (Gập gối đứng lên)',
        target_muscle: 'Đùi & Mông',
        duration_sec: 40,
        video_url: 'https://v.ftcdn.net/04/95/32/12/700_F_495321262_pGZ7vE9G9r4f0l1vGk5N0M6R7O9P8Q8R_ST.mp4',
        description: 'Đứng rộng bằng vai, hạ hông sâu như ngồi ghế, giữ lưng thẳng.',
        contraindicated_injuries: ['knee_pain']
      },
      {
        id: 'ex_3',
        name: 'Push-ups (Chống đẩy)',
        target_muscle: 'Ngực & Tay sau',
        duration_sec: 30,
        video_url: 'https://v.ftcdn.net/05/22/10/88/700_F_522108845_tY9Yp0lX4P9r8L0M2N4b8O7P6R5S4T3U_ST.mp4',
        description: 'Thân người thẳng, hạ ngực gần sát sàn rồi đẩy người lên nhẹ nhàng.',
        contraindicated_injuries: ['shoulder_pain', 'wrist_pain']
      },
      {
        id: 'ex_4',
        name: 'Plank (Giữ cơ bụng)',
        target_muscle: 'Cơ lõi (Core)',
        duration_sec: 45,
        video_url: 'https://v.ftcdn.net/04/88/90/12/700_F_488901234_kL0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A_ST.mp4',
        description: 'Tựa trên cẳng tay và mũi chân, siết chặt cơ bụng, giữ cột sống thẳng tự nhiên.',
        contraindicated_injuries: ['lower_back_pain', 'shoulder_pain']
      }
    ]);
  }
}