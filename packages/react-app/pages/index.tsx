import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { celoAlfajores } from "viem/chains";
import { useReadContract } from "wagmi";
import {
  erc20Abi,
  formatEther,
  parseEther,
  createWalletClient,
  custom,
  stringToHex,
  createPublicClient,
  http,
} from "viem";

const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
});

const cUSDTokenAddressTestnet = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

export default function Home() {
  const [userAddress, setUserAddress] = useState<`0x${string}` | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: cUSDTokenAddressTestnet,
    functionName: "balanceOf",
    args: [userAddress!],
    chainId: celoAlfajores.id,
    query: { enabled: !!userAddress },
  });
  const [tx, setTx] = useState<any>(undefined);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      setUserAddress(address);
    }
  }, [address, isConnected]);

  const sendCUSD = async (to: `0x${string}`, amount: string) => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    let [address] = await walletClient.getAddresses();

    const amountInWei = parseEther(amount);

    const tx = await walletClient.writeContract({
      address: cUSDTokenAddressTestnet,
      abi: erc20Abi,
      functionName: "transfer",
      account: address,
      args: [to, amountInWei],
    });

    let receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    setTx(receipt);

    return receipt;
  };

  const signTransaction = async () => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    let [address] = await walletClient.getAddresses();

    const res = await walletClient.signMessage({
      account: address,
      message: stringToHex("Hello from Celo Composer MiniPay Template!"),
    });

    return res;
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="h1">
        There you go... a canvas for your next Celo project!
      </div>
      {isConnected ? (
        <>
          <div className="h2 text-center">Your address: {userAddress}</div>
          <div className="h2 text-center">
            Your balance: {formatEther(balance || BigInt(0)).toString()}
          </div>
        </>
      ) : (
        <div>No Wallet Connected</div>
      )}

      {address && (
        <>
          {tx && (
            <p className="font-bold mt-4">
              Tx Completed: {(tx.transactionHash as string).substring(0, 6)}
              ...
              {(tx.transactionHash as string).substring(
                tx.transactionHash.length - 6,
                tx.transactionHash.length
              )}
            </p>
          )}
          <div className="w-full mt-7 mb-3 px-4">
            <button
              onClick={() => sendCUSD(address, "0.01")}
              className="w-full font-bold border border-black bg-colors-secondary rounded-2xl py-3 flex justify-center items-center"
            >
              Send 0.01 cUSD to your own address
            </button>
          </div>
          <div className="w-full mb-3 px-4">
            <button
              onClick={signTransaction}
              className="w-full font-bold border border-black bg-colors-secondary rounded-2xl py-3 flex justify-center items-center"
            >
              Sign a Message
            </button>
          </div>
        </>
      )}
    </div>
  );
}
