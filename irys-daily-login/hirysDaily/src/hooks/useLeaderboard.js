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

  // Get streak data for a specific address
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

  // Fetch today's claimers (only for today)
  const fetchTodaysClaimers = useCallback(async () => {
    try {
      setLoadingClaimers(true);
      console.log('Fetching today\'s claimers...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DailyLoginABI.abi, provider);
      
      // Get today's start timestamp
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = Math.floor(today.getTime() / 1000);
      
      const filter = contract.filters.Login();
      const events = await contract.queryFilter(filter, -10000);
      
      // Filter only today's events
      const todaysEvents = events.filter(event => {
        const timestamp = Number(event.args.timestamp);
        return timestamp >= startOfDay;
      });
      
      console.log(`Found ${todaysEvents.length} events for today`);
      
      const claimerMap = {};
      
      // Process today's events
      for (const event of todaysEvents) {
        const address = event.args.user;
        const timestamp = Number(event.args.timestamp);
        
        claimerMap[address.toLowerCase()] = {
          address,
          timestamp,
          formattedTime: formatTimeAgo(new Date(timestamp * 1000)),
          last_claim_date: new Date(timestamp * 1000).toISOString()
        };
      }
      
      const claimers = Object.values(claimerMap);
      
      // Get current streak for each claimer
      for (const claimer of claimers) {
        claimer.streak_count = getStreakForAddress(claimer.address);
        console.log(`Claimer ${claimer.address} has streak: ${claimer.streak_count}`);
      }
      
      // Sort by timestamp (most recent first)
      claimers.sort((a, b) => b.timestamp - a.timestamp);
      setTodaysClaimers(claimers);
      
      console.log('Today\'s claimers updated:', claimers);
      
    } catch (error) {
      console.error("Failed to fetch today's claimers:", error);
    } finally {
      setLoadingClaimers(false);
    }
  }, [formatTimeAgo, getStreakForAddress]);

  // Fetch all-time streak leaders
  const fetchAllTimeLeaders = useCallback(() => {
    try {
      setLoadingLeaders(true);
      console.log('Fetching all-time leaders...');
      
      const allUsers = [];
      
      // Get all streak data from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('streak_')) {
          const address = key.replace('streak_', '');
          const data = localStorage.getItem(key);
          
          if (data) {
            try {
              const parsedData = JSON.parse(data);
              const currentStreak = parseInt(parsedData.currentStreak) || 0;
              const bestStreak = parseInt(parsedData.bestStreak) || 0;
              
              // Only include users with meaningful streaks
              if (bestStreak > 0) {
                allUsers.push({
                  address: address,
                  bestStreak: bestStreak,
                  currentStreak: currentStreak,
                  lastLoginDate: parsedData.lastLoginDate,
                  isActive: currentStreak > 0 // Check if currently active
                });
              }
            } catch (parseError) {
              console.error(`Error parsing data for ${address}:`, parseError);
            }
          }
        }
      }
      
      console.log(`Found ${allUsers.length} users with streak data`);
      
      // Sort by best streak (descending), then by current streak
      allUsers.sort((a, b) => {
        if (b.bestStreak !== a.bestStreak) {
          return b.bestStreak - a.bestStreak;
        }
        return b.currentStreak - a.currentStreak;
      });
      
      // Take top 20 to show more users
      const topUsers = allUsers.slice(0, 20);
      setAllTimeLeaders(topUsers);
      
      console.log('All-time leaders updated:', topUsers);
      
    } catch (error) {
      console.error("Failed to fetch all-time leaders:", error);
    } finally {
      setLoadingLeaders(false);
    }
  }, []);

  // Add a new claimer to today's list
  const addTodaysClaimer = useCallback((newClaimer) => {
    console.log('Adding today\'s claimer:', newClaimer);
    
    setTodaysClaimers(prev => {
      const existingIndex = prev.findIndex(claimer => 
        claimer.address.toLowerCase() === newClaimer.address.toLowerCase()
      );
      let updatedClaimers;
      
      if (existingIndex >= 0) {
        // Update existing claimer
        updatedClaimers = [...prev];
        updatedClaimers[existingIndex] = {
          ...updatedClaimers[existingIndex],
          ...newClaimer,
          formattedTime: 'just now'
        };
      } else {
        // Add new claimer to the beginning
        updatedClaimers = [
          {
            ...newClaimer,
            formattedTime: 'just now'
          },
          ...prev
        ];
      }
      
      // Sort by timestamp (most recent first)
      updatedClaimers.sort((a, b) => b.timestamp - a.timestamp);
      
      return updatedClaimers;
    });
  }, []);

  // Update time display periodically
  const updateTimeDisplays = useCallback(() => {
    setTodaysClaimers(prev => 
      prev.map(claimer => ({
        ...claimer,
        formattedTime: formatTimeAgo(new Date(claimer.timestamp * 1000))
      }))
    );
  }, [formatTimeAgo]);

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
    formatTimeAgo
  };
};