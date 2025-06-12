import { useState, useCallback } from 'react';

export const useStreak = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streakDate, setStreakDate] = useState(null);

  const loadStreakData = useCallback((userAccount) => {
    if (!userAccount) return;
    
    try {
      const streakData = localStorage.getItem(`streak_${userAccount.toLowerCase()}`);
      console.log(`Loading streak data for ${userAccount}:`, streakData);
      
      if (streakData) {
        const { currentStreak, bestStreak, lastLoginDate } = JSON.parse(streakData);
        const parsedCurrentStreak = parseInt(currentStreak) || 0;
        const parsedBestStreak = parseInt(bestStreak) || 0;
        
        setCurrentStreak(parsedCurrentStreak);
        setBestStreak(parsedBestStreak);
        setStreakDate(lastLoginDate || null);
        
        console.log(`Loaded streak data: current=${parsedCurrentStreak}, best=${parsedBestStreak}, date=${lastLoginDate}`);
      } else {
        console.log(`No streak data found for ${userAccount}, resetting to 0`);
        setCurrentStreak(0);
        setBestStreak(0);
        setStreakDate(null);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
      setCurrentStreak(0);
      setBestStreak(0);
      setStreakDate(null);
    }
  }, []);

  const saveStreakData = useCallback((userAccount, currentStreak, bestStreak, lastLoginDate) => {
    if (!userAccount) return;
    
    try {
      const data = {
        currentStreak: parseInt(currentStreak) || 0,
        bestStreak: parseInt(bestStreak) || 0,
        lastLoginDate: lastLoginDate
      };
      
      localStorage.setItem(`streak_${userAccount.toLowerCase()}`, JSON.stringify(data));
      console.log(`Saved streak data for ${userAccount}:`, data);
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  }, []);

  const isStreakValid = useCallback((lastLoginDate) => {
    if (!lastLoginDate) return false;
    
    try {
      const lastDate = new Date(lastLoginDate);
      const today = new Date();
      
      // Set both dates to start of day for accurate comparison
      lastDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isValid = lastDate.getTime() === yesterday.getTime();
      console.log(`Streak validation: lastDate=${lastDate.toDateString()}, yesterday=${yesterday.toDateString()}, valid=${isValid}`);
      
      return isValid;
    } catch (error) {
      console.error('Error validating streak:', error);
      return false;
    }
  }, []);

  const hasLoggedInToday = useCallback((lastLoginDate) => {
    if (!lastLoginDate) return false;
    
    try {
      const lastDate = new Date(lastLoginDate);
      const today = new Date();
      
      // Set both to start of day
      lastDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const loggedToday = lastDate.getTime() === today.getTime();
      console.log(`Today login check: lastDate=${lastDate.toDateString()}, today=${today.toDateString()}, loggedToday=${loggedToday}`);
      
      return loggedToday;
    } catch (error) {
      console.error('Error checking today login:', error);
      return false;
    }
  }, []);

  const updateStreak = useCallback((account, currentStreakDate) => {
    if (!account) return 0;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log(`Updating streak for ${account}, currentStreakDate=${currentStreakDate}, today=${today}`);
      
      // Don't update if already logged in today
      if (hasLoggedInToday(currentStreakDate)) {
        console.log("Already logged in today, not updating streak");
        return currentStreak;
      }
      
      let newStreak = 1; // Default to 1 for new login
      
      // Check if streak should continue
      if (isStreakValid(currentStreakDate)) {
        newStreak = currentStreak + 1;
        console.log(`Continuing streak: ${currentStreak} -> ${newStreak}`);
      } else {
        console.log(`Starting new streak: ${newStreak}`);
      }
      
      // Update states
      const newBestStreak = Math.max(newStreak, bestStreak);
      setCurrentStreak(newStreak);
      setBestStreak(newBestStreak);
      setStreakDate(today);
      
      // Save to localStorage
      saveStreakData(account, newStreak, newBestStreak, today);
      
      return newStreak;
    } catch (error) {
      console.error('Error updating streak:', error);
      return currentStreak;
    }
  }, [currentStreak, bestStreak, isStreakValid, hasLoggedInToday, saveStreakData]);

  // Check and update streak on load (for detecting missed days)
  const checkStreakStatus = useCallback((account) => {
    if (!account || !streakDate) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastLoginDate = new Date(streakDate);
      const todayDate = new Date(today);
      
      // Set to start of day
      lastLoginDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((todayDate - lastLoginDate) / (1000 * 60 * 60 * 24));
      console.log(`Checking streak status: daysDiff=${daysDiff}, currentStreak=${currentStreak}`);
      
      // If more than 1 day has passed without login, reset streak
      if (daysDiff > 1 && currentStreak > 0) {
        console.log(`Streak broken - ${daysDiff} days passed. Resetting to 0.`);
        setCurrentStreak(0);
        saveStreakData(account, 0, bestStreak, streakDate);
      }
    } catch (error) {
      console.error('Error checking streak status:', error);
    }
  }, [streakDate, currentStreak, bestStreak, saveStreakData]);

  // Force reload streak data
  const forceReloadStreak = useCallback((account) => {
    if (!account) return;
    loadStreakData(account);
  }, [loadStreakData]);

  return {
    currentStreak,
    bestStreak,
    streakDate,
    setCurrentStreak,
    setBestStreak,
    setStreakDate,
    loadStreakData,
    saveStreakData,
    isStreakValid,
    hasLoggedInToday,
    updateStreak,
    checkStreakStatus,
    forceReloadStreak
  };
};