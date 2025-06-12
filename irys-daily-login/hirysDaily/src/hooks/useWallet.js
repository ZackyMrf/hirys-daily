import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const IRYS_TESTNET_CHAIN_ID = '0x4f6'; // Hex for 1270

export const useWallet = () => {
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);

  const switchToIrysNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: IRYS_TESTNET_CHAIN_ID }],
      });
    } catch (switchError) {
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
      localStorage.setItem("connected", "true");
      return accounts[0];
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to connect wallet");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = useCallback(() => {
    setManuallyDisconnected(true);
    setConnected(false);
    setAccount("");
    localStorage.removeItem("connected");
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        if (connected && !manuallyDisconnected) {
          disconnectWallet();
        }
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [connected, account, manuallyDisconnected, disconnectWallet]);

  // Auto-connect if previously connected
  useEffect(() => {
    if (manuallyDisconnected) return;
    
    const wasConnected = localStorage.getItem("connected") === "true";
    
    if (window.ethereum && wasConnected) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setConnected(true);
          }
        })
        .catch(error => {
          console.error("Failed to get accounts:", error);
        });
    }
  }, [manuallyDisconnected]);

  return {
    account,
    connected,
    isLoading,
    error,
    setError,
    connectWallet,
    disconnectWallet,
    switchToIrysNetwork
  };
};