import { useState } from 'react';
import StreakCounter from './StreakCounter';
import DailyLoginCard from './DailyLoginCard';
import LeaderboardTabs from './LeaderboardTabs';

const Dashboard = ({ 
  account,
  currentStreak, 
  bestStreak, 
  timeRemaining, 
  isLoading, 
  handleLogin, 
  status, 
  lastLogin,
  todaysClaimers,
  allTimeLeaders,
  loadingClaimers,
  loadingLeaders,
  formatTimeAgo
}) => {
  const [showDebug, setShowDebug] = useState(false);

  // Function to get localStorage data safely
  const getStorageData = () => {
    try {
      if (!account) return 'No account';
      const data = localStorage.getItem(`streak_${account.toLowerCase()}`);
      return data || 'No data found';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  // Function to refresh streak data
  const handleRefreshStreak = () => {
    if (account) {
      // Force reload from localStorage
      const streakData = localStorage.getItem(`streak_${account.toLowerCase()}`);
      console.log('Current localStorage data:', streakData);
      
      // Trigger a page refresh if needed
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-[90vw] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto mt-4 xs:mt-6 sm:mt-8 space-y-6 xs:space-y-8 sm:space-y-10 px-0 xs:px-1 sm:px-2 relative">
      
      {/* Debug Toggle Button - ONLY IN DEVELOPMENT */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="bg-gray-800/80 text-white px-2 py-1 rounded text-xs hover:bg-gray-700/80 transition-colors"
          >
            Debug {showDebug ? '🔽' : '🔼'}
          </button>
        </div>
      )}

      {/* Debug Info - ONLY IN DEVELOPMENT */}
      {process.env.NODE_ENV === 'development' && showDebug && (
        <div className="bg-gray-900/90 border border-gray-600 p-3 rounded mb-4 text-xs backdrop-blur-sm">
          <div className="flex justify-between items-start mb-2">
            <strong className="text-yellow-400">Debug Info:</strong>
            <button 
              onClick={handleRefreshStreak}
              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-500 transition-colors"
            >
              Refresh Streak
            </button>
          </div>
          
          <div className="space-y-1 font-mono">
            <div><span className="text-gray-400">Account:</span> {account || 'Not connected'}</div>
            <div><span className="text-gray-400">Current Streak:</span> <span className="text-green-400">{currentStreak}</span></div>
            <div><span className="text-gray-400">Best Streak:</span> <span className="text-yellow-400">{bestStreak}</span></div>
            <div><span className="text-gray-400">LocalStorage Key:</span> streak_{account?.toLowerCase()}</div>
            <div className="break-all">
              <span className="text-gray-400">Storage Data:</span> 
              <span className="text-cyan-400">{getStorageData()}</span>
            </div>
            <div><span className="text-gray-400">Today's Claimers:</span> {todaysClaimers?.length || 0}</div>
            <div><span className="text-gray-400">All Time Leaders:</span> {allTimeLeaders?.length || 0}</div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => {
                  if (account) {
                    localStorage.removeItem(`streak_${account.toLowerCase()}`);
                    alert('Streak data cleared! Refresh page to see changes.');
                  }
                }}
                className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-500 transition-colors"
              >
                Clear Streak
              </button>
              <button 
                onClick={() => {
                  const data = { currentStreak: 5, bestStreak: 10, lastLoginDate: new Date().toISOString().split('T')[0] };
                  if (account) {
                    localStorage.setItem(`streak_${account.toLowerCase()}`, JSON.stringify(data));
                    alert('Test streak data set! Refresh page to see changes.');
                  }
                }}
                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-500 transition-colors"
              >
                Set Test Data
              </button>
              <button 
                onClick={() => {
                  console.log('=== FULL DEBUG INFO ===');
                  console.log('Account:', account);
                  console.log('Current Streak:', currentStreak);
                  console.log('Best Streak:', bestStreak);
                  console.log('LocalStorage Data:', getStorageData());
                  console.log('Today\'s Claimers:', todaysClaimers);
                  console.log('All Time Leaders:', allTimeLeaders);
                  console.log('======================');
                }}
                className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-500 transition-colors"
              >
                Log to Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character animations */}
      <div className="absolute -left-8 xs:-left-12 md:-left-16 top-0 w-16 xs:w-20 h-16 xs:h-20 hidden md:block">
        <div className="char-1 animate-float-slow"></div>
      </div>
      <div className="absolute -right-8 xs:-right-12 md:-right-16 top-40 w-20 xs:w-24 h-20 xs:h-24 hidden md:block">
        <div className="char-2 animate-bounce-slow"></div>
      </div>
      
      <StreakCounter currentStreak={currentStreak} bestStreak={bestStreak} />
      
      <DailyLoginCard 
        account={account}
        timeRemaining={timeRemaining}
        currentStreak={currentStreak}
        isLoading={isLoading}
        handleLogin={handleLogin}
        status={status}
        lastLogin={lastLogin}
      />
      
      <LeaderboardTabs 
        todaysClaimers={todaysClaimers}
        allTimeLeaders={allTimeLeaders}
        loadingClaimers={loadingClaimers}
        loadingLeaders={loadingLeaders}
        account={account}
        formatTimeAgo={formatTimeAgo}
      />
    </div>
  );
};

export default Dashboard;