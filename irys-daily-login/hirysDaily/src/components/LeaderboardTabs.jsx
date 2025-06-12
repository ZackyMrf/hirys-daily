import { useState } from 'react';
import TodaysClaimers from './TodaysClaimers';
import AllTimeLeaders from './AllTimeLeaders';

const LeaderboardTabs = ({ 
  todaysClaimers, 
  allTimeLeaders, 
  loadingClaimers, 
  loadingLeaders, 
  account, 
  formatTimeAgo 
}) => {
  const [showAllTimeLeaders, setShowAllTimeLeaders] = useState(false);

  return (
    <>
      {/* Toggle buttons */}
      <div className="flex justify-center mb-2">
        <div className="inline-flex bg-black/30 backdrop-blur-sm rounded-md p-1 border border-gray-700/50">
          <button 
            onClick={() => setShowAllTimeLeaders(false)}
            className={`px-3 py-1.5 text-xs xs:text-sm rounded-md font-bold transition-all ${
              !showAllTimeLeaders ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            Today's Claimers
          </button>
          <button 
            onClick={() => setShowAllTimeLeaders(true)}
            className={`px-3 py-1.5 text-xs xs:text-sm rounded-md font-bold transition-all ${
              showAllTimeLeaders ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            Streak Leaderboard
          </button>
        </div>
      </div>

      {/* Content */}
      {!showAllTimeLeaders ? (
        <TodaysClaimers 
          claimers={todaysClaimers}
          loading={loadingClaimers}
          account={account}
          formatTimeAgo={formatTimeAgo}
        />
      ) : (
        <AllTimeLeaders 
          leaders={allTimeLeaders}
          loading={loadingLeaders}
          account={account}
        />
      )}
    </>
  );
};

export default LeaderboardTabs;