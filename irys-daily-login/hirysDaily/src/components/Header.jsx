import { formatTimeRemaining } from '../utils/timeUtils';

const Header = ({ 
  connected, 
  isLoading, 
  timeRemaining, 
  handleLogin, 
  connectWallet, 
  disconnectWallet 
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="backdrop-blur-md bg-black/10 border-b border-gray-700/30 w-full transition-all duration-300">
        <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-2 xs:py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold cursor-pointer hover:text-emerald-400 transition-colors">
              Hirys!
            </h1>
            
            {connected && (
              <button
                id="claim-button"
                onClick={handleLogin}
                disabled={timeRemaining > 0 || isLoading}
                title={timeRemaining > 0 ? `Next claim available in ${formatTimeRemaining(timeRemaining)}` : "Claim your Daily Hirys"}
                className={`btn-primary text-xs xs:text-sm px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-1.5 sm:py-2 rounded-full flex items-center gap-1 transition-all relative overflow-hidden touch-manipulation min-h-[36px]
                  ${timeRemaining > 0 ? 'bg-gray-600/70 text-gray-300 opacity-60 cursor-not-allowed' : ''}
                  ${isLoading ? 'opacity-75 cursor-wait' : timeRemaining > 0 ? 'opacity-60 cursor-not-allowed' : 'hover:bg-emerald-500/80'}`}
              >
                {isLoading ? (
                  <span className="inline-block w-3 h-3 xs:w-3.5 sm:w-4 xs:h-3.5 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                ) : timeRemaining > 0 ? (
                  <span className="inline-block mr-1">⏳</span>
                ) : (
                  <span className="inline-block mr-1 animate-pulse-slow">🔥</span>
                )}
                <span className="hidden xxs:inline font-bold">
                  {timeRemaining > 0 ? 
                    `Next: ${formatTimeRemaining(timeRemaining)}` : 
                    "Claim Daily Hirys"}
                </span>
                <span className="xxs:hidden font-bold">
                  {timeRemaining > 0 ? 
                    `${formatTimeRemaining(timeRemaining)}` : 
                    "Claim"}
                </span>
                
                <span className="ripple-effect"></span>
              </button>
            )}
          </div>
          
          {!connected ? (
            <button 
              onClick={connectWallet} 
              disabled={isLoading}
              className={`btn-primary text-xs xs:text-sm px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded-md flex items-center touch-manipulation min-h-[40px] ${isLoading ? 'opacity-75 cursor-wait' : 'hover:bg-emerald-500/80'}`}
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-3 h-3 xs:w-3.5 sm:w-4 xs:h-3.5 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  <span className="hidden xxs:inline font-bold">Connecting...</span>
                  <span className="xxs:hidden font-bold">...</span>
                </>
              ) : (
                <><span className="hidden xxs:inline font-bold">Connect Wallet</span><span className="xxs:hidden font-bold">Connect</span></>
              )}
            </button>
          ) : (
            <button 
              onClick={disconnectWallet} 
              className="btn-primary text-xs xs:text-sm px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded-md hover:bg-rose-500/70 touch-manipulation min-h-[40px]"
            >
              <span className="hidden xxs:inline font-bold">Disconnect</span>
              <span className="xxs:hidden font-bold">Disc.</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;