import { ethers } from "ethers"
import { HOLESKY_CHAIN_ID, HOLESKY_RPC_URL } from "@/lib/web3/constants"

export function createHoleskyProvider() {
  return new ethers.JsonRpcProvider(HOLESKY_RPC_URL, HOLESKY_CHAIN_ID, {
    staticNetwork: true,
  })
}
