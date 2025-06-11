import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import DailyLoginABI from './abi/DailyLoginABI.json';

const CONTRACT_ADDRESS = '0xE6466700214a9cc8b76653af4a1D99ECE009645d';
const IRYS_TESTNET_CHAIN_ID = '0x4f6'; // Hex for 1270

function App() {
  // State management
  const [status, setStatus] = useState('');
  const [account, setAccount] = useState('');
  const [lastLogin, setLastLogin] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showClaimAnimation, setShowClaimAnimation] = useState(false);
  const [todaysClaimers, setTodaysClaimers] = useState([]);
  const [loadingClaimers, setLoadingClaimers] = useState(false);
  const [characterUrl, setCharacterUrl] = useState('/assets/char1.png');
  const [characterLoading, setCharacterLoading] = useState(false);
  const [feed, setFeed] = useState([]);
  // Streak-related states
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streakDate, setStreakDate] = useState(null);
  const [lastLoginIntervalId, setLastLoginIntervalId] = useState(null);
  // Track if user manually disconnected
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);
  // Track viewport size
  const [isMobile, setIsMobile] = useState(false);

  // Character images
  const fetchCharacter = useCallback(async () => {
    if (connected) return;
    
    try {
      setCharacterLoading(true);
      // Select from available characters
      const characters = [
        '/assets/char1.png',
        '/assets/char2.png',
        '/assets/char3.png'
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Select a random character
      const randomChar = characters[Math.floor(Math.random() * characters.length)];
      setCharacterUrl(randomChar);
    } catch (error) {
      console.error("Failed to fetch character:", error);
      // Fallback to default character
      setCharacterUrl('/assets/char1.png');
    } finally {
      setCharacterLoading(false);
    }
  }, [connected]);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Enhanced formatTimeAgo function
  const formatTimeAgo = useCallback((date) => {
    if (!date) return '';
    
    // Ensure we're working with a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const seconds = Math.floor((now - dateObj) / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }, []);

  // Load streak data from localStorage
  const loadStreakData = useCallback((userAccount) => {
    if (!userAccount) return;
    
    const streakData = localStorage.getItem(`streak_${userAccount}`);
    if (streakData) {
      const { currentStreak, bestStreak, lastLoginDate } = JSON.parse(streakData);
      setCurrentStreak(currentStreak || 0);
      setBestStreak(bestStreak || 0);
      setStreakDate(lastLoginDate || null);
    }
  }, []);

  // Save streak data to localStorage
  const saveStreakData = useCallback((userAccount, currentStreak, bestStreak, lastLoginDate) => {
    if (!userAccount) return;
    
    localStorage.setItem(`streak_${userAccount}`, JSON.stringify({
      currentStreak,
      bestStreak,
      lastLoginDate
    }));
  }, []);

  // Check if user's streak is still valid
  const isStreakValid = useCallback((lastLoginDate) => {
    if (!lastLoginDate) return false;
    
    const lastDate = new Date(lastLoginDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if last login was yesterday or today (to maintain streak)
    return (
      lastDate.getFullYear() === yesterday.getFullYear() &&
      lastDate.getMonth() === yesterday.getMonth() &&
      lastDate.getDate() === yesterday.getDate()
    ) || (
      lastDate.getFullYear() === today.getFullYear() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getDate() === today.getDate()
    );
  }, []);

  // Fetch today's claimers
  const fetchTodaysClaimers = useCallback(async () => {
    if (!connected) return;
    
    try {
      setLoadingClaimers(true);
      
      // Connect to contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DailyLoginABI.abi, provider);
      
      // Get the timestamp for the start of today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = Math.floor(today.getTime() / 1000);
      
      // Query Login events from today
      const filter = contract.filters.Login();
      const events = await contract.queryFilter(filter, -10000); // Look back ~10000 blocks
      
      // Process events and filter for today's logins
      const todaysEvents = events.filter(event => {
        const timestamp = Number(event.args.timestamp);
        return timestamp >= startOfDay;
      });
      
      // Create a map to track unique addresses and their latest login
      const claimerMap = {};
      
      // Process each login event
      for (const event of todaysEvents) {
        const address = event.args.user;
        const timestamp = Number(event.args.timestamp);
        
        // Store or update claimer data
        claimerMap[address] = {
          address,
          timestamp,
          formattedTime: formatTimeAgo(new Date(timestamp * 1000)),
          last_claim_date: new Date(timestamp * 1000).toISOString()
        };
      }
      
      // Now fetch streak information for each claimer
      const claimers = Object.values(claimerMap);
      
      // For each claimer, load their streak from localStorage or contract
      for (const claimer of claimers) {
        // Try to get streak from localStorage first
        const streakData = localStorage.getItem(`streak_${claimer.address}`);
        if (streakData) {
          const { currentStreak } = JSON.parse(streakData);
          claimer.streak_count = currentStreak;
        } else {
          // Default to 1 if no data exists
          claimer.streak_count = 1;
        }
      }
      
      // Sort by timestamp (most recent first)
      claimers.sort((a, b) => b.timestamp - a.timestamp);
      
      setTodaysClaimers(claimers);
      
    } catch (error) {
      console.error("Failed to fetch today's claimers:", error);
    } finally {
      setLoadingClaimers(false);
    }
  }, [connected, formatTimeAgo]);

  // Set up an interval to refresh the timestamps regularly
  useEffect(() => {
    if (!connected || todaysClaimers.length === 0) return;
    
    // Update timestamp displays every minute
    const intervalId = setInterval(() => {
      setTodaysClaimers(prevClaimers => 
        prevClaimers.map(claimer => ({
          ...claimer,
          formattedTime: formatTimeAgo(new Date(claimer.timestamp * 1000))
        }))
      );
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [connected, todaysClaimers.length, formatTimeAgo]);

  // Real-time check for last login with more details
  const checkLastLogin = useCallback(async (userAccount) => {
    if (!userAccount || !connected) return;
    
    try {
      // Clear any existing interval
      if (lastLoginIntervalId) {
        clearInterval(lastLoginIntervalId);
        setLastLoginIntervalId(null);
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DailyLoginABI.abi, provider);
      const timestamp = await contract.lastLoginTs(userAccount);
      
      if (timestamp > 0) {
        const loginDate = new Date(Number(timestamp) * 1000);
        
        // Format with both absolute and relative time
        const formattedDate = loginDate.toLocaleString();
        const timeAgo = formatTimeAgo(loginDate);
        setLastLogin(`${formattedDate} (${timeAgo})`);
        
        // Check if user has already logged in today
        const today = new Date();
        
        if (loginDate.getDate() === today.getDate() && 
            loginDate.getMonth() === today.getMonth() && 
            loginDate.getFullYear() === today.getFullYear()) {
          // Already logged in today - don't modify streak
        }
        
        // Set up interval to update the "time ago" portion
        const newIntervalId = setInterval(() => {
          const updatedTimeAgo = formatTimeAgo(loginDate);
          setLastLogin(`${formattedDate} (${updatedTimeAgo})`);
        }, 60000); // Update every minute
        
        setLastLoginIntervalId(newIntervalId);
      }
    } catch (err) {
      console.error("Error checking last login:", err);
    }
  }, [formatTimeAgo, lastLoginIntervalId, connected]);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (lastLoginIntervalId) {
        clearInterval(lastLoginIntervalId);
      }
    };
  }, [lastLoginIntervalId]);

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        if (connected && !manuallyDisconnected) {
          disconnectWallet();
        }
      } else if (accounts[0] !== account) {
        // User has switched accounts
        setAccount(accounts[0]);
        checkLastLogin(accounts[0]);
        loadStreakData(accounts[0]);
      }
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [connected, account, manuallyDisconnected]);

  useEffect(() => {
    // Don't auto-connect if user manually disconnected
    if (manuallyDisconnected) return;
    
    // Check if connected in localStorage
    const wasConnected = localStorage.getItem("connected") === "true";
    
    // Check if already connected
    if (window.ethereum && wasConnected) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setConnected(true);
            checkLastLogin(accounts[0]);
            loadStreakData(accounts[0]);
          } else {
            fetchCharacter();
          }
        })
        .catch(error => {
          console.error("Failed to get accounts:", error);
          fetchCharacter();
        });
    } else {
      fetchCharacter();
    }
  }, [fetchCharacter, loadStreakData, checkLastLogin, manuallyDisconnected]);

  // Fetch today's claimers when connected
  useEffect(() => {
    if (connected) {
      fetchTodaysClaimers();
    }
  }, [connected, fetchTodaysClaimers]);

  const switchToIrysNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: IRYS_TESTNET_CHAIN_ID }],
      });
    } catch (switchError) {
      // This error code means the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: IRYS_TESTNET_CHAIN_ID,
                chainName: 'Irys Testnet',
                nativeCurrency: {
                  name: 'IRYS',
                  symbol: 'IRYS',
                  decimals: 18
                },
                rpcUrls: ['https://testnet-rpc.irys.xyz/v1/execution-rpc'],
                blockExplorerUrls: ['https://testnet-explorer.irys.xyz']
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    
    try {
      setIsLoading(true);
      setError(null);
      
      await switchToIrysNetwork();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setConnected(true);
      setManuallyDisconnected(false);
      checkLastLogin(accounts[0]);
      loadStreakData(accounts[0]);
      localStorage.setItem("connected", "true");
    } catch (err) {
      console.error("Connection error:", err);
      setStatus("❌ Failed to connect wallet");
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    // Clear interval before disconnecting
    if (lastLoginIntervalId) {
      clearInterval(lastLoginIntervalId);
      setLastLoginIntervalId(null);
    }
    
    // Set manually disconnected flag
    setManuallyDisconnected(true);
    
    // Clear connection state
    setConnected(false);
    setAccount("");
    setLastLogin(null);
    setFeed([]);
    setTodaysClaimers([]);
    setCurrentStreak(0);
    setBestStreak(0);
    setStreakDate(null);
    
    // Clear localStorage
    localStorage.removeItem("connected");
    
    // Reset UI
    fetchCharacter();
    
    // Show success message
    setStatus("👋 Disconnected successfully");
    setTimeout(() => setStatus(""), 3000);
  };

  // Enhanced claim animation function
  const triggerClaimAnimation = () => {
    setShowClaimAnimation(true);
    
    // Create and animate the fireworks
    const container = document.createElement("div");
    container.className = "fireworks-container";
    document.body.appendChild(container);
    
    // Create multiple fireworks with random positions and colors - CHANGED TO SOFTER GREENS
    const colors = ["#4ade80", "#34d399", "#10b981", "#047857", "#065f46"];
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const firework = document.createElement("div");
        firework.className = "firework";
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.top = `${20 + Math.random() * 50}%`;
        
        // Create particles for each firework
        for (let j = 0; j < 30; j++) {
          const particle = document.createElement("div");
          particle.className = "particle";
          const color = colors[Math.floor(Math.random() * colors.length)];
          particle.style.backgroundColor = color;
          particle.style.boxShadow = `0 0 6px 1px ${color}`;
          firework.appendChild(particle);
        }
        
        container.appendChild(firework);
        
        // Remove firework after animation
        setTimeout(() => {
          firework.remove();
        }, 2000);
      }, i * 200);
    }
    
    // Remove container after all animations complete
    setTimeout(() => {
      container.remove();
      setShowClaimAnimation(false);
    }, 4000);
    
    // Play a subtle success sound if available
    try {
      const audio = new Audio("/assets/success.mp3");
      audio.volume = 0.3;
      audio.play().catch(e => console.log("Audio play prevented by browser policy"));
    } catch (e) {
      // Silent fallback if audio not available
    }
  };

  const handleLogin = async () => {
    if (!account) {
      setStatus("Please connect your wallet first");
      return;
    }
    
    setStatus("⏳ Processing...");
    setIsLoading(true);
    
    try {
      await switchToIrysNetwork();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DailyLoginABI.abi, signer);
      
      const tx = await contract.dailyLogin();
      setStatus("⏳ Transaction submitted, waiting for confirmation...");
      await tx.wait();
      setStatus("✅ Daily login successful!");
      
      // Update last login
      checkLastLogin(account);
      
      // Update streak data
      const today = new Date().toISOString().split('T')[0];
      
      // Determine if streak continues or starts fresh
      let newStreak = 1;
      if (isStreakValid(streakDate)) {
        newStreak = currentStreak + 1;
      }
      
      // Update streak states
      setCurrentStreak(newStreak);
      setBestStreak(Math.max(newStreak, bestStreak));
      setStreakDate(today);
      
      // Save streak data
      saveStreakData(account, newStreak, Math.max(newStreak, bestStreak), today);
      
      // Play claim animation
      triggerClaimAnimation();
      
      // Add this address to today's claimers with updated streak count
      setTodaysClaimers(prev => {
        // Check if user already exists in the list
        const existingIndex = prev.findIndex(claimer => claimer.address === account);
        if (existingIndex >= 0) {
          // Update existing claimer
          const updatedClaimers = [...prev];
          updatedClaimers[existingIndex] = {
            ...updatedClaimers[existingIndex],
            streak_count: newStreak,
            last_claim_date: today,
            timestamp: Math.floor(Date.now() / 1000),
            formattedTime: 'just now'
          };
          return updatedClaimers;
        } else {
          // Add new claimer
          return [
            {
              address: account,
              streak_count: newStreak,
              last_claim_date: today,
              timestamp: Math.floor(Date.now() / 1000),
              formattedTime: 'just now'
            },
            ...prev
          ];
        }
      });
      
      // Refresh the claimers list
      fetchTodaysClaimers();
      
    } catch (err) {
      console.error(err);
      
      // More specific error handling
      if (err.message && err.message.includes("You've already logged in today")) {
        setStatus("⚠️ You already logged in today");
      } else if (err.code === 'ACTION_REJECTED') {
        setStatus("❌ Transaction rejected by user");
      } else {
        setStatus("❌ Failed to login: " + (err.reason || err.message || "Unknown error"));
      }
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  // Simple toast notification system
  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
    }, 100);
  };

  // Reset error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen">
      <main 
        className={`flex-grow text-gray-100 relative overflow-hidden ${
          !connected ? 'bg-landing' : 'bg-dashboard'
        } bg-fixed bg-cover`}
      >
        {/* Fullscreen claim animation overlay */}
        {showClaimAnimation && (
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
        )}
        
        {/* Character animation on landing page - optimized for all screen sizes */}
        {!connected && (
          <div className="absolute z-10 right-3 xs:right-5 sm:right-10 bottom-3 xs:bottom-5 sm:bottom-10 w-16 xs:w-24 sm:w-32 h-16 xs:h-24 sm:h-32 hidden xs:block">
            <div 
              className={`char-1 animate-float ${characterLoading ? 'opacity-50' : 'opacity-100'}`}
              style={{
                backgroundImage: characterUrl ? `url(${characterUrl})` : "none"
              }}
            ></div>
          </div>
        )}
        
        {/* Fixed header with improved transparency and touch targets */}
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
          <div className="backdrop-blur-md bg-black/10 border-b border-gray-700/30 w-full transition-all duration-300">
            <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-2 xs:py-3 sm:py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold cursor-pointer hover:text-emerald-400 transition-colors">
                  Hirys!
                </h1>
                
                {/* Daily Hirys claim button with enhanced touch target */}
                {connected && (
                  <button
                    id="claim-button"
                    onClick={handleLogin}
                    disabled={lastLogin || isLoading}
                    title={lastLogin ? "You've already claimed your Daily Hirys today" : "Claim your Daily Hirys"}
                    className={`btn-primary text-xs xs:text-sm px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-1.5 sm:py-2 rounded-full flex items-center gap-1 transition-all relative overflow-hidden touch-manipulation min-h-[36px]
                      ${lastLogin ? 'bg-gray-600/70 text-gray-300 opacity-60 cursor-not-allowed' : ''}
                      ${isLoading ? 'opacity-75 cursor-wait' : lastLogin ? 'opacity-60 cursor-not-allowed' : 'hover:bg-emerald-500/80'}`}
                  >
                    {isLoading ? (
                      <span className="inline-block w-3 h-3 xs:w-3.5 sm:w-4 xs:h-3.5 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                    ) : lastLogin ? (
                      <span className="inline-block mr-1">🔥</span>
                    ) : (
                      <span className="inline-block mr-1 animate-pulse-slow">🔥</span>
                    )}
                    <span className="hidden xxs:inline font-bold">{lastLogin ? "Claimed Today!" : "Claim Daily Hirys"}</span>
                    <span className="xxs:hidden font-bold">{lastLogin ? "Claimed!" : "Claim"}</span>
                    
                    {/* Button ripple effect */}
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

        {/* Responsive spacer to prevent content from hiding under fixed header */}
        <div className="h-10 xs:h-12 sm:h-16"></div>

        {/* Error toast with retry button - improved touch target */}
        {error && (
          <div className="fixed top-12 xs:top-14 sm:top-20 right-2 xs:right-3 sm:right-4 bg-rose-500/90 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-md shadow-lg z-50 animate-fade-in flex items-center max-w-[94vw] xs:max-w-[90vw] sm:max-w-md">
            <span className="text-xs xs:text-sm font-normal line-clamp-2">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-2 sm:ml-3 px-2.5 py-1.5 bg-white/20 rounded-md text-xs hover:bg-white/30 shrink-0 touch-manipulation min-h-[32px] min-w-[60px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content section with responsive container widths */}
        <div className="px-3 xs:px-4 sm:px-6 lg:px-8 pb-12 xs:pb-16 sm:pb-20">
          {/* Main content section */}
          {!connected ? (
            <div className="text-center mt-10 xs:mt-16 sm:mt-20 md:mt-24 max-w-[90vw] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl mx-auto relative">
              {/* Animated flame with glow effect */}
              <div className="mb-4 xs:mb-6 sm:mb-8 text-3xl xs:text-4xl sm:text-5xl flex justify-center">
                <div className="relative">
                  <span className="animate-pulse inline-block transform hover:scale-110 transition-transform duration-300">🔥</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 rounded-full filter blur-xl animate-pulse-slow -z-10"></div>
                </div>
              </div>
              
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold mb-2 xs:mb-3 sm:mb-4 text-emerald-400">Welcome to Daily Hirys</h2>
              <p className="text-xs xs:text-sm sm:text-base font-normal text-gray-300/90 mb-4 xs:mb-6 sm:mb-8 leading-relaxed">
                Connect your wallet and say Hirys!
              </p>
              <button 
                onClick={connectWallet}
                className="px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg transform hover:-translate-y-1 text-sm sm:text-base touch-manipulation min-h-[44px] min-w-[180px] font-bold"
              >
                Start Your Hirys!
              </button>
              <p className="text-xs font-normal text-gray-500/90 mt-6 xs:mt-8 sm:mt-12">
                Powered by <a href="https://irys.xyz" className="underline hover:text-emerald-400">Irys</a>
              </p>
            </div>
          ) : (
            <div className="w-full max-w-[90vw] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto mt-4 xs:mt-6 sm:mt-8 space-y-6 xs:space-y-8 sm:space-y-10 px-0 xs:px-1 sm:px-2 relative">
              {/* Character animations on dashboard - responsive placement */}
              <div className="absolute -left-8 xs:-left-12 md:-left-16 top-0 w-16 xs:w-20 h-16 xs:h-20 hidden md:block">
                <div className="char-1 animate-float-slow"></div>
              </div>
              <div className="absolute -right-8 xs:-right-12 md:-right-16 top-40 w-20 xs:w-24 h-20 xs:h-24 hidden md:block">
                <div className="char-2 animate-bounce-slow"></div>
              </div>
              
              {/* Streak Counter - enhanced responsiveness */}
              <div className="p-2.5 xs:p-3 sm:p-4 border border-gray-700/50 rounded-lg bg-black/30 backdrop-blur-sm flex flex-wrap xs:flex-nowrap justify-between items-center gap-2 xs:gap-3">
                <div className="flex items-center w-full xs:w-auto">
                  <div className="text-xl xs:text-2xl sm:text-3xl mr-2 xs:mr-2.5 sm:mr-3">🔥</div>
                  <div>
                    <div className="text-xs xs:text-sm sm:text-base font-normal text-gray-200">Current Streak</div>
                    <div className="text-lg xs:text-xl sm:text-2xl font-bold text-emerald-400">{currentStreak} days</div>
                  </div>
                </div>
                <div className="border-t xs:border-l border-t-gray-700/50 xs:border-t-0 pt-2 xs:pt-0 xs:pl-3 xs:ml-3 w-full xs:w-auto flex justify-between xs:block">
                  <div className="text-xs xs:text-sm sm:text-base font-normal text-gray-200">Best Streak</div>
                  <div className="text-base xs:text-lg sm:text-xl font-bold text-emerald-400">{bestStreak} days</div>
                </div>
              </div>
              
              {/* Daily information - improved touch targets and spacing */}
              <div className="p-3 xs:p-4 sm:p-5 md:p-6 border border-gray-700/50 rounded-lg bg-black/30 backdrop-blur-sm">
                <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-2 xs:mb-3 sm:mb-4 text-emerald-400">Your Daily Login</h2>
                <p className="text-xs xs:text-sm sm:text-base font-normal text-gray-300/90 mb-2 xs:mb-3">
                  Welcome back, <span className="text-gray-100 font-medium">{account.slice(0, 6)}...{account.slice(-4)}</span>!
                </p>
                
                {lastLogin ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 xs:p-3 sm:p-4 mb-3 xs:mb-4">
                    <div className="flex items-center">
                      <div className="text-lg xs:text-xl sm:text-2xl mr-2 xs:mr-2.5 sm:mr-3">✅</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs xs:text-sm sm:text-base font-bold">You've already logged in today!</div>
                        <div className="text-xs sm:text-sm font-normal text-gray-300/90 truncate">{lastLogin}</div>
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
                        <div className="text-xs xs:text-sm sm:text-base font-bold">You haven't logged in today yet</div>
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
                  disabled={lastLogin || isLoading}
                  className={`w-full py-2.5 xs:py-3 sm:py-3.5 rounded-lg text-xs xs:text-sm sm:text-base font-bold transition-all relative overflow-hidden touch-manipulation min-h-[44px]
                    ${lastLogin 
                      ? 'bg-gray-600/70 text-gray-300 opacity-60 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-600'}`}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-3 h-3 xs:w-3.5 sm:w-4 xs:h-3.5 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Processing...
                    </>
                  ) : lastLogin ? (
                    <>Already Claimed Today</>
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
              </div>
              
              {/* Today's claimers section - fully responsive with optimized scrolling */}
              <div>
                <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-2 xs:mb-3 sm:mb-4 flex items-center">
                  <span className="mr-2">Today's Claimers</span>
                  {loadingClaimers && (
                    <span className="inline-block w-3 h-3 xs:w-3.5 sm:w-4 xs:h-3.5 sm:h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                  )}
                </h2>
                
                {todaysClaimers.length === 0 ? (
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
                      {todaysClaimers.map((claimer, index) => (
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
                              <div className="ml-2 text-xs text-gray-400/90 hidden xs:block font-normal">{claimer.formattedTime || formatTimeAgo(claimer.last_claim_date)}</div>
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
            </div>
          )}
        </div>
      </main>
      
     {/* Footer - fully responsive with better spacing */}
     <footer className="w-full backdrop-blur-md bg-black/10 border-t border-gray-700/30">
        <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 sm:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-3 xs:mb-4">
            <div className="mb-3 xs:mb-4 md:mb-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                <span className="text-base xs:text-lg sm:text-xl font-bold text-emerald-400">Hirys!</span>
                <span className="text-xs sm:text-sm ml-2 font-normal text-gray-300/90">Your daily onchain</span>
              </div>
              <p className="text-xs font-normal text-gray-400/90 mt-1 xs:mt-1.5 sm:mt-2">
                don't forget to say Hirys!
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-2 xs:space-x-3 sm:space-x-4 mb-1.5 xs:mb-2">
                <a href="https://x.com/zackymrf_" className="text-xs sm:text-sm font-normal text-gray-300/90 hover:text-emerald-400 transition-colors touch-manipulation px-1.5 py-1" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://discord.com/zackymrf" className="text-xs sm:text-sm font-normal text-gray-300/90 hover:text-emerald-400 transition-colors touch-manipulation px-1.5 py-1" target="_blank" rel="noopener noreferrer">Discord</a>
                <a href="https://github.com/zackymrf" className="text-xs sm:text-sm font-normal text-gray-300/90 hover:text-emerald-400 transition-colors touch-manipulation px-1.5 py-1" target="_blank" rel="noopener noreferrer">GitHub</a>
              </div>
              <div className="flex items-center">
                <span className="text-xs sm:text-sm font-normal text-gray-300/90">Created by</span>
                <span className="text-xs sm:text-sm ml-2 text-emerald-400 font-bold">Zackymrf</span>
              </div>
            </div>
          </div>
          <div className="text-center border-t border-gray-700/30 pt-2.5 xs:pt-3 sm:pt-4">
            <p className="text-xs font-normal text-gray-400/90">
              Powered by <a href="https://irys.xyz" className="text-gray-300/90 hover:text-emerald-400 transition-colors touch-manipulation" target="_blank" rel="noopener noreferrer">Irys</a> • © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;