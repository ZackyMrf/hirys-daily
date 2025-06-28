import { useState, useEffect, useCallback } from 'react';

const IRYS_TESTNET_CHAIN_ID = '0x4f6'; // Hex for 1270

export const useWallet = () => {
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);
  const [chainId, setChainId] = useState(null);

  // Enhanced network switching with correct Irys network configuration
  const switchToIrysNetwork = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }
    
    try {
      console.log('🔄 Attempting to switch to Irys Testnet...');
      
      // Check if already on correct network
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId === IRYS_TESTNET_CHAIN_ID) {
        console.log('✅ Already on Irys Testnet');
        return true;
      }
      
      // Try to switch to Irys network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: IRYS_TESTNET_CHAIN_ID }],
      });
      
      console.log('✅ Successfully switched to Irys Testnet');
      return true;
    } catch (switchError) {
      console.log('⚠️ Switch error:', switchError);
      
      // If network doesn't exist (code 4902) or method not found (-32603), add it
      if (switchError.code === 4902 || switchError.code === -32603) {
        try {
          console.log('📡 Adding Irys Testnet to MetaMask...');
          
          const networkConfig = {
            chainId: IRYS_TESTNET_CHAIN_ID,
            chainName: 'Irys Testnet',
            nativeCurrency: {
              name: 'IRYS',
              symbol: 'IRYS',
              decimals: 18
            },
            rpcUrls: ['https://testnet-rpc.irys.xyz/v1/execution-rpc'],
            blockExplorerUrls: ['https://testnet-explorer.irys.xyz']
          };
          
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
          
          console.log('✅ Successfully added Irys Testnet');
          
          // Wait a bit and verify the switch
          await new Promise(resolve => setTimeout(resolve, 1000));
          const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
          
          if (newChainId === IRYS_TESTNET_CHAIN_ID) {
            console.log('✅ Network switch verified');
            return true;
          } else {
            throw new Error('Network added but switch failed');
          }
        } catch (addError) {
          console.error('❌ Failed to add network:', addError);
          if (addError.code === 4001) {
            throw new Error('User rejected adding Irys network to MetaMask');
          }
          throw new Error('Failed to add Irys network. Please add it manually in MetaMask.');
        }
      } else if (switchError.code === 4001) {
        throw new Error('User rejected network switch. Please switch to Irys Testnet manually.');
      } else {
        console.error('❌ Unexpected switch error:', switchError);
        throw new Error(`Network switch failed: ${switchError.message || 'Unknown error'}`);
      }
    }
  };

  // Enhanced wallet connection with better error handling
  const connectWallet = async () => {
    if (!window.ethereum) {
      const error = 'MetaMask not detected. Please install MetaMask browser extension.';
      setError(error);
      throw new Error(error);
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('🚀 Starting wallet connection...');
      
      // First request accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }
      
      console.log('👤 Account found:', accounts[0]);
      
      // Check current network
      const currentChainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      setChainId(currentChainId);
      console.log('🌐 Current network:', currentChainId);
      
      // Switch to Irys network if not already on it
      if (currentChainId !== IRYS_TESTNET_CHAIN_ID) {
        console.log('🔄 Not on Irys network, switching...');
        await switchToIrysNetwork();
        
        // Verify the switch was successful
        const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(newChainId);
        
        if (newChainId !== IRYS_TESTNET_CHAIN_ID) {
          throw new Error('Failed to switch to Irys Testnet. Please switch manually.');
        }
      }
      
      // Set account state
      setAccount(accounts[0]);
      setConnected(true);
      setManuallyDisconnected(false);
      localStorage.setItem("connected", "true");
      localStorage.setItem("connectedAccount", accounts[0]);
      
      console.log('✅ Wallet connected successfully:', accounts[0]);
      return accounts[0];
    } catch (err) {
      console.error("❌ Connection error:", err);
      const errorMessage = err.message || "Failed to connect wallet";
      setError(errorMessage);
      setConnected(false);
      setAccount('');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = useCallback(() => {
    console.log('Disconnecting wallet...');
    setManuallyDisconnected(true);
    setConnected(false);
    setAccount("");
    setChainId(null);
    localStorage.removeItem("connected");
    localStorage.removeItem("connectedAccount");
    setError(null);
  }, []);

  // Enhanced account change handler
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts) => {
      console.log('Accounts changed:', accounts);
      
      if (accounts.length === 0) {
        // User disconnected all accounts
        if (connected && !manuallyDisconnected) {
          console.log('All accounts disconnected');
          disconnectWallet();
        }
      } else if (accounts[0] !== account && connected) {
        // Account switched
        console.log('Account switched from', account, 'to', accounts[0]);
        setAccount(accounts[0]);
        localStorage.setItem("connectedAccount", accounts[0]);
      }
    };
    
    const handleChainChanged = (newChainId) => {
      console.log('Chain changed to:', newChainId);
      setChainId(newChainId);
      
      // If not on Irys network, show warning
      if (newChainId !== IRYS_TESTNET_CHAIN_ID && connected) {
        setError('Please switch back to Irys Testnet network');
      } else {
        setError(null);
      }
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [connected, account, manuallyDisconnected, disconnectWallet]);

  // Enhanced auto-connect with better error handling
  useEffect(() => {
    if (manuallyDisconnected) return;
    
    const wasConnected = localStorage.getItem("connected") === "true";
    const savedAccount = localStorage.getItem("connectedAccount");
    
    if (window.ethereum && wasConnected && savedAccount) {
      console.log('Attempting auto-reconnect...');
      
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0 && accounts.includes(savedAccount)) {
            console.log('Auto-reconnecting to:', accounts[0]);
            setAccount(accounts[0]);
            setConnected(true);
            
            // Check if we're on the right network
            window.ethereum.request({ method: 'eth_chainId' })
              .then(currentChainId => {
                setChainId(currentChainId);
                if (currentChainId !== IRYS_TESTNET_CHAIN_ID) {
                  setError('Please switch to Irys Testnet network');
                }
              })
              .catch(err => console.error('Failed to get chain ID:', err));
          } else {
            console.log('Saved account not found, clearing connection');
            localStorage.removeItem("connected");
            localStorage.removeItem("connectedAccount");
          }
        })
        .catch(error => {
          console.error("Failed to get accounts during auto-connect:", error);
          localStorage.removeItem("connected");
          localStorage.removeItem("connectedAccount");
        });
    }
  }, [manuallyDisconnected]);

  // Network status checker
  const isOnCorrectNetwork = chainId === IRYS_TESTNET_CHAIN_ID;

  return {
    account,
    connected,
    isLoading,
    error,
    setError,
    connectWallet,
    disconnectWallet,
    switchToIrysNetwork,
    chainId,
    isOnCorrectNetwork
  };
};