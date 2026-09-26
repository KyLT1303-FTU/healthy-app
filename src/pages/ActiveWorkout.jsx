import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { seedDatabase } from '../db/seedData';
import { playCountdownBeep, playStartBeep, playSuccessSound } from '../utils/audio';
import { 
  Play, Pause, SkipForward, CheckCircle2, ShieldAlert, 
  Clock, ArrowLeft, Trophy, RefreshCw, Video
} from 'lucide-react';

export default function ActiveWorkout({ workoutTitle = 'Buổi tập toàn thân', onFinish, onCancel }) {
  const exercises = useLiveQuery(() => db.exercises.toArray());
  const profileInjuries = useLiveQuery(() => db.profile_injuries.toArray()) || [];
  const userInjuryIds = profileInjuries.map((pi) => pi.injury_id);

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const totalSetsPerEx = 3;

  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(30);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval = null;
    if (!isPaused && !isCompleted && exercises && exercises.length > 0) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isCompleted, exercises]);

  useEffect(() => {
    let restInterval = null;
    if (isResting && restTime > 0) {
      if (restTime <= 3) playCountdownBeep();
      restInterval = setInterval(() => {
        setRestTime((prev) => prev - 1);
      }, 1000);
    } else if (isResting && restTime === 0) {
      playStartBeep();
      handleNextStep();
    }
    return () => clearInterval(restInterval);
  }, [isResting, restTime]);

  const handleReloadData = async () => {
    await seedDatabase();
  };

  if (exercises === undefined) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <p className="text-sm font-medium animate-pulse text-gray-400">Đang tải bài tập...</p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-sm text-gray-400">Chưa tìm thấy bài tập trong cơ sở dữ liệu local.</p>
        <button
          onClick={handleReloadData}
          className="flex items-center gap-2 px-5 py-2.5 bg-healthy-600 text-white text-xs font-bold rounded-xl hover:bg-healthy-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Khôi phục bài tập mẫu
        </button>
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-300">Quay lại</button>
      </div>
    );
  }

  if (isCompleted) {
    const formatTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 text-white shadow-2xl">
          <div className="w-20 h-20 bg-healthy-500/20 text-healthy-400 rounded-full flex items-center justify-center mx-auto border border-healthy-500/30">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold">Hoàn thành buổi tập! 🎉</h2>
            <p className="text-xs text-gray-400 mt-1">Kết quả đã được ghi nhận vào nhật ký tiến độ.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-800/50 p-4 rounded-2xl text-left border border-gray-700/50">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Thời gian</span>
              <p className="text-lg font-bold text-white">{formatTime(sessionTime)}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Bài hoàn thành</span>
              <p className="text-lg font-bold text-healthy-400">{exercises.length} bài</p>
            </div>
          </div>

          <button
            onClick={onFinish}
            className="w-full py-3.5 bg-healthy-500 hover:bg-healthy-600 text-gray-950 font-bold rounded-2xl shadow-lg transition-all text-sm"
          >
            Quay về Phòng tập
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExIndex];
  const isContraindicated = currentExercise?.contraindicated_injuries?.some((id) => userInjuryIds.includes(id));

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    playSuccessSound(); 
    setIsResting(true);
    setRestTime(30);
  };

  const handleNextStep = () => {
    setIsResting(false);
    if (currentSet < totalSetsPerEx) {
      setCurrentSet((prev) => prev + 1);
    } else {
      if (currentExIndex < exercises.length - 1) {
        setCurrentExIndex((prev) => prev + 1);
        setCurrentSet(1);
      } else {
        handleFinishSession();
      }
    }
  };

  const handleFinishSession = async () => {
    playSuccessSound();
    setIsCompleted(true);
    await db.workout_history.add({
      workout_title: workoutTitle,
      completed_date: new Date().toISOString().split('T')[0],
      duration_min: Math.max(1, Math.round(sessionTime / 60)),
      total_exercises: exercises.length,
      completed_exercises: exercises.length,
    });
  };

  const totalSteps = exercises.length * totalSetsPerEx;
  const currentStep = currentExIndex * totalSetsPerEx + currentSet;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between p-4 md:p-6">
      {/* Top Bar */}
      <div className="space-y-4 max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <button onClick={onCancel} className="flex items-center gap-1 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" /> Thoát
          </button>
          <div className="flex items-center gap-2 font-mono text-sm bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4 text-healthy-400" />
            {formatTime(sessionTime)}
          </div>
        </div>

        <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
          <div 
            className="bg-healthy-500 h-full transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Màn hình nghỉ */}
      {isResting ? (
        <div className="max-w-md mx-auto w-full text-center space-y-6 py-12">
          <span className="text-xs font-bold text-healthy-400 uppercase tracking-widest">Thời gian nghỉ</span>
          
          <div className="w-40 h-40 rounded-full border-4 border-healthy-500/30 border-t-healthy-500 flex items-center justify-center mx-auto">
            <span className="font-mono text-5xl font-bold text-white">{restTime}s</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-gray-400">Tiếp theo:</p>
            <p className="font-bold text-sm text-gray-200">
              {currentExercise.name} (Hiệp {currentSet < totalSetsPerEx ? currentSet + 1 : 1})
            </p>
          </div>

          <button
            onClick={() => handleNextStep()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white text-xs font-semibold rounded-2xl mx-auto transition-all"
          >
            <SkipForward className="w-4 h-4" /> Bỏ qua nghỉ
          </button>
        </div>
      ) : (
        /* Màn hình tập chính + Video hướng dẫn */
        <div className="max-w-xl mx-auto w-full space-y-4 my-auto py-4">
          {isContraindicated && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-2xl flex items-center gap-3 text-red-300 text-xs">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
              <span>
                <strong>Cảnh báo chấn thương:</strong> Bài tập này không khuyến nghị với tình trạng cơ thể hiện tại.
              </span>
            </div>
          )}

          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 space-y-5 text-center shadow-2xl backdrop-blur overflow-hidden">
            {/* KHỐI HIỂN THỊ VIDEO HƯỚNG DẪN THỜI GIAN THỰC */}
            {currentExercise.video_url ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-gray-800 shadow-inner">
                <video
                  key={currentExercise.id} // Re-render mượt khi chuyển bài
                  src={currentExercise.video_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-2xl bg-gray-950 border border-gray-800 flex flex-col items-center justify-center text-gray-600 gap-2">
                <Video className="w-8 h-8" />
                <span className="text-xs">Chưa có video hướng dẫn</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-3">
              <span>Bài {currentExIndex + 1} / {exercises.length}</span>
              <span className="bg-healthy-500/20 text-healthy-400 font-semibold px-3 py-1 rounded-full border border-healthy-500/30">
                🎯 {currentExercise.target_muscle || 'Toàn thân'}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-white">{currentExercise.name}</h1>
              <p className="text-xs text-gray-400 leading-relaxed max-w-lg mx-auto">
                {currentExercise.description}
              </p>
            </div>

            <div className="py-4 bg-gray-950/60 rounded-2xl flex items-center justify-around border border-gray-800">
              <div>
                <span className="text-[10px] uppercase text-gray-500 font-semibold block">Hiệp</span>
                <span className="text-xl font-black text-healthy-400">Hiệp {currentSet} / {totalSetsPerEx}</span>
              </div>
              <div className="w-px h-8 bg-gray-800" />
              <div>
                <span className="text-[10px] uppercase text-gray-500 font-semibold block">Khối lượng</span>
                <span className="text-xl font-black text-white">
                  {currentExercise.duration_sec ? `${currentExercise.duration_sec} Giây` : '12 Lần'}
                </span>
              </div>
            </div>

            <button
              onClick={handleCompleteSet}
              className="w-full py-3.5 bg-healthy-500 hover:bg-healthy-600 text-gray-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> HOÀN THÀNH HIỆP {currentSet}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between text-xs text-gray-400 pt-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl hover:text-white"
        >
          {isPaused ? <Play className="w-4 h-4 text-healthy-400" /> : <Pause className="w-4 h-4" />}
          {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
        </button>

        <button
          onClick={() => {
            if (currentExIndex < exercises.length - 1) {
              setCurrentExIndex((prev) => prev + 1);
              setCurrentSet(1);
            } else {
              handleFinishSession();
            }
          }}
          className="flex items-center gap-1.5 hover:text-white transition-all"
        >
          Bỏ qua bài này <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}