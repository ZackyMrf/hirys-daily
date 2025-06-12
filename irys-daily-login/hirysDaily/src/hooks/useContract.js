import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import DailyLoginABI from '../abi/DailyLoginABI.json';

const CONTRACT_ADDRESS = '0xE6466700214a9cc8b76653af4a1D99ECE009645d';

export const useContract = () => {
  const [lastLogin, setLastLogin] = useState(null);
  const [nextClaimTime, setNextClaimTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [lastLoginIntervalId, setLastLoginIntervalId] = useState(null);

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
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }, []);

  const checkLastLogin = useCallback(async (userAccount) => {
    if (!userAccount) return;
    
    try {
      if (lastLoginIntervalId) {
        clearInterval(lastLoginIntervalId);
        setLastLoginIntervalId(null);
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DailyLoginABI.abi, provider);
      const timestamp = await contract.lastLoginTs(userAccount);
      
      if (timestamp > 0) {
        const loginDate = new Date(Number(timestamp) * 1000);
        
        const nextClaim = new Date(loginDate);
        nextClaim.setHours(nextClaim.getHours() + 24);
        setNextClaimTime(nextClaim);
        
        const formattedDate = loginDate.toLocaleString();
        const timeAgo = formatTimeAgo(loginDate);
        setLastLogin(`${formattedDate} (${timeAgo})`);
        
        const newIntervalId = setInterval(() => {
          const updatedTimeAgo = formatTimeAgo(loginDate);
          setLastLogin(`${formattedDate} (${updatedTimeAgo})`);
        }, 60000);
        
        setLastLoginIntervalId(newIntervalId);
      } else {
        setNextClaimTime(new Date());
      }
    } catch (err) {
      console.error("Error checking last login:", err);
    }
  }, [formatTimeAgo, lastLoginIntervalId]);

  const dailyLogin = async (switchToIrysNetwork) => {
    try {
      await switchToIrysNetwork();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DailyLoginABI.abi, signer);
      
      const tx = await contract.dailyLogin();
      await tx.wait();
      
      const nextClaim = new Date();
      nextClaim.setHours(nextClaim.getHours() + 24);
      setNextClaimTime(nextClaim);
      
      return tx;
    } catch (err) {
      throw err;
    }
  };

  return {
    lastLogin,
    nextClaimTime,
    timeRemaining,
    setTimeRemaining,
    setLastLogin,
    checkLastLogin,
    dailyLogin,
    formatTimeAgo,
    CONTRACT_ADDRESS
  };
};