import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatTokenBalance } from "@/lib/wallet/format-balance"

type TokenBalance = {
  symbol: string
  amount: string
  iconClassName: string
}

type WalletBalanceListProps = {
  eth: string
  dETH: string
  sETH: string
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  className?: string
}

function TokenBalanceRow({ symbol, amount, iconClassName }: TokenBalance) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-lightblue-100 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
            iconClassName,
          )}
        >
          {symbol.slice(0, 1)}
        </div>
        <p className="text-sm font-semibold text-lightblue-950">{symbol}</p>
      </div>
      <p className="shrink-0 text-right font-mono text-sm font-semibold tabular-nums text-lightblue-950">
        {formatTokenBalance(amount)}
      </p>
    </div>
  )
}

function BalanceSkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-lightblue-100 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function WalletBalanceList({
  eth,
  dETH,
  sETH,
  isLoading = false,
  error = null,
  onRetry,
  className,
}: WalletBalanceListProps) {
  const tokens: TokenBalance[] = [
    {
      symbol: "ETH",
      amount: eth,
      iconClassName: "bg-gradient-to-br from-slate-700 to-slate-900",
    },
    {
      symbol: "dETH",
      amount: dETH,
      iconClassName: "bg-gradient-to-br from-sky-500 to-blue-600",
    },
    {
      symbol: "sETH",
      amount: sETH,
      iconClassName: "bg-gradient-to-br from-violet-500 to-purple-600",
    },
  ]

  return (
    <div className={cn("space-y-2", className)}>
      <p className="px-1 text-xs font-medium uppercase tracking-wide text-lightblue-600">Balances</p>

      {isLoading ? (
        <>
          <BalanceSkeletonRow />
          <BalanceSkeletonRow />
          <BalanceSkeletonRow />
        </>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
          <p>{error}</p>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 border-red-200 bg-white text-red-700 hover:bg-red-50"
              onClick={onRetry}
            >
              Try again
            </Button>
          ) : null}
        </div>
      ) : (
        tokens.map((token) => <TokenBalanceRow key={token.symbol} {...token} />)
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 px-1 text-xs text-lightblue-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Loading balances...</span>
        </div>
      ) : null}
    </div>
  )
}
