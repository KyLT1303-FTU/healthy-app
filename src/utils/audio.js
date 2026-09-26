// Khởi tạo AudioContext từ trình duyệt
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Hàm phát tiếng beep tần số tùy chỉnh
export const playBeep = (freq = 440, duration = 0.15, type = 'sine') => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime); // Âm lượng (15%)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
};

// 1. Tiếng Bíp ngắn khi đếm ngược 3, 2, 1
export const playCountdownBeep = () => {
  playBeep(587.33, 0.1); // Nốt D5
};

// 2. Tiếng Bíp cao báo hết giờ nghỉ / Bắt đầu hiệp mới
export const playStartBeep = () => {
  playBeep(880, 0.3); // Nốt A5
};

// 3. Âm thanh chúc mừng hoàn thành Hiệp / Bài tập
export const playSuccessSound = () => {
  playBeep(523.25, 0.1); // C5
  setTimeout(() => playBeep(659.25, 0.1), 100); // E5
  setTimeout(() => playBeep(783.99, 0.25), 200); // G5
};