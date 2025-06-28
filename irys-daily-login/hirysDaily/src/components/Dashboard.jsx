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
      
      {/* Floating Particles Background */}
      <div className="particles-bg opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 8 + 12}s`
            }}
          />
        ))}
      </div>

      {/* Welcome Section with Enhanced Design */}
      <div className="card-enhanced p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
        <div className="relative z-10">
          <div className="text-3xl mb-3 animate-bounce">👋</div>
          <h2 className="text-gradient text-lg sm:text-xl font-bold mb-2">Welcome back!</h2>
          <p className="text-gray-300 text-sm">
            Connected as: <span className="font-mono text-emerald-400">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
          </p>
        </div>
      </div>

      {/* Debug Toggle Button - ONLY IN DEVELOPMENT */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-40">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="glass-card bg-gray-800/80 text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-700/80 transition-all duration-300 shadow-lg"
          >
            Debug {showDebug ? '🔽' : '🔼'}
          </button>
        </div>
      )}

      {/* Debug Info - ONLY IN DEVELOPMENT */}
      {import.meta.env.DEV && showDebug && (
        <div className="glass-card bg-gray-900/90 border border-gray-600/50 p-4 rounded-lg mb-4 text-xs backdrop-blur-md">
          <div className="flex justify-between items-start mb-3">
            <strong className="text-yellow-400 text-sm">🔧 Debug Info:</strong>
            <button 
              onClick={handleRefreshStreak}
              className="btn-secondary bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-500 transition-all duration-300 shadow-md"
            >
              🔄 Refresh Streak
            </button>
          </div>
          
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Account:</span> 
              <span className="text-emerald-400">{account || 'Not connected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Streak:</span> 
              <span className="text-green-400 font-bold">{currentStreak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Best Streak:</span> 
              <span className="text-yellow-400 font-bold">{bestStreak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">LocalStorage Key:</span> 
              <span className="text-blue-400">streak_{account?.toLowerCase()}</span>
            </div>
            <div className="break-all pt-2 border-t border-gray-600">
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