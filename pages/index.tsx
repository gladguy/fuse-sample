import Image from "next/image";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { FuseSDK } from "@fuseio/fusebox-web-sdk";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Head from 'next/head';
import { connectMetaMask } from './utils/connectMetaMask';

//https://app.voltage.finance/swap

import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [smartAccount, setSmartAccount] = useState<string>("");
  const [toValue, setToValue] = useState<string>("");
  const [amountValue, setAmountValue] = useState<string>("");
  const [usdcBal, setUsdcBal] = useState<string>("");
  const [userAccount, setUserAccount] = useState<string>("");
  const [userUSDBal, setUserUSDBal] = useState<string>("");

  const initFuseSDK = async () => {
    const apiKey = "pk_AzF0O45_hxT7MoEa70GdKXtQ";

    const { signer } = await connectMetaMask();

    const address = (await signer).getAddress();
    setUserAccount((await address));

    setSignerAddress((await address));
    setIsConnected(true);

    // Get the signer
   
    const fuseSDK = await FuseSDK.init(apiKey, (await signer), {
      withPaymaster: true,
    });
     
    const smartAccount = fuseSDK.wallet.getSender();
    setSmartAccount(smartAccount);
     


    console.log(
      `Smart account address: https://explorer.fuse.io/address/${smartAccount}`
    );

    return fuseSDK;
  };


    const [isConnected, setIsConnected] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [signerAddress, setSignerAddress] = useState('');
  
    const handleConnectMetaMask = async () => {
      try {
        const { signer } = await connectMetaMask();
        const address = (await signer).getAddress();
        setSmartAccount((await address));

        setSignerAddress((await address));
        setIsConnected(true);
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(error.message);
        setIsConnected(false);
      }
    };
  

    const getTokenUserBalance = async (fuseSDK, tokenAddress, smartAccount) => {
      const tokenBalance = await fuseSDK.explorerModule.getTokenBalance(
        tokenAddress,
        smartAccount
      );
      console.log("...............................");
      console.log(tokenBalance);
      if (tokenBalance !== null) {
        const decimals = 6;
        const formattedBalance = Number(tokenBalance) / Math.pow(10, decimals);
        console.log(`Token: ${tokenAddress}, balance: ${formattedBalance}`);
        setUserUSDBal(formattedBalance.toString());
      } else {
        setUserUSDBal("0.00");
        console.error("Token balance could not be retrieved.");
      }
    };

  const getTokenBalance = async (fuseSDK, tokenAddress, smartAccount) => {
    const tokenBalance = await fuseSDK.explorerModule.getTokenBalance(
      tokenAddress,
      smartAccount
    );
    console.log(tokenBalance);
    if (tokenBalance !== null) {
      const decimals = 6;
      const formattedBalance = Number(tokenBalance) / Math.pow(10, decimals);
      console.log(`Token: ${tokenAddress}, balance: ${formattedBalance}`);
      setUsdcBal(formattedBalance.toString());
    } else {
      setUsdcBal("0.00");
      console.error("Token balance could not be retrieved.");
    }
  };

  const scw = async () => {
    try {
      const fuseSDK = await initFuseSDK();
      const tokenAddress = "0x28C3d1cD466Ba22f6cae51b1a4692a831696391A";
      await getTokenBalance(fuseSDK, tokenAddress, smartAccount);
      await getTokenUserBalance(fuseSDK, tokenAddress, userAccount);

      /*
      const value = parseEther("0");
    const data = ethers.utils.arrayify(NFTContract.interface.encodeFunctionData("safeMint", [to]));

    const txOptions = { ...Variables.DEFAULT_TX_OPTIONS, useNonceSequence };
    const userOp = await fuseSDK.callContract(NFTAddress, value, data, txOptions);
      */

      const mintTx = new ethers.Interface(["function owner()"]);
      const txData = mintTx.encodeFunctionData("owner");
      const to = "0x197d7c3047CB37B8DB327f91943C7025E4F6eA2d";
      const value = ethers.parseEther("0");
      const data = Uint8Array.from([txData]);
      console.log(data);
  
      const res = await fuseSDK.callContract(to, value, data);

      /*const tokenBalance = await fuseSDK.explorerModule.owner(
        "0x197d7c3047CB37B8DB327f91943C7025E4F6eA2d"
      );*/

      console.log(res);
  



    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleTo = (e) => {
    setToValue(e.target.value);
  };

  const handleAmount = (e) => {
    setAmountValue(e.target.value);
  };

  const transfer = async () => {
    console.log(amountValue, toValue);
    const fuseSDK = await initFuseSDK();
    const tokenAddress = "0x28C3d1cD466Ba22f6cae51b1a4692a831696391A";
    const amount = ethers.parseUnits(amountValue, 6);
    const res = await fuseSDK.transferToken(tokenAddress, toValue, amount);
    console.log(`UserOpHash: ${res?.userOpHash}`);
    toast("Waiting for transaction...");
    console.log("Waiting for transaction...");

    const receipt = await res?.wait();
    console.log(
      `User operation hash: https://explorer.fuse.io/tx/${receipt?.transactionHash}`
    );
    toast(
      `User operation hash: https://explorer.fuse.io/tx/${receipt?.transactionHash}`,
      {
        autoClose: 5000,
        pauseOnHover: true,
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Input value:", toValue, amountValue);
    transfer();
  };

  useEffect(() => {
    scw();
  }, []);

  return (
    <main className={`flex min-h-screen flex-col p-24 ${inter.className}`}>
      Welcome to MetaMask Connection App
      {scw ? (
        <>
          <p className="mt-8">
            Smart Account {smartAccount}, USDC Balance: {usdcBal}
          </p>
          <p  className="mt-8">Wallet Address: {signerAddress}, USDC Balance {userUSDBal}</p>           
          <form
            onSubmit={handleSubmit}
            className="flex max-w-md flex-col gap-4"
          >
            <div className="mt-3">

            
        <button onClick={handleConnectMetaMask}>
          {isConnected ? 'Connected' : 'Connect MetaMask'}
        </button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

              <label
                htmlFor="base-input"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              />
              <input
                type="text"
                id="base-input"
                value={toValue}
                onChange={handleTo}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />

              <label
                htmlFor="base-input"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              />
              <input
                type="text"
                id="base-input"
                value={amountValue}
                onChange={handleAmount}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className=" focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              Send
            </button>
          </form>
          <ToastContainer />
        </>
      ) : (
        <div>Add PrivateKey to create an Account</div>
      )}
    </main>
  );
}
