import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import DailyLoginABI from '../abi/DailyLoginABI.json';

const CONTRACT_ADDRESS = '0xE6466700214a9cc8b76653af4a1D99ECE009645d';

export const useLeaderboard = () => {
  const [todaysClaimers, setTodaysClaimers] = useState([]);
  const [allTimeLeaders, setAllTimeLeaders] = useState([]);
  const [loadingClaimers, setLoadingClaimers] = useState(false);
  const [loadingLeaders, setLoadingLeaders] = useState(false);

  const formatTimeAgo = useCallback((date) => {
    if (!date) return '';
    
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
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }, []);

  // FIXED: Accurate claims tracking - only count unique days
  const saveUserToLeaderboard = useCallback((address, claimData) => {
    try {
      const key = `leaderboard_user_${address.toLowerCase()}`;
      const existingData = localStorage.getItem(key);
      const todayDate = claimData.date || new Date().toISOString().split('T')[0];
      
      let userData = {
        address: address,
        totalClaims: 1, // This will be the count of unique claim days
        firstClaimDate: claimData.timestamp,
        lastClaimDate: claimData.timestamp,
        claimDates: [todayDate], // Array of unique claim dates
        lastUpdated: Date.now()
      };
      
      if (existingData) {
        const parsed = JSON.parse(existingData);
        const existingDates = parsed.claimDates || [];
        
        // CRITICAL: Only count as new claim if it's a genuinely new day
        const isNewDay = !existingDates.includes(todayDate);
        
        userData = {
          ...parsed,
          lastClaimDate: claimData.timestamp,
          lastUpdated: Date.now()
        };
        
        if (isNewDay) {
          // Only increment claims and add date if it's actually a new day
          userData.claimDates = [...existingDates, todayDate];
          userData.totalClaims = userData.claimDates.length; // Accurate count based on unique dates
          console.log(`📅 NEW CLAIM DAY for ${address}: ${todayDate} (Total: ${userData.totalClaims})`);
        } else {
          // Same day claim - don't increment
          userData.claimDates = existingDates;
          userData.totalClaims = existingDates.length;
          console.log(`⚠️ SAME DAY CLAIM for ${address}: ${todayDate} (Total remains: ${userData.totalClaims})`);
        }
      }
      
      // Always sync with current streak data
      const streakData = localStorage.getItem(`streak_${address.toLowerCase()}`);
      if (streakData) {
        const { currentStreak, bestStreak } = JSON.parse(streakData);
        userData.currentStreak = parseInt(currentStreak) || 0;
        userData.bestStreak = parseInt(bestStreak) || 0;
      } else {
        userData.currentStreak = 1;
        userData.bestStreak = 1;
      }
      
      localStorage.setItem(key, JSON.stringify(userData));
      console.log(`✅ Saved user ${address.slice(0, 6)}...${address.slice(-4)} - Claims: ${userData.totalClaims}, Dates: ${userData.claimDates}`);
      
    } catch (error) {
      console.error('❌ Error saving user to leaderboard:', error);
    }
  }, []);

  // Get streak data with fallback
  const getStreakForAddress = useCallback((address) => {
    try {
      const streakData = localStorage.getItem(`streak_${address.toLowerCase()}`);
      if (streakData) {
        const { currentStreak } = JSON.parse(streakData);
        return parseInt(currentStreak) || 1;
      }
      return 1;
    } catch (error) {
      console.error(`Error getting streak for ${address}:`, error);
      return 1;
    }
  }, []);

  // Fetch today's claimers
  const fetchTodaysClaimers = useCallback(async () => {
    try {
      setLoadingClaimers(true);
      console.log('🔍 Fetching today\'s claimers...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DailyLoginABI.abi, provider);
      
      // Get today's start timestamp
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = Math.floor(today.getTime() / 1000);
      const todayDate = new Date().toISOString().split('T')[0];
      
      const filter = contract.filters.Login();
      const events = await contract.queryFilter(filter, -10000);
      
      // Filter only today's events
      const todaysEvents = events.filter(event => {
        const timestamp = Number(event.args.timestamp);
        return timestamp >= startOfDay;
      });
      
      console.log(`📅 Found ${todaysEvents.length} events for today (${todayDate})`);
      
      const claimerMap = {};
      const processedAddresses = new Set();
      
      // Process today's events - only process each address ONCE per day
      for (const event of todaysEvents) {
        const address = event.args.user;
        const timestamp = Number(event.args.timestamp);
        
        // Only take the FIRST claim of the day for each address
        if (!claimerMap[address.toLowerCase()]) {
          claimerMap[address.toLowerCase()] = {
            address,
            timestamp,
            formattedTime: formatTimeAgo(new Date(timestamp * 1000)),
            last_claim_date: new Date(timestamp * 1000).toISOString()
          };
          
          // Save to permanent leaderboard only once per day per address
          if (!processedAddresses.has(address.toLowerCase())) {
            saveUserToLeaderboard(address, {
              timestamp,
              date: todayDate
            });
            processedAddresses.add(address.toLowerCase());
          }
        }
      }
      
      const claimers = Object.values(claimerMap);
      
      // Get current streak for each claimer
      for (const claimer of claimers) {
        claimer.streak_count = getStreakForAddress(claimer.address);
      }
      
      // Sort by timestamp (most recent first)
      claimers.sort((a, b) => b.timestamp - a.timestamp);
      setTodaysClaimers(claimers);
      
      console.log(`✅ Today's claimers updated: ${claimers.length} unique users`);
      
      // Refresh all-time leaderboard
      setTimeout(() => {
        fetchAllTimeLeaders();
      }, 500);
      
    } catch (error) {
      console.error("❌ Failed to fetch today's claimers:", error);
    } finally {
      setLoadingClaimers(false);
    }
  }, [formatTimeAgo, getStreakForAddress, saveUserToLeaderboard]);

  // FIXED: All-time leaderboard with accurate claims counting
  const fetchAllTimeLeaders = useCallback(() => {
    try {
      setLoadingLeaders(true);
      console.log('🏆 Fetching all-time leaders with accurate claims...');
      
      const allUsers = new Map();
      
      // STEP 1: Get all leaderboard user data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('leaderboard_user_')) {
          const address = key.replace('leaderboard_user_', '');
          const userData = localStorage.getItem(key);
          
          if (userData) {
            try {
              const parsedData = JSON.parse(userData);
              
              // ACCURATE CLAIMS: Use claimDates length for precise counting
              const uniqueClaimDays = parsedData.claimDates || [];
              const totalClaims = uniqueClaimDays.length;
              
              allUsers.set(address, {
                address: address,
                totalClaims: totalClaims, // Accurate count of unique claim days
                firstClaimDate: parsedData.firstClaimDate,
                lastClaimDate: parsedData.lastClaimDate,
                claimDates: uniqueClaimDays,
                activeDays: totalClaims, // Same as totalClaims for unique days
                currentStreak: 0,
                bestStreak: 0,
                isActive: false,
                source: 'leaderboard'
              });
              
              console.log(`📊 User ${address.slice(0, 6)}...${address.slice(-4)}: ${totalClaims} unique claim days`);
              
            } catch (parseError) {
              console.error(`❌ Error parsing leaderboard data for ${address}:`, parseError);
            }
          }
        }
      }
      
      // STEP 2: Update with latest streak data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('streak_')) {
          const address = key.replace('streak_', '');
          const streakData = localStorage.getItem(key);
          
          if (streakData) {
            try {
              const parsedStreak = JSON.parse(streakData);
              const currentStreak = parseInt(parsedStreak.currentStreak) || 0;
              const bestStreak = parseInt(parsedStreak.bestStreak) || 0;
              
              if (allUsers.has(address)) {
                // Update existing user with streak data
                const user = allUsers.get(address);
                user.currentStreak = currentStreak;
                user.bestStreak = Math.max(bestStreak, user.bestStreak || 0);
                user.isActive = currentStreak > 0;
                user.lastLoginDate = parsedStreak.lastLoginDate;
              } else if (bestStreak > 0) {
                // Add user who has streak data but no leaderboard data yet
                allUsers.set(address, {
                  address: address,
                  totalClaims: Math.max(currentStreak, 1), // Fallback estimate
                  currentStreak: currentStreak,
                  bestStreak: bestStreak,
                  lastLoginDate: parsedStreak.lastLoginDate,
                  isActive: currentStreak > 0,
                  activeDays: Math.max(currentStreak, 1),
                  source: 'streak_only'
                });
              }
              
            } catch (parseError) {
              console.error(`❌ Error parsing streak data for ${address}:`, parseError);
            }
          }
        }
      }
      
      // STEP 3: Filter and sort users
      const validUsers = Array.from(allUsers.values()).filter(user => {
        return user.bestStreak > 0 || user.totalClaims > 0;
      });
      
      console.log(`📊 Found ${validUsers.length} users in leaderboard`);
      
      // Sort by: Best Streak → Current Streak → Total Claims → Active Days
      validUsers.sort((a, b) => {
        if (b.bestStreak !== a.bestStreak) {
          return b.bestStreak - a.bestStreak;
        }
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        if (b.totalClaims !== a.totalClaims) {
          return b.totalClaims - a.totalClaims;
        }
        return (b.activeDays || 0) - (a.activeDays || 0);
      });
      
      const topUsers = validUsers.slice(0, 100);
      setAllTimeLeaders(topUsers);
      
      console.log(`✅ All-time leaderboard updated with ${topUsers.length} users`);
      console.log('🔥 Top 5 users:', topUsers.slice(0, 5).map(u => ({
        address: u.address.slice(0, 6) + '...' + u.address.slice(-4),
        bestStreak: u.bestStreak,
        currentStreak: u.currentStreak,
        totalClaims: u.totalClaims
      })));
      
    } catch (error) {
      console.error("❌ Failed to fetch all-time leaders:", error);
    } finally {
      setLoadingLeaders(false);
    }
  }, []);

  // FIXED: Add today's claimer - prevent duplicate counting
  const addTodaysClaimer = useCallback((newClaimer) => {
    console.log('➕ Adding today\'s claimer:', newClaimer);
    
    // Add to today's claimers (only if not already there for today)
    setTodaysClaimers(prev => {
      const existingIndex = prev.findIndex(claimer => 
        claimer.address.toLowerCase() === newClaimer.address.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        // User already in today's list - just update timestamp if newer
        const updatedClaimers = [...prev];
        if (newClaimer.timestamp > updatedClaimers[existingIndex].timestamp) {
          updatedClaimers[existingIndex] = {
            ...updatedClaimers[existingIndex],
            ...newClaimer,
            formattedTime: 'just now'
          };
        }
        return updatedClaimers.sort((a, b) => b.timestamp - a.timestamp);
      } else {
        // New claimer for today
        const updatedClaimers = [
          {
            ...newClaimer,
            formattedTime: 'just now'
          },
          ...prev
        ];
        return updatedClaimers.sort((a, b) => b.timestamp - a.timestamp);
      }
    });
    
    // Save to permanent leaderboard (will handle duplicate day detection)
    const todayDate = new Date().toISOString().split('T')[0];
    saveUserToLeaderboard(newClaimer.address, {
      timestamp: newClaimer.timestamp,
      date: todayDate
    });
    
    // Refresh all-time leaders
    setTimeout(() => {
      fetchAllTimeLeaders();
    }, 100);
    
  }, [saveUserToLeaderboard, fetchAllTimeLeaders]);

  // Update time display periodically
  const updateTimeDisplays = useCallback(() => {
    setTodaysClaimers(prev => 
      prev.map(claimer => ({
        ...claimer,
        formattedTime: formatTimeAgo(new Date(claimer.timestamp * 1000))
      }))
    );
  }, [formatTimeAgo]);

  // Sync all blockchain data with proper claims counting
  const syncAllDataToLeaderboard = useCallback(async () => {
    try {
      console.log('🔄 Syncing all blockchain data with accurate claims counting...');
      setLoadingLeaders(true);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DailyLoginABI.abi, provider);
      
      const filter = contract.filters.Login();
      const allEvents = await contract.queryFilter(filter, -100000);
      
      console.log(`📜 Found ${allEvents.length} total login events`);
      
      // Process events by address and date
      const userDailyActivity = new Map();
      
      for (const event of allEvents) {
        const address = event.args.user.toLowerCase();
        const timestamp = Number(event.args.timestamp);
        const date = new Date(timestamp * 1000).toISOString().split('T')[0];
        
        if (!userDailyActivity.has(address)) {
          userDailyActivity.set(address, new Set());
        }
        
        // Add unique date for this user
        userDailyActivity.get(address).add(date);
      }
      
      // Save accurate data to leaderboard
      for (const [address, dates] of userDailyActivity) {
        const sortedDates = Array.from(dates).sort();
        const firstDate = sortedDates[0];
        const lastDate = sortedDates[sortedDates.length - 1];
        
        // Find timestamps for first and last claims
        const firstEvent = allEvents.find(e => 
          e.args.user.toLowerCase() === address && 
          new Date(Number(e.args.timestamp) * 1000).toISOString().split('T')[0] === firstDate
        );
        const lastEvent = allEvents.reverse().find(e => 
          e.args.user.toLowerCase() === address && 
          new Date(Number(e.args.timestamp) * 1000).toISOString().split('T')[0] === lastDate
        );
        
        // Save user data with accurate claims count
        const userData = {
          address: address,
          totalClaims: dates.size, // Exact count of unique claim days
          firstClaimDate: firstEvent ? Number(firstEvent.args.timestamp) : null,
          lastClaimDate: lastEvent ? Number(lastEvent.args.timestamp) : null,
          claimDates: sortedDates,
          lastUpdated: Date.now()
        };
        
        localStorage.setItem(`leaderboard_user_${address}`, JSON.stringify(userData));
        console.log(`💾 Synced ${address.slice(0, 6)}...${address.slice(-4)}: ${dates.size} unique days`);
      }
      
      console.log(`✅ Synced ${userDailyActivity.size} unique addresses with accurate claims`);
      
      // Refresh leaderboards
      await fetchTodaysClaimers();
      setTimeout(() => {
        fetchAllTimeLeaders();
      }, 1000);
      
      console.log('🎉 Accurate blockchain data sync completed');
      
    } catch (error) {
      console.error('❌ Error syncing blockchain data:', error);
    } finally {
      setLoadingLeaders(false);
    }
  }, [saveUserToLeaderboard, fetchTodaysClaimers, fetchAllTimeLeaders]);

  return {
    todaysClaimers,
    allTimeLeaders,
    loadingClaimers,
    loadingLeaders,
    setTodaysClaimers,
    fetchTodaysClaimers,
    fetchAllTimeLeaders,
    addTodaysClaimer,
    updateTimeDisplays,
    syncAllDataToLeaderboard,
    saveUserToLeaderboard,
    formatTimeAgo
  };
};