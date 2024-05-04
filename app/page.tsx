'use client'
import { DynamicWidget } from "../lib/dynamic";


import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { primaryWallet, walletConnector } = useDynamicContext();
  console.log(walletConnector);
  const isConnected = primaryWallet?.connected;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center flex-col justify-between font-mono text-sm lg:flex">
        {/* Dynamic widget example */}
        <DynamicWidget innerButtonComponent={undefined}/>

        {isConnected && (
          <div className="flex gap-4 mt-20">
            {/* Onramp button */}
            <button type="button" style={buttonStyle} onClick={() => router.push('/onramp')}>
              Onramp
            </button>

            {/* Offramp button */}
            <button type="button" style={buttonStyle} onClick={() => router.push('/offramp')}>
              Offramp
            </button>

            {/* Mint NFT button */}
            <button type="button" style={buttonStyle} onClick={() => router.push('/mint')}>
              Mint NFT in Batch Tx
            </button>

            {/* Swap button */}
            <button type="button" style={buttonStyle} onClick={() => router.push('/swap')}>
              Cross Chain Token Transfer
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

// Common button styling
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
