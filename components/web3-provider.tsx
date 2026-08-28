"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"

import dETHAbi from "@/lib/abis/dETH.json"
import sETHAbi from "@/lib/abis/sETH.json"
import governanceAbi from "@/lib/abis/governance.json"
import stakingDashboardAbi from "@/lib/abis/stakingDashboard.json"
import { fetchWalletBalances } from "@/lib/web3/balances"
import {
  DETH_ADDRESS,
  GOVERNANCE_ADDRESS,
  HOLESKY_CHAIN_ID,
  HOLESKY_RPC_URL,
  SETH_ADDRESS,
  STAKING_DASHBOARD_ADDRESS,
} from "@/lib/web3/constants"

if (typeof window !== "undefined") {
  if (!process.env.NEXT_PUBLIC_HOLESKY_RPC_URL) {
    console.warn(
      "Using fallback HOLESKY_RPC_URL; set NEXT_PUBLIC_HOLESKY_RPC_URL in .env.local for stability.",
    )
  }
  if (!process.env.NEXT_PUBLIC_STAKING_DASHBOARD_ADDRESS) {
    console.warn(
      "Using fallback STAKING_DASHBOARD_ADDRESS; set NEXT_PUBLIC_STAKING_DASHBOARD_ADDRESS in .env.local if different.",
    )
  }
}

type Web3ContextType = {
  account: string | null
  provider: ethers.JsonRpcProvider | null
  signer: ethers.JsonRpcSigner | null
  dETHContract: ethers.Contract | null
  sETHContract: ethers.Contract | null
  governanceContract: ethers.Contract | null
  stakingDashboardContract: ethers.Contract | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnected: boolean
  chainId: number | null
  ethBalance: string
  dETHBalance: string
  sETHBalance: string
  refreshBalances: () => Promise<void>
  networkName: string
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  dETHContract: null,
  sETHContract: null,
  governanceContract: null,
  stakingDashboardContract: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnected: false,
  chainId: null,
  ethBalance: "0",
  dETHBalance: "0",
  sETHBalance: "0",
  refreshBalances: async () => {},
  networkName: "",
})

export const useWeb3 = () => useContext(Web3Context)

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [dETHContract, setDETHContract] = useState<ethers.Contract | null>(null)
  const [sETHContract, setSETHContract] = useState<ethers.Contract | null>(null)
  const [governanceContract, setGovernanceContract] = useState<ethers.Contract | null>(null)
  const [stakingDashboardContract, setStakingDashboardContract] = useState<ethers.Contract | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [networkName, setNetworkName] = useState("")
  const [hasShownConnectToast, setHasShownConnectToast] = useState(false)
  const [ethBalance, setEthBalance] = useState("0")
  const [dETHBalance, setDETHBalance] = useState("0")
  const [sETHBalance, setSETHBalance] = useState("0")

  const { toast } = useToast()

  const clearBalances = useCallback(() => {
    setEthBalance("0")
    setDETHBalance("0")
    setSETHBalance("0")
  }, [])

  const refreshBalances = useCallback(
    async (address?: string) => {
      const walletAddress = address ?? account
      if (!walletAddress) {
        clearBalances()
        return
      }

      try {
        const balances = await fetchWalletBalances(walletAddress)
        setEthBalance(balances.eth)
        setDETHBalance(balances.dETH)
        setSETHBalance(balances.sETH)
      } catch (error) {
        console.error("Error refreshing balances:", error)
      }
    },
    [account, clearBalances],
  )

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        const userAddress = accounts[0]

        const chainIdHex = await window.ethereum.request({
          method: "eth_chainId",
        })
        const currentChainId = Number.parseInt(chainIdHex, 16)

        if (currentChainId !== HOLESKY_CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${HOLESKY_CHAIN_ID.toString(16)}` }],
            })
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${HOLESKY_CHAIN_ID.toString(16)}`,
                    chainName: "Ethereum Testnet",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: [HOLESKY_RPC_URL],
                    blockExplorerUrls: ["https://holesky.etherscan.io"],
                  },
                ],
              })
            } else {
              throw switchError
            }
          }
        }

        const directProvider = new ethers.JsonRpcProvider(HOLESKY_RPC_URL)

        try {
          const stakingCode = await directProvider.getCode(STAKING_DASHBOARD_ADDRESS)
          if (!stakingCode || stakingCode === "0x") {
            toast({
              title: "Contract Not Found",
              description:
                "StakingDashboard contract not found at address on the configured RPC. Verify the address and network.",
              variant: "destructive",
            })
            return
          }
        } catch (codeErr) {
          console.warn("Failed to fetch contract code:", codeErr)
        }

        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        const web3Signer = await browserProvider.getSigner()
        const network = await directProvider.getNetwork()

        setNetworkName("Connected")
        setAccount(userAddress)
        setProvider(directProvider)
        setSigner(web3Signer)
        setIsConnected(true)
        setChainId(Number(network.chainId))

        try {
          const dETH = new ethers.Contract(DETH_ADDRESS, dETHAbi, web3Signer)
          const sETH = new ethers.Contract(SETH_ADDRESS, sETHAbi, web3Signer)
          const governance = new ethers.Contract(GOVERNANCE_ADDRESS, governanceAbi, web3Signer)
          const stakingDashboard = new ethers.Contract(
            STAKING_DASHBOARD_ADDRESS,
            stakingDashboardAbi,
            web3Signer,
          )

          setDETHContract(dETH)
          setSETHContract(sETH)
          setGovernanceContract(governance)
          setStakingDashboardContract(stakingDashboard)
        } catch (contractError) {
          console.error("Error initializing contracts:", contractError)
          toast({
            title: "Contract Initialization Error",
            description: "There was an error initializing the smart contracts.",
            variant: "destructive",
          })
        }

        await refreshBalances(userAddress)

        if (!hasShownConnectToast) {
          toast({
            title: "Wallet Connected",
            description: `Connected to ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`,
          })
          setHasShownConnectToast(true)
        }
      } catch (error) {
        console.error("Error connecting wallet:", error)
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Metamask Not Found",
        description: "Please install Metamask to use this application",
        variant: "destructive",
      })
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setSigner(null)
    setProvider(null)
    setDETHContract(null)
    setSETHContract(null)
    setGovernanceContract(null)
    setStakingDashboardContract(null)
    setIsConnected(false)
    setChainId(null)
    setNetworkName("")
    setHasShownConnectToast(false)
    clearBalances()

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          await refreshBalances(accounts[0])
        } else {
          setAccount(null)
          setIsConnected(false)
          setHasShownConnectToast(false)
          clearBalances()
        }
      })

      window.ethereum.on("chainChanged", async (chainIdHex: string) => {
        const newChainId = Number.parseInt(chainIdHex, 16)
        setChainId(newChainId)

        if (newChainId !== HOLESKY_CHAIN_ID) {
          toast({
            title: "Wrong Network",
            description: "Please switch to the correct network",
            variant: "destructive",
          })
          setIsConnected(false)
          setNetworkName("")
          setHasShownConnectToast(false)
          clearBalances()
        } else {
          setNetworkName("Connected")
          if (account) {
            await refreshBalances(account)
          }
        }
      })
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [account, clearBalances, refreshBalances, toast])

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })
          if (accounts.length > 0) {
            await connectWallet()
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    checkConnection()
  }, [])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isConnected && account) {
      intervalId = setInterval(() => {
        refreshBalances()
      }, 15000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isConnected, account, refreshBalances])

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        dETHContract,
        sETHContract,
        governanceContract,
        stakingDashboardContract,
        connectWallet,
        disconnectWallet,
        isConnected,
        chainId,
        ethBalance,
        dETHBalance,
        sETHBalance,
        refreshBalances: () => refreshBalances(),
        networkName,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}
