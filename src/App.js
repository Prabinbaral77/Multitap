import React, { useState, useEffect } from 'react';
import  "./App.css";


const App = () => {
  const [taps, setTaps] = useState([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Handle touch events
  const handleTouch = (e) => {
    e.preventDefault(); // Prevent default touch behaviors
    if (!isPlaying) return;

    const now = Date.now();
    const touches = Array.from(e.touches);
    const newTaps = touches.map(touch => {
      const rect = e.target.getBoundingClientRect();
      return {
        id: `${now}-${touch.identifier}`,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        timestamp: now
      };
    });

    setLastTapTime(now);

    // Calculate score based on number of simultaneous taps and combo
    const basePoints = newTaps.length;
    const pointsToAdd = basePoints;

    setTaps(prevTaps => [...prevTaps, ...newTaps]);
    setScore(prevScore => prevScore + pointsToAdd);
  };

  // Handle mouse events (for desktop)
  const handleMouse = (e) => {
    if (!isPlaying || e.type === 'mouseup') return;

    const now = Date.now();
    const newTap = {
      id: now,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      timestamp: now
    };

    setLastTapTime(now);

    const pointsToAdd = 1; // Cap combo multiplier at 5x
    setTaps(prevTaps => [...prevTaps, newTap]);
    setScore(prevScore => prevScore + pointsToAdd);
  };

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTaps([]);
    setTimeLeft(30);
    setLastTapTime(0);
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Clean up old tap animations
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setTaps(prevTaps => prevTaps.filter(tap => now - tap.timestamp < 1000));
    }, 100);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Game stats */}
      <div className="flex justify-between mb-4">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div className="text-2xl font-bold">Time: {timeLeft}s</div>
      </div>

      {/* Game area */}
      <div 
        className="relative w-full h-96 bg-gray-100 rounded-lg cursor-pointer overflow-hidden touch-none"
        onTouchStart={handleTouch}
        // onTouchMove={handleTouch}
        // onMouseDown={handleMouse}
        // onMouseMove={e => e.buttons === 1 && handleMouse(e)}
      >
        {/* Tap effects */}
        {taps.map(tap => (
          <div
            key={tap.id}
            className="absolute w-8 h-8 -ml-4 -mt-4 bg-blue-500 rounded-full opacity-50 animate-ping"
            style={{
              left: tap.x,
              top: tap.y,
            }}
          />
        ))}

        {/* Game state overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-xl mb-4">
              Final Score: {score}
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 text-xl font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {timeLeft === 30 ? 'Start Game' : 'Play Again'}
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-gray-600">
        <p>Use multiple fingers to tap anywhere in the game area!</p>
        <p>Quick taps build up your nocombo multiplier (max 5x)</p>
        <p>More simultaneous taps = more points!</p>
      </div>
    </div>
  );
};
export default App;