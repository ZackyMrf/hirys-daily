const AllTimeLeaders = ({ leaders, loading, account }) => {
    return (
      <div>
        <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-2 xs:mb-3 sm:mb-4 flex items-center">
          <span className="mr-2">🏆 Streak Leaderboard</span>
          {loading && (
            <span className="inline-block w-3 h-3 xs:w-3.5 sm:w-4 xs:h-3.5 sm:h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
          )}
        </h2>
        
        {leaders.length === 0 ? (
          <div className="text-center py-4 xs:py-5 sm:py-6 border border-gray-700/50 rounded-lg bg-black/30 backdrop-blur-sm">
            <p className="text-xs sm:text-sm font-normal text-gray-300/90">No streak data available yet.</p>
            <p className="text-xs mt-1 font-normal text-gray-400/90">Start your streak to be the first on the leaderboard!</p>
          </div>
        ) : (
          <div className="border border-gray-700/50 rounded-lg bg-black/30 backdrop-blur-sm overflow-hidden">
            <div className="p-2 xs:p-2.5 sm:p-3 bg-black/20 border-b border-gray-700/50 grid grid-cols-5 gap-2 text-xs sm:text-sm font-bold text-gray-300/90">
              <div className="col-span-1">Rank</div>
              <div className="col-span-2">Wallet</div>
              <div className="col-span-1 text-center">Best</div>
              <div className="col-span-1 text-center">Current</div>
            </div>
            <div className="divide-y divide-gray-700/30 max-h-64 xs:max-h-72 sm:max-h-80 overflow-y-auto scrollbar-thin">
              {leaders.map((leader, index) => (
                <div 
                  key={index} 
                  className={`p-2 xs:p-2.5 sm:p-3 transition-all hover:bg-emerald-500/5 grid grid-cols-5 gap-2 items-center ${
                    leader.address === account 
                      ? 'bg-emerald-500/10 border-l-2 border-emerald-400' 
                      : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    <span className={`text-xs sm:text-sm ${index < 3 ? 'text-amber-300' : 'text-gray-500/90'}`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                  </div>
                  
                  {/* Wallet Address */}
                  <div className="col-span-2">
                    <span className="font-mono text-xs sm:text-sm cursor-pointer hover:underline text-emerald-400 font-normal block truncate">
                      {leader.address.slice(0, 6)}...{leader.address.slice(-4)}
                      {leader.address === account && (
                        <span className="ml-1 text-xs font-sans font-bold text-amber-300">(you)</span>
                      )}
                    </span>
                    {leader.isActive && (
                      <span className="text-xs text-green-400 font-bold">🔥 Active</span>
                    )}
                  </div>
                  
                  {/* Best Streak */}
                  <div className="col-span-1 text-center">
                    <div className="bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded text-xs font-bold inline-block">
                      {leader.bestStreak}
                    </div>
                  </div>
                  
                  {/* Current Streak */}
                  <div className="col-span-1 text-center">
                    <div className={`px-1.5 py-0.5 rounded text-xs font-bold inline-block ${
                      leader.currentStreak > 0 
                        ? 'bg-emerald-500/15 text-emerald-400' 
                        : 'bg-gray-500/15 text-gray-400'
                    }`}>
                      {leader.currentStreak}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {leaders.length >= 20 && (
              <div className="p-2 bg-black/20 text-center border-t border-gray-700/30">
                <span className="text-xs text-gray-400 font-normal">
                  Showing top 20 streak holders
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  export default AllTimeLeaders;