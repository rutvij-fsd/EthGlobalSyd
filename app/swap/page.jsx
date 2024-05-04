'use client'
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Loading from "../Loading";
import Typewriter from "../Typewriter";
import logo from '../chainlink-logo.svg'; // Ensure you have the logo image in your project
import Image from "next/image";
const contractABI = require('./abi.json');
const contractAddress = '0xc31bdFe9102149E85110833910ee52F02566247b';

export default function Swap() {
  const [account, setAccount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [balance, setBalance] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
          alert('Error connecting to MetaMask. See console for more details.');
        }
      } else {
        alert('MetaMask is not installed. Please consider installing it to interact with this app.');
      }
    };
    loadWeb3();
  }, []);

  const checkBalance = async (address) => {
    if (!web3) {
      alert("Web3 is not initialized");
      return;
    }

    const contract = new web3.eth.Contract(contractABI, contractAddress);
    try {
      const result = await contract.methods.balancesOf(address).call();
      const usdcBalance = web3.utils.fromWei(result.usdcBalance, 'mwei');
      const linkBalance = web3.utils.fromWei(result.linkBalance, 'ether');
      setBalance(`${usdcBalance} USDC and ${linkBalance} LINK`);
    } catch (error) {
      console.error('Error fetching balances:', error);
      alert('Failed to fetch balances. Check console for details.');
    }
  };

  const handleTransfer = async () => {
    if (!account || !receiverAddress || !amount) {
      alert("Please check your inputs and wallet connection.");
      return;
    }
    setIsTransferring(true);
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    try {
      const txResponse = await contract.methods.transferUsdcToSepolia(receiverAddress, web3.utils.toWei(amount, 'mwei')).send({ from: account });
      console.log('Transfer successful:', txResponse);
      setTransactionHash(txResponse.events.UsdcTransferred.returnValues.messageId);
      setIsTransferring(false);
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed!');
      setIsTransferring(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", paddingTop: "2rem" }}>
      <Image src={logo} alt="Logo" style={{ width: 150, marginBottom: 20 }}/>
      <Typewriter text="Powered by ChainLink" />

      <h1>USDC Transfer</h1>
      <input type="text" placeholder="Receiver Address" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} style={{ padding: "10px", margin: "5px", color: "black" }} />
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: "10px", margin: "5px", color: "black"}} />

      <button onClick={() => checkBalance(account)} style={{ padding: "10px", margin: "5px" }}>Check Wallet Balance</button>
      <button onClick={() => checkBalance(contractAddress)} style={{ padding: "10px", margin: "5px" }}>Check Contract Balance</button>
      <button onClick={handleTransfer} style={{ padding: "10px", margin: "5px" }}>Transfer USDC</button>
      {balance && <p>Balance: {balance}</p>}
      
      <Loading isLoading={isTransferring} />
      {!isTransferring && transactionHash && (
        <a href={`https://ccip.chain.link/msg/${transactionHash}`} target="_blank" rel="noopener noreferrer">View Transaction</a>
      )}
      {isTransferring && <Typewriter text="Transaction in progress..." />}
    </div>
  );
}
