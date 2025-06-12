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
    <div className="p-3 xs:p-4 sm:p-5 md:p-6 border border-gray-700/50 rounded-lg bg-black/30 backdrop-blur-sm">
      <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-2 xs:mb-3 sm:mb-4 text-emerald-400">Your Daily Login</h2>
      <p className="text-xs xs:text-sm sm:text-base font-normal text-gray-300/90 mb-2 xs:mb-3">
        Welcome back, <span className="text-gray-100 font-medium">{account.slice(0, 6)}...{account.slice(-4)}</span>!
      </p>
      
      {timeRemaining > 0 ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 xs:p-3 sm:p-4 mb-3 xs:mb-4">
          <div className="flex items-center">
            <div className="text-lg xs:text-xl sm:text-2xl mr-2 xs:mr-2.5 sm:mr-3">⏳</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs xs:text-sm sm:text-base font-bold">Your next claim is available in:</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-1">
                {formatTimeRemaining(timeRemaining)}
              </div>
              <div className="text-xs sm:text-sm text-emerald-400 font-bold mt-1">
                Current streak: {currentStreak} days
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-2.5 xs:p-3 sm:p-4 mb-3 xs:mb-4">
          <div className="flex items-center">
            <div className="text-lg xs:text-xl sm:text-2xl mr-2 xs:mr-2.5 sm:mr-3">🔥</div>
            <div>
              <div className="text-xs xs:text-sm sm:text-base font-bold">You can claim now!</div>
              <div className="text-xs sm:text-sm font-normal text-gray-300/90">
                Claim your daily login to continue your streak!
              </div>
              {currentStreak > 0 && (
                <div className="text-xs sm:text-sm text-amber-300 font-bold mt-1">
                  Don't break your {currentStreak}-day streak!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={handleLogin}
        disabled={timeRemaining > 0 || isLoading}
        className={`w-full py-2.5 xs:py-3 sm:py-3.5 rounded-lg text-xs xs:text-sm sm:text-base font-bold transition-all relative overflow-hidden touch-manipulation min-h-[44px]
          ${timeRemaining > 0 
            ? 'bg-gray-600/70 text-gray-300 opacity-60 cursor-not-allowed' 
            : 'bg-emerald-500 hover:bg-emerald-600'}`}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-3 h-3 xs:w-3.5 sm:w-4 xs:h-3.5 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Processing...
          </>
        ) : timeRemaining > 0 ? (
          <>Next Claim in {formatTimeRemaining(timeRemaining)}</>
        ) : (
          <>Claim Daily Login</>
        )}
      </button>
      
      {status && (
        <div className={`mt-3 text-center text-xs sm:text-sm font-normal ${
          status.includes('✅') ? 'text-emerald-400' : 
          status.includes('❌') ? 'text-rose-400' : 
          status.includes('⚠️') ? 'text-amber-300' : 
          status.includes('👋') ? 'text-sky-400' : 'text-gray-300/90'
        }`}>
          {status}
        </div>
      )}
      
      {lastLogin && (
        <div className="mt-3 text-xs text-gray-400/90 text-center font-normal">
          Last login: {lastLogin}
        </div>
      )}
    </div>
  );
};

export default DailyLoginCard;