import { ethers } from "ethers"
import dETHAbi from "@/lib/abis/dETH.json"
import sETHAbi from "@/lib/abis/sETH.json"
import type { WalletBalances } from "@/types/wallet"
import { DETH_ADDRESS, SETH_ADDRESS } from "@/lib/web3/constants"

export async function fetchWalletBalances(
  address: string,
  provider: ethers.JsonRpcProvider,
): Promise<WalletBalances> {
  const [ethBalance, dETHBalance, sETHBalance] = await Promise.all([
    provider.getBalance(address),
    new ethers.Contract(DETH_ADDRESS, dETHAbi, provider).balanceOf(address),
    new ethers.Contract(SETH_ADDRESS, sETHAbi, provider).balanceOf(address),
  ])

  return {
    eth: ethers.formatEther(ethBalance),
    dETH: ethers.formatEther(dETHBalance),
    sETH: ethers.formatEther(sETHBalance),
  }
}
