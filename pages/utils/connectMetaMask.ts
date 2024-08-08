import { ethers } from 'ethers';

export async function connectMetaMask() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create an ethers provider
      const provider = new ethers.BrowserProvider(window.ethereum);
  
     
      // Get the signer
      const signer = provider.getSigner();
      
      
      console.log('MetaMask connected:', signer);
      return { provider, signer };
    } catch (error) {
      console.error('User denied account access or error occurred:', error);
      throw error;
    }
  } else {
    console.error('MetaMask is not installed.');
    throw new Error('MetaMask is not installed');
  }
}
