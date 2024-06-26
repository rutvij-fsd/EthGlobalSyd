"use client"
import React, { useCallback, useRef, useEffect, useState, use } from "react";
import { useReadContract } from "wagmi";
import contractAbi from "./0x34bE7f35132E97915633BC1fc020364EA5134863.json";

import "./transaction.css";

import Loading from "../Loading";
import Typewriter from "../Typewriter";

import { encodeFunctionData } from "viem";

import {
  useDynamicContext,
  usePasskeyRecovery,
} from "@dynamic-labs/sdk-react-core";

import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";
import { redirect } from "next/navigation";

const nftAddress = "0x34bE7f35132E97915633BC1fc020364EA5134863";

function Transaction() {
  const [isMinting, setIsMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  const { initPasskeyRecoveryProcess } = usePasskeyRecovery();
  const { primaryWallet, user } = useDynamicContext();
const isConnected= primaryWallet?.connected;
const address = primaryWallet?.address;

  const alias = user?.email || "Anon";

  const { data: balance = 0, refetch } = useReadContract({
    address: nftAddress,
    abi: contractAbi,
    functionName: "balanceOf",
    args: [address],
  });
  console.log(balance);
  const mint = useCallback(async () => {
    const vcs = user?.verifiedCredentials;

    const verifiedCredential = vcs?.find((vc) => vc.walletName === "turnkeyhd");
    const hasAuthenticator =
      verifiedCredential?.walletProperties?.isAuthenticatorAttached;
  
    if (!hasAuthenticator) {
      await initPasskeyRecoveryProcess();
    }

    const connector = await primaryWallet?.connector;

    if (!connector) {
      console.error("no connector");
      return;
    }
    setIsMinting(true);

    if (isZeroDevConnector(connector)) {
      try {
        const aaProvider = connector.getAccountAbstractionProvider();
        // console.log(aaProvider)
        if (!aaProvider) return;

        const userOp = {
          target: nftAddress ,
          data: encodeFunctionData({
            abi: contractAbi,
            functionName: "mint",
            args: [address],
          }) ,
        };

        const { hash } = await aaProvider.sendUserOperation([userOp, userOp]);
        console.log(hash)
        const result = await aaProvider.waitForUserOperationTransaction(
          hash 
        );

        console.log(result);
        setIsMinting(false);
        setHasMinted(true);
      } catch (e) {
        setIsMinting(false);
        console.log(e);
      }
    }
  }, [primaryWallet, user, address, initPasskeyRecoveryProcess]);

  const interval = useRef();

  const handleClick = useCallback(() => {
    mint();
    interval.current = setInterval(() => {
      refetch();
    }, 1000);
    setTimeout(() => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    }, 100000);
  }, [mint, refetch]);

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current);
    }
  }, [balance, interval]);  
 
  const mintAgain = () => {
    setHasMinted(false);
    setIsMinting(false);
    return handleClick();
  };

  if(!isConnected){
    redirect('/')
  }

  useEffect(() => {
    if (balance >= 2) {
      setHasMinted(true);
    }
  }
  , [balance]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
        paddingTop: "2rem",
      }}
    >
        
      {isConnected && (
        <>
          {(hasMinted)&& (
            <>
              <strong style={{ fontSize: "1.5rem" }}>NFT Count</strong>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "medium",
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  border: "10px solid #2B8DE3",
                }}
              >{`${balance ?? 0}`}</div>
            </>
          )}
          {!isMinting && !hasMinted && (
            <Typewriter
              text={`Hey ${alias}, let's get you your first two NFTs! Click Mint below.`}
            />
          )}
          <Loading isLoading={isMinting} />
          {primaryWallet && !hasMinted && (
            <button className="mint-button" onClick={() => handleClick()}>
              Mint
            </button>
          )}
          {primaryWallet && hasMinted && (
            <button className="mint-button" onClick={() => mintAgain()}>
              Mint Again
            </button>
          )}
        </>
      )} 
    </div>
  );
}

export default Transaction;