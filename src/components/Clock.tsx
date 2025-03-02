'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [timeInput, setTimeInput] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#f5f7fa');
  const lastColorChangeTimeRef = useRef<Date | null>(null);
  const minuteMarksRef = useRef<number[]>([]);
  const secondHandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    setTime(now);
    lastColorChangeTimeRef.current = new Date(now);
    minuteMarksRef.current = Array.from({ length: 60 }, (_, i) => i);
  }, []);

  const getRandomColor = () => {
    const colors = [
      '#f5e6ff', '#e6f5ff', '#e6fff5', '#f5ffe6',
      '#ffe6f5', '#f0f7ff', '#fff0f7', '#f7fff0'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    if (!time) return;
    const intervalId = setInterval(() => {
      if (!isCustomTime) {
        setTime(new Date());
      } else {
        setTime(prevTime => {
          if (!prevTime) return new Date();
          const newTime = new Date(prevTime);
          newTime.setSeconds(newTime.getSeconds() + 1);
          return newTime;
        });
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isCustomTime, time]);

  useEffect(() => {
    if (!time) return;
    if (time.getSeconds() === 0 && secondHandRef.current) {
      secondHandRef.current.style.transition = 'none';
      setTimeout(() => {
        if (secondHandRef.current) {
          secondHandRef.current.style.transition = 'transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 0.44)';
        }
      }, 50);
    }
  }, [time]);

  useEffect(() => {
    if (!time || !lastColorChangeTimeRef.current) return;
    const timeDiff = time.getTime() - lastColorChangeTimeRef.current.getTime();
    if (timeDiff >= 60000) {
      setBackgroundColor(getRandomColor());
      lastColorChangeTimeRef.current = new Date(time.getTime());
    }
  }, [time]);

  function handleTimeInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTimeInput(event.target.value);
  }

  function handleTimeButtonClick() {
    if (timeInput) {
      try {
        const [hours, minutes] = timeInput.split(':').map(part => parseInt(part, 10));
        if (isNaN(hours) || isNaN(minutes)) return;
        const newTime = new Date();
        newTime.setHours(hours);
        newTime.setMinutes(minutes);
        newTime.setSeconds(0);
        setTime(newTime);
        lastColorChangeTimeRef.current = new Date(newTime);
        setIsCustomTime(true);
      } catch (error) {}
    }
  }

  function resetToCurrentTime() {
    const now = new Date();
    setTime(now);
    lastColorChangeTimeRef.current = new Date(now);
    setIsCustomTime(false);
    setTimeInput('');
  }

  let hourDeg = 0, minuteDeg = 0, secondDeg = 0;
  if (time) {
    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const milliseconds = time.getMilliseconds();
    hourDeg = (hours * 30) + (minutes * 0.5) + (seconds * (0.5/60));
    minuteDeg = (minutes * 6) + (seconds * 0.1);
    secondDeg = (seconds * 6) + (milliseconds * 0.006);
  }

  if (!time) {
    return <div className="text-center">Loading clock...</div>;
  }

  return (
    <div className="flex flex-col items-center py-12 space-y-12">
      {/* Time control panel */}
      <div className="mt-4" style={{ marginBottom: '25px' }}>
        <div className="glass rounded-xl px-6 py-4 flex justify-center items-center gap-3 shadow-lg backdrop-blur-md bg-white/30 border border-white/40">
          <input
            type="time"
            value={timeInput}
            onChange={handleTimeInputChange}
            className="w-32 px-3 py-2 bg-transparent border border-gray-300/30 rounded-lg text-gray-700 dark:text-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-transparent transition-all"
            aria-label="Select time"
          />
          <button
            className="px-4 py-2 bg-indigo-500/70 text-white text-sm hover:bg-indigo-600/70 transition-all shadow-md hover:shadow-lg"
            onClick={handleTimeButtonClick}
            style={{ borderRadius: 0 }} // 确保按钮为方形
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-all shadow-md hover:shadow-lg"
            onClick={resetToCurrentTime}
            style={{ borderRadius: 0 }} // 确保按钮为方形
          >
            Reset
          </button>
        </div>
      </div>

      {/* Clock */}
      <div className="mb-8 transform hover:scale-105 transition-transform duration-500 mt-10" style={{ marginBottom: '20px' }}>
        <div className="relative w-[300px] h-[300px] rounded-full border-8 border-gray-800/70 shadow-2xl" style={{ backgroundColor }}>
          {/* 小时数字 */}
          {[...Array(12)].map((_, index) => {
            const hour = index === 0 ? 12 : index;
            const angle = index * 30; // 每小时30度
            return (
              <div key={`hour-${hour}`}>
                <div
                  className="absolute text-gray-800 font-bold text-xl"
                  style={{
                    top: `${50 - 40 * Math.cos(angle * Math.PI / 180)}%`,
                    left: `${50 + 40 * Math.sin(angle * Math.PI / 180)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {hour}
                </div>
                <div
                  className="absolute w-1 h-3 bg-gray-800"
                  style={{
                    top: `${50 - 48 * Math.cos(angle * Math.PI / 180)}%`,
                    left: `${50 + 48 * Math.sin(angle * Math.PI / 180)}%`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                    width: '3px',
                    height: '10px', // 增加高度便于观察
                    backgroundColor: '#4b5563'
                  }}
                ></div>
              </div>
            );
          })}
          {/* 添加分钟小刻度 */}
          {[...Array(60)].map((_, index) => {
            if (index % 5 !== 0) {
              const angle = index * 6;
              return (
                <div
                  key={`minute-tick-${index}`}
                  className="absolute"
                  style={{
                    top: `${50 - 48 * Math.cos(angle * Math.PI / 180)}%`,
                    left: `${50 + 48 * Math.sin(angle * Math.PI / 180)}%`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                    width: '2px',
                    height: '8px', // 增加高度便于观察
                    backgroundColor: '#4b5563'
                  }}
                ></div>
              );
            }
            return null;
          })}
          <div className="hour-hand" style={{ transform: `rotate(${hourDeg}deg)` }}></div>
          <div className="minute-hand" style={{ transform: `rotate(${minuteDeg}deg)` }}></div>
          <div className="second-hand" style={{ transform: `rotate(${secondDeg}deg)` }}></div>
          <div className="center-dot"></div>
          {/* 时针、分针、秒针 */}
          <div
            className="absolute z-10 rounded-t-full rounded-b-full"
            style={{
              width: '6px',
              height: '70px',
              bottom: '50%',
              left: 'calc(50% - 3px)',
              transformOrigin: 'bottom center',
              transform: `rotate(${hourDeg}deg)`,
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#3b82f6'
            }}
          ></div>
          <div
            className="absolute z-10 rounded-t-full rounded-b-full"
            style={{
              width: '4px',
              height: '90px',
              bottom: '50%',
              left: 'calc(50% - 2px)',
              transformOrigin: 'bottom center',
              transform: `rotate(${minuteDeg}deg)`,
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#10b981'
            }}
          ></div>
          <div
            ref={secondHandRef}
            className="absolute z-10 rounded-t-full rounded-b-full"
            style={{
              width: '2px',
              height: '110px',
              bottom: '50%',
              left: 'calc(50% - 1px)',
              transformOrigin: 'bottom center',
              transform: `rotate(${secondDeg}deg)`,
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#ef4444'
            }}
          ></div>
          <div
            className="absolute rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#374151',
              border: '2px solid #f3f4f6'
            }}
          ></div>
        </div>
      </div>

      {/* 信息和数字时间显示区域 */}
      <div className="flex flex-col items-center space-y-6 mt-6">
        <div className="mb-4">
          <div className="glass rounded-full px-8 py-3 text-center shadow-lg text-indigo-500 dark:text-indigo-300 inline-block text-sm animate-pulse backdrop-blur-md bg-white/30 border border-white/40">
            ✨ Watch the magic in 60 seconds ✨
          </div>
        </div>
        <div className="glass rounded-xl px-8 py-4 text-center shadow-lg min-w-[240px] mt-4 backdrop-blur-md bg-white/30 border border-white/40">
          <div className="text-2xl font-mono font-semibold text-gray-700 dark:text-gray-200">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}