import Head from 'next/head';
import Script from 'next/script';
import { useState, useEffect, useRef } from 'react';

// Constants
const clockColors = [
  { light: 'rgba(255, 245, 245, 0.9)', dark: 'rgba(40, 40, 40, 0.9)' },
  { light: 'rgba(255, 248, 245, 0.9)', dark: 'rgba(42, 38, 36, 0.9)' },
  { light: 'rgba(255, 255, 240, 0.9)', dark: 'rgba(42, 42, 35, 0.9)' },
  { light: 'rgba(245, 255, 245, 0.9)', dark: 'rgba(36, 42, 36, 0.9)' },
  { light: 'rgba(240, 248, 255, 0.9)', dark: 'rgba(35, 38, 42, 0.9)' },
  { light: 'rgba(248, 240, 255, 0.9)', dark: 'rgba(38, 35, 42, 0.9)' },
  { light: 'rgba(255, 240, 250, 0.9)', dark: 'rgba(42, 35, 40, 0.9)' },
];

const confettiColors = [
  '#007AFF', '#FF3B30', '#34C759', '#FF9500', '#5856D6', '#5AC8FA', '#FFCC00',
];

// Confetti Class
class Confetti {
  constructor(container) {
    this.container = container;
    this.confettiElements = [];
    this.confettiCount = 150;
    this.shapes = ['circle', 'square', 'triangle'];
  }

  create() {
    this.container.innerHTML = '';
    this.confettiElements = [];
    for (let i = 0; i < this.confettiCount; i++) {
      this.createPiece();
    }
    setTimeout(() => {
      this.container.innerHTML = '';
      this.confettiElements = [];
    }, 5000);
  }

  createPiece() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    const size = Math.random() * 10 + 5;
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const posX = Math.random() * window.innerWidth;
    const delay = Math.random() * 2;
    const duration = Math.random() * 3 + 3;
    const sway = Math.random() > 0.5 ? 'sway-left' : 'sway-right';
    const swayDuration = (Math.random() * 3 + 3).toFixed(2);
    const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];

    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = color;
    confetti.style.left = `${posX}px`;
    confetti.style.top = '-20px';
    confetti.style.opacity = '0.9';
    confetti.style.borderRadius = shape === 'circle' ? '50%' : shape === 'square' ? '0' : '0';
    confetti.style.animation = `fall ${duration}s ease-in forwards, ${sway} ${swayDuration}s ease-in-out infinite`;
    confetti.style.animationDelay = `${delay}s`;

    if (shape === 'triangle') {
      confetti.style.width = '0';
      confetti.style.height = '0';
      confetti.style.backgroundColor = 'transparent';
      confetti.style.borderLeft = `${size / 2}px solid transparent`;
      confetti.style.borderRight = `${size / 2}px solid transparent`;
      confetti.style.borderBottom = `${size}px solid ${color}`;
    }

    this.container.appendChild(confetti);
    this.confettiElements.push(confetti);
  }
}

// Custom Hook for Clock Logic
function useClock() {
  const [customTime, setCustomTime] = useState(null);
  const [customOffset, setCustomOffset] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(60);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [highlightClock, setHighlightClock] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(customTime ? new Date(customTime + customOffset) : new Date());
  }, [customTime, customOffset]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDarkMode(mediaQuery.matches);
      const handleThemeChange = (event) => setIsDarkMode(event.matches);
      mediaQuery.addEventListener("change", handleThemeChange);
      return () => mediaQuery.removeEventListener("change", handleThemeChange);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (customTime) {
        setCustomOffset((prev) => prev + 1000);
      }
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          setCurrentColorIndex((prevIndex) => (prevIndex + 1) % clockColors.length);
          setHighlightClock(true);
          setTriggerConfetti(true);
          setTimeout(() => {
            setHighlightClock(false);
            setTriggerConfetti(false);
          }, 800);
          return 60;
        }
        return prev - 1;
      });
      setNow(customTime ? new Date(customTime + customOffset) : new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [customTime]);

  const setCustomTimeFromInput = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const newCustomTime = new Date();
    newCustomTime.setHours(hours, minutes, 0, 0);
    setCustomTime(newCustomTime.getTime());
    setCustomOffset(0);
    setCountdownSeconds(60);
  };

  const resetClock = () => {
    setCustomTime(null);
    setCustomOffset(0);
    setCountdownSeconds(60);
  };

  return {
    now,
    countdownSeconds,
    currentColorIndex,
    highlightClock,
    triggerConfetti,
    isDarkMode,
    setCustomTimeFromInput,
    resetClock,
  };
}

// ClockControls Component
function ClockControls({ setCustomTime, resetClock }) {
  const timeInputRef = useRef(null);

  useEffect(() => {
    if (timeInputRef.current) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      timeInputRef.current.value = `${hours}:${minutes}`;
    }
  }, []);

  const handleSet = () => {
    if (timeInputRef.current && timeInputRef.current.value) {
      setCustomTime(timeInputRef.current.value);
    }
  };

  const handleReset = () => {
    resetClock();
    if (timeInputRef.current) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      timeInputRef.current.value = `${hours}:${minutes}`;
    }
  };

  return (
    <div className="w-full flex items-center justify-between mb-8 gap-3">
      <div className="flex-grow bg-white dark:bg-gray-800 rounded-full shadow-md p-2 pl-4 flex items-center">
        <input
          type="time"
          ref={timeInputRef}
          className="time-input w-full py-2 bg-transparent border-none text-apple-dark dark:text-white text-xl font-light"
        />
      </div>
      <button
        onClick={handleSet}
        className="px-5 py-2.5 rounded-full bg-apple-primary text-white flex items-center justify-center font-medium shadow-md hover:shadow-lg transition-all duration-300 btn-hover"
      >
        <i className="fa-solid fa-check mr-2"></i>Set
      </button>
      <button
        onClick={handleReset}
        className="px-5 py-2.5 rounded-full bg-gray-200 dark:bg-gray-700 text-apple-dark dark:text-white flex items-center justify-center font-medium shadow-md hover:shadow-lg transition-all duration-300 btn-hover"
      >
        <i className="fa-solid fa-arrow-rotate-right mr-2"></i>Reset
      </button>
    </div>
  );
}

// ClockDisplay Component
function ClockDisplay({ now, countdownSeconds, currentColorIndex, highlightClock, isDarkMode }) {
  // 检查 now 是否为 null
  if (!now) {
    return <div className="w-[300px] h-[300px] flex items-center justify-center">加载中...</div>;
  }
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const hourDegrees = hours * 30 + minutes * 0.5;
  const minuteDegrees = minutes * 6 + seconds * 0.1;
  const secondDegrees = seconds * 6;

  // Use the passed isDarkMode prop instead of internal state
  const clockColor = isDarkMode 
    ? clockColors[currentColorIndex].dark 
    : clockColors[currentColorIndex].light;

   // 计算倒计时圆环的偏移量
   const circumference = 2 * Math.PI * 155; // 圆的周长 = 2πr
   // 修改计算方式，确保当倒计时为0时，圆环完全闭合
   const dashOffset = circumference * (1 - countdownSeconds / 60);

  const hourNumbers = Array.from({ length: 12 }, (_, i) => {
    const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
    const radius = 120;
    const x = 150 + radius * Math.cos(angle);
    const y = 150 + radius * Math.sin(angle);
    return (
      <div
        key={i}
        className="absolute text-[20px] font-light text-[var(--marker-light)] dark:text-[var(--marker-dark)] transition-colors duration-300"
        style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
      >
        {i + 1}
      </div>
    );
  });

  const minuteMarkers = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null;
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const outerPoint = { x: 150 + 145 * Math.cos(angle), y: 150 + 145 * Math.sin(angle) };
    const innerPoint = { x: 150 + 140 * Math.cos(angle), y: 150 + 140 * Math.sin(angle) };
    const markAngle = Math.atan2(outerPoint.y - innerPoint.y, outerPoint.x - innerPoint.x) * (180 / Math.PI);
    return (
      <div
        key={i}
        className="absolute w-[5px] h-[1px] bg-[var(--marker-light)] dark:bg-[var(--marker-dark)] opacity-50 transition-colors duration-300"
        style={{
          left: `${innerPoint.x}px`,
          top: `${innerPoint.y}px`,
          transformOrigin: '0% 50%',
          transform: `rotate(${markAngle}deg)`,
        }}
      />
    );
  });

  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const outerPoint = { x: 150 + 145 * Math.cos(angle), y: 150 + 145 * Math.sin(angle) };
    const innerPoint = { x: 150 + 135 * Math.cos(angle), y: 150 + 135 * Math.sin(angle) };
    const markAngle = Math.atan2(outerPoint.y - innerPoint.y, outerPoint.x - innerPoint.x) * (180 / Math.PI);
    return (
      <div
        key={i}
        className="absolute w-[10px] h-[2px] bg-[var(--marker-light)] dark:bg-[var(--marker-dark)] transition-colors duration-300"
        style={{
          left: `${innerPoint.x}px`,
          top: `${innerPoint.y}px`,
          transformOrigin: '0% 50%',
          transform: `rotate(${markAngle}deg)`,
        }}
      />
    );
  });

  return (
    <div className="relative mb-8">
      {/* Countdown circle */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" width="320" height="320" viewBox="0 0 320 320">
        <circle 
          cx="160" 
          cy="160" 
          r="155" 
          fill="none" 
          stroke="rgba(200, 220, 255, 0.2)" 
          strokeWidth="2"
        />
        <circle 
          id="countdownCircle" 
          cx="160" 
          cy="160" 
          r="155" 
          fill="none" 
          stroke="rgba(0, 122, 255, 0.3)" 
          strokeWidth="2" 
          strokeDasharray={circumference} 
          strokeDashoffset={dashOffset}
          className="countdown-circle"
        />
      </svg>
      {/* Clock display */}
      <div
        className={`clock color-transition relative w-[300px] h-[300px] rounded-full flex items-center justify-center ${highlightClock ? 'highlight' : ''}`}
        style={{ backgroundColor: clockColor }}
      >
        <div className="w-full h-full rounded-full relative overflow-hidden">
          {hourNumbers}
          {minuteMarkers}
          {hourMarkers}
        </div>
        <div className="hand hour-hand shadow-md" style={{ transform: `rotate(${hourDegrees}deg)` }}></div>
        <div className="hand minute-hand shadow-md" style={{ transform: `rotate(${minuteDegrees}deg)` }}></div>
        <div className="hand second-hand" style={{ transform: `rotate(${secondDegrees}deg)` }}></div>
        <div className="absolute w-4 h-4 bg-apple-primary rounded-full z-10 shadow-md"></div>
      </div>
    </div>
  );
}

// DigitalTimeCard Component
function DigitalTimeCard({ now, countdownSeconds }) {
  const timeString = now ? now.toLocaleTimeString("en-US", { hour12: true }) : "--:--:--";
  const dateString = now
    ? now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Loading...";
  const magicMessage = `Watch the magic in ${countdownSeconds} seconds`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md w-full">
      <div className="flex flex-col items-center">
        <div
          className={`mb-2 text-apple-primary font-medium flex items-center ${
            countdownSeconds <= 10 ? "animate-pulse-text" : ""
          }`}
        >
          <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
          <span className="text-sm">{magicMessage}</span>
        </div>
        <div className="w-full py-2 flex justify-center" suppressHydrationWarning>
          <h2 className="text-3xl font-light text-apple-dark dark:text-white tracking-tight">
            {timeString}
          </h2>
        </div>
        <div className="text-apple-gray text-sm flex items-center" suppressHydrationWarning>
          <i className="fa-regular fa-calendar mr-2"></i>
          <span>{dateString}</span>
        </div>
      </div>
    </div>
  );
}

// Main Home Component
export default function Home() {
  const clockData = useClock();
  const confettiRef = useRef(null);

  // We've moved the theme detection logic into the useClock hook
  useEffect(() => {
    if (clockData.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [clockData.isDarkMode]);

  useEffect(() => {
    if (clockData.triggerConfetti && confettiRef.current) {
      const confetti = new Confetti(confettiRef.current);
      confetti.create();
    }
  }, [clockData.triggerConfetti]);

  return (
    <>
      <Head>
        <title>New Clock</title>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    apple: {
                      primary: '#007AFF',
                      secondary: '#5856D6',
                      success: '#34C759',
                      danger: '#FF3B30',
                      warning: '#FF9500',
                      info: '#5AC8FA',
                      light: '#F5F5F7',
                      dark: '#1D1D1F',
                      gray: '#86868B'
                    }
                  },
                  boxShadow: {
                    'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
                    'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }
                }
              }
            };
          `
        }} />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

          :root {
            --clock-face-light: rgba(255, 245, 245, 0.9);
            --clock-face-dark: rgba(40, 40, 40, 0.9);
            --hour-hand: #1D1D1F;
            --minute-hand:rgb(42, 110, 95);
            --second-hand: #FF3B30;
            --hour-hand-dark: #F5F5F7;
            --minute-hand-dark: #F5F5F7;
            --marker-light: #1D1D1F;
            --marker-dark: #F5F5F7;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            transition: background-color 0.3s ease;
          }

          .clock {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: all 0.5s ease;
          }

          .dark .clock {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }

          .hand {
            position: absolute;
            transform-origin: 50% 100%;
            border-radius: 50% 50% 5px 5px;
            transition: background-color 0.3s ease;
          }

          .hour-hand {
            background-color: var(--hour-hand);
            width: 6px;
            height: 65px;
            left: calc(50% - 3px);
            top: calc(50% - 65px);
            z-index: 2;
          }

          .minute-hand {
            background-color: var(--minute-hand);
            width: 4px;
            height: 90px;
            left: calc(50% - 2px);
            top: calc(50% - 90px);
            z-index: 3;
          }

          .second-hand {
            background-color: var(--second-hand);
            width: 2px;
            height: 110px;
            left: calc(50% - 1px);
            top: calc(50% - 110px);
            z-index: 4;
          }

          .dark .hour-hand, .dark .minute-hand {
            background-color: var(--hour-hand-dark);
          }

          .countdown-circle {
            stroke-linecap: round; /* 圆形线帽，使进度条更平滑 */
            transform: rotate(-90deg); /* 将起点调整到 12 点钟方向 */
            transform-origin: center; /* 旋转中心为 SVG 中心 */
            transition: stroke-dashoffset 1s linear; /* 添加平滑过渡效果 */
          }

          .time-input:focus {
            outline: none;
            border-color: #007AFF;
          }

          .btn-hover:hover {
            transform: scale(1.03);
          }

          .btn-hover:active {
            transform: scale(0.98);
          }

          @keyframes pulse-light {
            0%, 100% { color: #007AFF; }
            50% { color: #5856D6; }
          }

          .animate-pulse-text {
            animation: pulse-light 2s infinite;
          }

          .color-transition {
            transition: background-color 0.8s ease;
          }

          @keyframes highlight-pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(0, 122, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0); }
          }

          .highlight {
            animation: highlight-pulse 0.8s ease-out;
          }

          .confetti-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
          }

          .confetti {
            position: absolute;
            z-index: 1000;
            will-change: transform;
          }

          @keyframes fall {
            0% { transform: translateY(-5vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }

          @keyframes sway-left {
            0%, 100% { margin-left: 0; }
            50% { margin-left: -50px; }
          }

          @keyframes sway-right {
            0%, 100% { margin-left: 0; }
            50% { margin-left: 50px; }
          }
        `}</style>
      </Head>
      <main className="flex min-h-screen w-full justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md px-4 py-8 flex flex-col items-center">
          <ClockControls setCustomTime={clockData.setCustomTimeFromInput} resetClock={clockData.resetClock} />
          <ClockDisplay
            now={clockData.now}
            countdownSeconds={clockData.countdownSeconds}
            currentColorIndex={clockData.currentColorIndex}
            highlightClock={clockData.highlightClock}
            isDarkMode={clockData.isDarkMode}
          />
          <DigitalTimeCard now={clockData.now} countdownSeconds={clockData.countdownSeconds} />
        </div>
      </main>
      <div className="confetti-container" ref={confettiRef} id="confettiContainer"></div>
    </>
  );
}