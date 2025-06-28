import { formatTimeRemaining } from '../utils/timeUtils';

const DailyLoginCard = ({ 
  account, 
  timeRemaining, 
  currentStreak, 
  isLoading, 
  handleLogin, 
  status, 
  lastLogin 
}) => {
  return (
    <div className="card-enhanced p-4 xs:p-5 sm:p-6 md:p-7 relative overflow-hidden">
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
      
      {/* Header */}
      <div className="relative z-10">
        <h2 className="text-gradient text-base xs:text-lg sm:text-xl font-bold mb-3 xs:mb-4 sm:mb-5 flex items-center gap-2">
          <span className="animate-pulse">💎</span>
          Your Daily Login
        </h2>
        <p className="text-xs xs:text-sm sm:text-base font-normal text-gray-300/90 mb-4 xs:mb-5">
          Welcome back,{' '}
          <span className="text-emerald-400 font-semibold font-mono">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>!
        </p>
        
        {timeRemaining > 0 ? (
          <div className="glass-card bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 xs:p-5 sm:p-6 mb-4 xs:mb-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            <div className="flex items-center relative z-10">
              <div className="text-2xl xs:text-3xl sm:text-4xl mr-3 xs:mr-4 sm:mr-5 animate-pulse">⏳</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs xs:text-sm sm:text-base font-bold text-amber-200 mb-2">
                  Your next claim is available in:
                </div>
                <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-amber-300 mb-2 font-mono">
                  {formatTimeRemaining(timeRemaining)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-emerald-400 font-bold">
                    Current streak:
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-xs font-bold">
                    {currentStreak} days 🔥
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 xs:p-5 sm:p-6 mb-4 xs:mb-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-500"></div>
            <div className="flex items-center relative z-10">
              <div className="text-2xl xs:text-3xl sm:text-4xl mr-3 xs:mr-4 sm:mr-5 animate-bounce">🔥</div>
              <div className="flex-1">
                <div className="text-xs xs:text-sm sm:text-base font-bold text-emerald-200 mb-2">
                  🎉 Ready to claim!
                </div>
                <div className="text-xs sm:text-sm font-normal text-gray-300/90 mb-2">
                  Claim your daily reward to continue your streak!
                </div>
                {currentStreak > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-amber-300 font-bold">
                      Don't break your streak:
                    </span>
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full text-xs font-bold">
                      {currentStreak} days 🔥
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      
        {/* Action Button */}
        <button
          onClick={handleLogin}
          disabled={timeRemaining > 0 || isLoading}
          className={`btn-primary w-full py-3 xs:py-4 sm:py-5 rounded-xl text-sm xs:text-base sm:text-lg font-bold transition-all relative overflow-hidden touch-manipulation min-h-[48px] shadow-lg
            ${timeRemaining > 0 
              ? 'bg-gray-600/70 text-gray-300 opacity-60 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 glow-emerald'}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="spinner-enhanced w-5 h-5"></div>
              <span>Processing...</span>
            </div>
          ) : timeRemaining > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <span>⏰</span>
              <span>Next Claim in {formatTimeRemaining(timeRemaining)}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="animate-pulse">💎</span>
              <span>Claim Daily Reward</span>
            </div>
          )}
          <span className="ripple-effect"></span>
        </button>
        
        {/* Status Message */}
        {status && (
          <div className={`mt-4 text-center text-xs sm:text-sm font-normal p-3 rounded-lg glass-card ${
            status.includes('✅') ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 
            status.includes('❌') ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 
            status.includes('⚠️') ? 'text-amber-300 bg-amber-500/10 border border-amber-500/20' : 
            status.includes('👋') ? 'text-sky-400 bg-sky-500/10 border border-sky-500/20' : 
            'text-gray-300/90 bg-gray-500/10 border border-gray-500/20'
          }`}>
            {status}
          </div>
        )}
        
        {/* Last Login Info */}
        {lastLogin && (
          <div className="mt-4 text-xs text-gray-400/90 text-center font-normal glass-card p-2 rounded-lg">
            <span className="text-gray-500">Last login:</span> <span className="font-mono">{lastLogin}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLoginCard;