const TodaysClaimers = ({ claimers, loading, account, formatTimeAgo }) => {
    return (
      <div>
        <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-2 xs:mb-3 sm:mb-4 flex items-center">
          <span className="mr-2">Today's Claimers</span>
          {loading && (
            <span className="inline-block w-3 h-3 xs:w-3.5 sm:w-4 xs:h-3.5 sm:h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
          )}
        </h2>
        
        {claimers.length === 0 ? (
          <div className="text-center py-4 xs:py-5 sm:py-6 border border-gray-700/50 rounded-lg bg-black/30 backdrop-blur-sm">
            <p className="text-xs sm:text-sm font-normal text-gray-300/90">No one has claimed their Daily Hirys yet today.</p>
            <p className="text-xs mt-1 font-normal text-gray-400/90">Be the first to claim!</p>
          </div>
        ) : (
          <div className="border border-gray-700/50 rounded-lg bg-black/30 backdrop-blur-sm overflow-hidden">
            <div className="p-2 xs:p-2.5 sm:p-3 bg-black/20 border-b border-gray-700/50 flex justify-between items-center">
              <div className="text-xs sm:text-sm font-bold text-gray-300/90">Wallet</div>
              <div className="text-xs sm:text-sm font-bold text-gray-300/90">Streak</div>
            </div>
            <div className="divide-y divide-gray-700/30 max-h-48 xs:max-h-56 sm:max-h-64 overflow-y-auto scrollbar-thin">
              {claimers.map((claimer, index) => (
                <div 
                  key={index} 
                  className={`p-2 xs:p-2.5 sm:p-3 transition-all hover:bg-emerald-500/5 ${
                    claimer.address === account 
                      ? 'bg-emerald-500/10' 
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center max-w-[50%] lg:max-w-[60%]">
                      <span className={`text-xs sm:text-sm mr-1 xs:mr-1.5 sm:mr-2 ${index < 3 ? 'text-amber-300' : 'text-gray-500/90'}`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <span className="font-mono text-xs sm:text-sm cursor-pointer hover:underline text-emerald-400 truncate font-normal">
                        {claimer.address.slice(0, 4)}...{claimer.address.slice(-4)}
                        {claimer.address === account && <span className="ml-1 text-xs font-sans font-bold">(you)</span>}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-emerald-500/15 text-emerald-400 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded text-xs font-bold whitespace-nowrap">
                        {claimer.streak_count || 1} {claimer.streak_count === 1 ? 'day' : 'days'}
                      </div>
                      <div className="ml-2 text-xs text-gray-400/90 hidden xs:block font-normal">
                        {claimer.formattedTime || formatTimeAgo(claimer.last_claim_date)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 bg-black/20 text-center">
              <button className="text-xs text-emerald-400 hover:underline touch-manipulation py-1 px-3 min-h-[30px] font-bold">
                View all claimers
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default TodaysClaimers;