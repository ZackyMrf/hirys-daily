import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './hooks/useWallet';
import { useStreak } from './hooks/useStreak';
import { useContract } from './hooks/useContract';
import { useLeaderboard } from './hooks/useLeaderboard';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import ClaimAnimation from './components/ClaimAnimation';

function App() {
  // Status and UI states
  const [status, setStatus] = useState('');
  const [showClaimAnimation, setShowClaimAnimation] = useState(false);
  const [characterUrl, setCharacterUrl] = useState('/assets/char1.png');
  const [characterLoading, setCharacterLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Custom hooks
  const wallet = useWallet();
  const streak = useStreak();
  const contract = useContract();
  const leaderboard = useLeaderboard();

  // Character fetching
  const fetchCharacter = useCallback(async () => {
    if (wallet.connected) return;
    
    try {
      setCharacterLoading(true);
      const characters = [
        '/assets/char1.png',
        '/assets/char2.png',
        '/assets/char3.png'
      ];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      const randomChar = characters[Math.floor(Math.random() * characters.length)];
      setCharacterUrl(randomChar);
    } catch (error) {
      console.error("Failed to fetch character:", error);
      setCharacterUrl('/assets/char1.png');
    } finally {
      setCharacterLoading(false);
    }
  }, [wallet.connected]);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!contract.nextClaimTime) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const remaining = contract.nextClaimTime - now;
      
      if (remaining <= 0) {
        contract.setTimeRemaining(0);
      } else {
        contract.setTimeRemaining(remaining);
      }
    };
    
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(intervalId);
  }, [contract.nextClaimTime, contract]);

  // Load data when wallet connects - IMPROVED
// Load data when wallet connects - ENHANCED
useEffect(() => {
  if (wallet.account) {
    console.log(`Wallet connected: ${wallet.account}`);
    
    // Load streak data immediately
    streak.loadStreakData(wallet.account);
    
    // Check last login from contract
    contract.checkLastLogin(wallet.account);
    
    // Fetch leaderboard data
    leaderboard.fetchTodaysClaimers();
    leaderboard.fetchAllTimeLeaders();
    
    // Force reload after delay to ensure everything is synced
    setTimeout(() => {
      console.log('Force reloading streak data...');
      streak.forceReloadStreak(wallet.account);
      
      // Also refresh leaderboard to get latest streak counts
      setTimeout(() => {
        leaderboard.fetchTodaysClaimers();
        leaderboard.fetchAllTimeLeaders();
      }, 1000);
    }, 1500);
    
  } else {
    fetchCharacter();
  }
}, [wallet.account, contract, streak, leaderboard, fetchCharacter]);

// Enhanced periodic refresh for production
useEffect(() => {
  if (wallet.account && wallet.connected) {
    const interval = setInterval(() => {
      // Check streak status
      streak.checkStreakStatus(wallet.account);
      
      // Refresh leaderboard every 30 seconds
      leaderboard.fetchAllTimeLeaders();
      
      // Force reload streak data every 2 minutes to ensure sync
      setTimeout(() => {
        streak.forceReloadStreak(wallet.account);
      }, 1000);
      
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }
}, [wallet.account, wallet.connected, streak, leaderboard]);
const handleLogin = async () => {
  if (!wallet.account) {
    setStatus("Please connect your wallet first");
    return;
  }
  
  setStatus("⏳ Processing...");
  wallet.setError(null);
  
  try {
    setStatus("⏳ Transaction submitted, waiting for confirmation...");
    await contract.dailyLogin(wallet.switchToIrysNetwork);
    setStatus("✅ Daily login successful!");
    
    // Update streak with proper validation
    const newStreak = streak.updateStreak(wallet.account, streak.streakDate);
    
    // Trigger animation
    setShowClaimAnimation(true);
    
    // Add to today's claimers
    leaderboard.addTodaysClaimer({
      address: wallet.account,
      streak_count: newStreak,
      last_claim_date: new Date().toISOString(),
      timestamp: Math.floor(Date.now() / 1000)
    });
    
    // Refresh data
    contract.checkLastLogin(wallet.account);
    leaderboard.fetchAllTimeLeaders();
    
  } catch (err) {
    console.error(err);
    
    if (err.message && err.message.includes("You've already logged in today")) {
      setStatus("⚠️ You already logged in today");
    } else if (err.code === 'ACTION_REJECTED') {
      setStatus("❌ Transaction rejected by user");
    } else {
      setStatus("❌ Failed to login: " + (err.reason || err.message || "Unknown error"));
    }
    wallet.setError(err.message || "Failed to login");
  }
};

// Add this useEffect for checking streak status
useEffect(() => {
  if (wallet.account && streak.streakDate) {
    streak.checkStreakStatus(wallet.account);
  }
}, [wallet.account, streak]);

// Add periodic time updates
useEffect(() => {
  const interval = setInterval(() => {
    leaderboard.updateTimeDisplays();
  }, 60000); // Update every minute
  
  return () => clearInterval(interval);
}, [leaderboard]);

  // Enhanced connect wallet function
  const handleConnectWallet = async () => {
    try {
      await wallet.connectWallet();
      setStatus("✅ Wallet connected successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      setStatus("❌ Failed to connect wallet");
    }
  };

  // Enhanced disconnect function
  const handleDisconnectWallet = () => {
    wallet.disconnectWallet();
    streak.setCurrentStreak(0);
    streak.setBestStreak(0);
    streak.setStreakDate(null);
    contract.setLastLogin(null);
    contract.setTimeRemaining(null);
    leaderboard.setTodaysClaimers([]);
    fetchCharacter();
    setStatus("👋 Disconnected successfully");
    setTimeout(() => setStatus(""), 3000);
  };

  // Reset error after timeout
  useEffect(() => {
    if (wallet.error) {
      const timer = setTimeout(() => wallet.setError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [wallet.error, wallet]);

  return (
    <div className="flex flex-col min-h-screen">
      <main 
        className={`flex-grow text-gray-100 relative overflow-hidden ${
          !wallet.connected ? 'bg-landing' : 'bg-dashboard'
        } bg-fixed bg-cover`}
      >
        {/* Claim animation */}
        <ClaimAnimation 
          showAnimation={showClaimAnimation}
          currentStreak={streak.currentStreak}
          onComplete={() => setShowClaimAnimation(false)}
        />
        
        {/* Header */}
        <Header 
          connected={wallet.connected}
          isLoading={wallet.isLoading}
          timeRemaining={contract.timeRemaining}
          handleLogin={handleLogin}
          connectWallet={handleConnectWallet}
          disconnectWallet={handleDisconnectWallet}
        />

        {/* Responsive spacer */}
        <div className="h-10 xs:h-12 sm:h-16"></div>

        {/* Error toast */}
        {wallet.error && (
          <div className="fixed top-12 xs:top-14 sm:top-20 right-2 xs:right-3 sm:right-4 bg-rose-500/90 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-md shadow-lg z-50 animate-fade-in flex items-center max-w-[94vw] xs:max-w-[90vw] sm:max-w-md">
            <span className="text-xs xs:text-sm font-normal line-clamp-2">{wallet.error}</span>
            <button 
              onClick={() => wallet.setError(null)} 
              className="ml-2 sm:ml-3 px-2.5 py-1.5 bg-white/20 rounded-md text-xs hover:bg-white/30 shrink-0 touch-manipulation min-h-[32px] min-w-[60px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main content */}
        <div className="px-3 xs:px-4 sm:px-6 lg:px-8 pb-12 xs:pb-16 sm:pb-20">
          {!wallet.connected ? (
            <LandingPage 
              connectWallet={handleConnectWallet}
              characterUrl={characterUrl}
              characterLoading={characterLoading}
            />
          ) : (
            <Dashboard 
              account={wallet.account}
              currentStreak={streak.currentStreak}
              bestStreak={streak.bestStreak}
              timeRemaining={contract.timeRemaining}
              isLoading={wallet.isLoading}
              handleLogin={handleLogin}
              status={status}
              lastLogin={contract.lastLogin}
              todaysClaimers={leaderboard.todaysClaimers}
              allTimeLeaders={leaderboard.allTimeLeaders}
              loadingClaimers={leaderboard.loadingClaimers}
              loadingLeaders={leaderboard.loadingLeaders}
              formatTimeAgo={leaderboard.formatTimeAgo}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;