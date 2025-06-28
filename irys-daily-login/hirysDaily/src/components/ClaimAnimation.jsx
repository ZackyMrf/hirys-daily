import { useEffect } from 'react';

const ClaimAnimation = ({ showAnimation, currentStreak, onComplete }) => {
  useEffect(() => {
    if (!showAnimation) return;

    // Create and animate the enhanced celebration
    const container = document.createElement("div");
    container.className = "celebration-container";
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
    `;
    document.body.appendChild(container);
    
    // Enhanced colors with gradients
    const colors = [
      "#10b981", "#34d399", "#6ee7b7", "#a7f3d0",
      "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe",
      "#8b5cf6", "#a78bfa", "#c4b5fd", "#e9d5ff"
    ];
    
    // Create multiple waves of fireworks
    for (let wave = 0; wave < 3; wave++) {
      setTimeout(() => {
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            const firework = document.createElement("div");
            firework.style.cssText = `
              position: absolute;
              left: ${Math.random() * 100}%
              top: ${20 + Math.random() * 40}%;
              transform: translate(-50%, -50%);
            `;
            
            // Create enhanced particles for each firework
            for (let j = 0; j < 40; j++) {
              const particle = document.createElement("div");
              const color = colors[Math.floor(Math.random() * colors.length)];
              const size = Math.random() * 8 + 3;
              const distance = Math.random() * 200 + 100;
              const angle = (j / 40) * 360 + Math.random() * 30;
              
              particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, ${color}, ${color}80);
                border-radius: 50%;
                box-shadow: 0 0 12px 2px ${color}40;
                animation: explode-${j} 2s ease-out forwards;
              `;
              
              // Create unique animation for each particle
              const keyframes = `
                @keyframes explode-${j} {
                  0% {
                    transform: translate(0, 0) scale(0);
                    opacity: 1;
                  }
                  20% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                  }
                  100% {
                    transform: translate(${Math.cos(angle * Math.PI / 180) * distance}px, ${Math.sin(angle * Math.PI / 180) * distance}px) scale(0);
                    opacity: 0;
                  }
                }
              `;
              
              // Add keyframes to stylesheet
              if (!document.querySelector(`#particle-${j}-${i}-${wave}`)) {
                const style = document.createElement('style');
                style.id = `particle-${j}-${i}-${wave}`;
                style.textContent = keyframes;
                document.head.appendChild(style);
              }
              
              firework.appendChild(particle);
            }
            
            container.appendChild(firework);
            
            // Remove firework after animation
            setTimeout(() => {
              if (firework.parentNode) {
                firework.remove();
              }
            }, 2500);
          }, i * 150);
        }
      }, wave * 1000);
    }
    
    // Floating reward text animation
    const rewardText = document.createElement("div");
    rewardText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      font-weight: bold;
      background: linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: rewardFloat 3s ease-out forwards;
      z-index: 1001;
      text-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
    `;
    rewardText.innerHTML = `🎉 Daily Hirys Claimed! 🎉<br><span style="font-size: 1.5rem; color: #fbbf24;">Streak: ${currentStreak} days!</span>`;
    
    // Add reward text animation
    const rewardKeyframes = `
      @keyframes rewardFloat {
        0% {
          transform: translate(-50%, -50%) scale(0) rotate(-10deg);
          opacity: 0;
        }
        20% {
          transform: translate(-50%, -50%) scale(1.2) rotate(5deg);
          opacity: 1;
        }
        80% {
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -60%) scale(0.8) rotate(0deg);
          opacity: 0;
        }
      }
    `;
    
    if (!document.querySelector('#reward-animation')) {
      const style = document.createElement('style');
      style.id = 'reward-animation';
      style.textContent = rewardKeyframes;
      document.head.appendChild(style);
    }
    
    container.appendChild(rewardText);
    
    // Remove container after all animations complete
    setTimeout(() => {
      if (container.parentNode) {
        container.remove();
      }
      // Clean up animation styles
      document.querySelectorAll('[id^="particle-"]').forEach(el => el.remove());
      onComplete();
    }, 5000);
    
    // Play success sound if available
    try {
      const audio = new Audio("/assets/success.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => console.log("Audio play prevented by browser policy"));
    } catch {
      // Silent fallback if audio not available
    }
  }, [showAnimation, onComplete, currentStreak]);

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