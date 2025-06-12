import { useEffect } from 'react';

const ClaimAnimation = ({ showAnimation, currentStreak, onComplete }) => {
  useEffect(() => {
    if (!showAnimation) return;

    // Create and animate the fireworks
    const container = document.createElement("div");
    container.className = "fireworks-container";
    document.body.appendChild(container);
    
    // Create multiple fireworks with random positions and colors
    const colors = ["#4ade80", "#34d399", "#10b981", "#047857", "#065f46"];
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const firework = document.createElement("div");
        firework.className = "firework";
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.top = `${20 + Math.random() * 50}%`;
        
        // Create particles for each firework
        for (let j = 0; j < 30; j++) {
          const particle = document.createElement("div");
          particle.className = "particle";
          const color = colors[Math.floor(Math.random() * colors.length)];
          particle.style.backgroundColor = color;
          particle.style.boxShadow = `0 0 6px 1px ${color}`;
          firework.appendChild(particle);
        }
        
        container.appendChild(firework);
        
        // Remove firework after animation
        setTimeout(() => {
          firework.remove();
        }, 2000);
      }, i * 200);
    }
    
    // Remove container after all animations complete
    setTimeout(() => {
      container.remove();
      onComplete();
    }, 4000);
    
    // Play success sound if available
    try {
      const audio = new Audio("/assets/success.mp3");
      audio.volume = 0.3;
      audio.play().catch(e => console.log("Audio play prevented by browser policy"));
    } catch (e) {
      // Silent fallback if audio not available
    }
  }, [showAnimation, onComplete]);

  if (!showAnimation) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 pointer-events-none flex items-center justify-center p-4">
      <div className="text-center scale-animation max-w-[85vw] xs:max-w-xs sm:max-w-sm">
        <div className="text-4xl mb-3">🎉</div>
        <div className="text-xl sm:text-2xl font-bold text-emerald-400 mb-2">Daily Hirys Claimed!</div>
        <div className="text-xs sm:text-sm font-normal text-gray-200/90">Your streak continues!</div>
        <div className="text-base sm:text-lg font-bold mt-3">
          {currentStreak > 1 ? (
            <span className="text-amber-300">🔥 {currentStreak} day streak! 🔥</span>
          ) : (
            <span>Streak started!</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimAnimation;