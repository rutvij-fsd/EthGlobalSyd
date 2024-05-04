'use client'
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Loading from "../Loading";
import Typewriter from "../Typewriter";
import Logo from '../chainlink-logo.svg'; // Ensure you have the logo image in your project
import logo from '../CROSSLINK.png'
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
      <Image src={logo} alt="Logo" style={{ width: 250, marginBottom: 5}}/>
      <Typewriter text="Powered by ChainLink" />
      <Image src={Logo} alt="Logo" style={{ width: 250, marginBottom: 5}}/>
      <h1>Transfer USDC From Avalanche Fuji To Sepholia</h1>
      <input type="text" placeholder="Receiver Address" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} style={{ padding: "10px", margin: "5px", color: "black" }} />
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: "10px", margin: "5px", color: "black"}} />

      <button  type="button" style={buttonStyle} onClick={handleTransfer} >Transfer USDC</button>
      <div className='flex gap-5'>
      <button type="button" style={buttonStyle} onClick={() => checkBalance(account)} >Check Wallet Balance</button>
      <button type="button" style={buttonStyle} onClick={() => checkBalance(contractAddress)} >Check Contract Balance</button>
      </div>
      {balance && <p>Balance: {balance}</p>}
      
      <Loading isLoading={isTransferring} />
      {!isTransferring && transactionHash && (
        <a  href={`https://ccip.chain.link/msg/${transactionHash}`} target="_blank" rel="noopener noreferrer">View Transaction</a>
      )}
      {isTransferring && <Typewriter text="Transaction in progress..." />}
    </div>
  );
}


const buttonStyle = {
  background: "rgb(96, 133, 188)",
  border: "none",
  borderRadius: "5px",
  padding: "10px 20px",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "0.3s",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  fontWeight: "bold",
  color: "black",
};
