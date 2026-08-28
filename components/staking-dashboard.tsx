"use client"

import { useCallback, useEffect, useState } from "react"
import { useWeb3 } from "@/components/web3-provider"
import { ethers } from "ethers"
import { Wallet, Layers, Users, BarChart3, ArrowDownToLine, ArrowUpFromLine, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import stakingDashboardAbi from "@/lib/abis/stakingDashboard.json"
import { STAKING_DASHBOARD_ADDRESS } from "@/lib/web3/constants"
import { createHoleskyProvider } from "@/lib/web3/provider"

const emptyUserStats = {
  stakedAmount: "0",
  stakingTimestamp: "0",
  rank: "0",
  percentageOfTotal: "0",
}

export function StakingDashboard() {
  const {
    stakingDashboardContract,
    isConnected,
    account,
    connectWallet,
    refreshBalances,
    dETHBalance,
    sETHBalance,
  } = useWeb3()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [overview, setOverview] = useState({
    totalETHDeposited: "0",
    totalETHStaked: "0",
    totalStakers: "0",
    averageStakeAmount: "0",
  })
  const [userStats, setUserStats] = useState(emptyUserStats)

  const getReadContract = useCallback(() => {
    if (stakingDashboardContract) {
      return stakingDashboardContract
    }

    const provider = createHoleskyProvider()
    return new ethers.Contract(STAKING_DASHBOARD_ADDRESS, stakingDashboardAbi, provider)
  }, [stakingDashboardContract])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      const contract = getReadContract()
      const overviewData = await contract.getStakingOverview()

      setOverview({
        totalETHDeposited: ethers.formatEther(overviewData.totalETHDeposited),
        totalETHStaked: ethers.formatEther(overviewData.totalETHStaked),
        totalStakers: overviewData.totalStakers.toString(),
        averageStakeAmount: ethers.formatEther(overviewData.averageStakeAmount),
      })

      if (account && isConnected) {
        const userStatsData = await contract.getStakerDetails(account)
        setUserStats({
          stakedAmount: ethers.formatEther(userStatsData.stakedAmount),
          stakingTimestamp: new Date(Number(userStatsData.stakingTimestamp) * 1000).toLocaleDateString(),
          rank: userStatsData.rank.toString(),
          percentageOfTotal: (Number(userStatsData.percentageOfTotal) / 100).toFixed(2),
        })
      } else {
        setUserStats(emptyUserStats)
      }
    } catch (error) {
      console.error("Error fetching staking data:", error)
    } finally {
      setLoading(false)
    }
  }, [account, getReadContract, isConnected])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchData()
    }
  }, [fetchData, mounted])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    if (isConnected) {
      await refreshBalances()
    }
    await fetchData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (!mounted) {
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-white text-lightblue-600 border-lightblue-200 hover:bg-lightblue-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-lightblue-700">Available Balance</h3>
            <Wallet className="h-5 w-5 text-lightblue-500" />
          </div>
          {isConnected ? (
            <>
              <div className="text-2xl font-bold text-lightblue-950">{Number.parseFloat(dETHBalance).toFixed(4)}</div>
              <div className="text-sm font-medium text-lightblue-600">dETH</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-lightblue-400">—</div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-sm font-medium text-lightblue-600"
                onClick={connectWallet}
              >
                Connect wallet to view
              </Button>
            </>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-lightblue-700">Staked Balance</h3>
            <Layers className="h-5 w-5 text-lightblue-500" />
          </div>
          {isConnected ? (
            <>
              <div className="text-2xl font-bold text-lightblue-950">{Number.parseFloat(sETHBalance).toFixed(4)}</div>
              <div className="text-sm font-medium text-lightblue-600">sETH</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-lightblue-400">—</div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-sm font-medium text-lightblue-600"
                onClick={connectWallet}
              >
                Connect wallet to view
              </Button>
            </>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-lightblue-700">Total Protocol Staked</h3>
            <BarChart3 className="h-5 w-5 text-lightblue-500" />
          </div>
          <div className="text-2xl font-bold text-lightblue-950">
            {Number.parseFloat(overview.totalETHStaked).toFixed(2)}
          </div>
          <div className="text-sm font-medium text-lightblue-600">ETH</div>
        </div>
      </div>

      {/* Actions */}
      <h2 className="section-title">Actions</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/deposit" className="action-button">
          <ArrowDownToLine className="h-5 w-5" />
          Deposit
        </Link>
        <Link href="/deposit?tab=withdraw" className="action-button">
          <ArrowUpFromLine className="h-5 w-5" />
          Withdraw
        </Link>
        <Link href="/stake" className="action-button">
          <Layers className="h-5 w-5" />
          Stake
        </Link>
        <Link href="/stake?tab=unstake" className="action-button">
          <ArrowUpFromLine className="h-5 w-5" />
          Unstake
        </Link>
      </div>

      {/* Total Stakers */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-lightblue-700">Total Stakers</h3>
          <Users className="h-5 w-5 text-lightblue-500" />
        </div>
        <div className="text-2xl font-bold text-lightblue-950">{overview.totalStakers}</div>
        <div className="text-sm text-lightblue-700 mt-2">
          Average stake: {Number.parseFloat(overview.averageStakeAmount).toFixed(4)} ETH
        </div>
      </div>
    </div>
  )
}
