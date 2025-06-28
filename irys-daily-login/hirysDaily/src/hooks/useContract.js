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
    if (!userAccount) {
      console.log('❌ No account provided for checkLastLogin');
      return;
    }
    
    try {
      console.log('🔍 Checking last login for:', userAccount);
      
      if (lastLoginIntervalId) {
        clearInterval(lastLoginIntervalId);
        setLastLoginIntervalId(null);
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DailyLoginABI.abi, provider);
      
      console.log('📞 Calling contract.lastLoginTs...');
      const timestamp = await contract.lastLoginTs(userAccount);
      console.log('⏰ Last login timestamp:', timestamp.toString());
      
      if (timestamp > 0) {
        const loginDate = new Date(Number(timestamp) * 1000);
        console.log('📅 Last login date:', loginDate);
        
        const nextClaim = new Date(loginDate);
        nextClaim.setHours(nextClaim.getHours() + 24);
        setNextClaimTime(nextClaim);
        console.log('⏳ Next claim time:', nextClaim);
        
        const formattedDate = loginDate.toLocaleString();
        const timeAgo = formatTimeAgo(loginDate);
        setLastLogin(`${formattedDate} (${timeAgo})`);
        
        const newIntervalId = setInterval(() => {
          const updatedTimeAgo = formatTimeAgo(loginDate);
          setLastLogin(`${formattedDate} (${updatedTimeAgo})`);
        }, 60000);
        
        setLastLoginIntervalId(newIntervalId);
      } else {
        console.log('✨ No previous login found, user can claim immediately');
        setNextClaimTime(new Date());
        setLastLogin(null);
      }
    } catch (err) {
      console.error("❌ Error checking last login:", err);
      // Set fallback values so user can still try to claim
      setNextClaimTime(new Date());
      setLastLogin(null);
    }
  }, [formatTimeAgo, lastLoginIntervalId]);

  const dailyLogin = async (switchToIrysNetwork) => {
    console.log('🚀 Starting daily login transaction...');
    
    try {
      // Ensure we're on the correct network first
      console.log('🔄 Ensuring correct network...');
      await switchToIrysNetwork();
      
      // Get provider and signer
      console.log('🔗 Getting provider and signer...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      console.log('📄 Creating contract instance...');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DailyLoginABI.abi, signer);
      
      // Check if user can claim (optional check)
      const userAddress = await signer.getAddress();
      console.log('👤 User address:', userAddress);
      
      // Execute the daily login transaction
      console.log('📤 Sending dailyLogin transaction...');
      const tx = await contract.dailyLogin();
      console.log('⏳ Transaction sent, hash:', tx.hash);
      
      // Wait for confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed! Block:', receipt.blockNumber);
      
      // Update next claim time
      const nextClaim = new Date();
      nextClaim.setHours(nextClaim.getHours() + 24);
      setNextClaimTime(nextClaim);
      console.log('⏰ Next claim time set to:', nextClaim);
      
      return tx;
    } catch (err) {
      console.error('❌ Daily login error:', err);
      
      // Enhanced error handling
      if (err.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by user');
      } else if (err.message && err.message.includes("You've already logged in today")) {
        throw new Error("You've already logged in today. Please wait 24 hours.");
      } else if (err.message && err.message.includes('insufficient funds')) {
        throw new Error('Insufficient IRYS for gas fees. Please add some IRYS to your wallet.');
      } else if (err.message && err.message.includes('network')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(err.reason || err.message || 'Transaction failed');
      }
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