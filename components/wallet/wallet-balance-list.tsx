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

export function WalletBalanceList({ eth, dETH, sETH, className }: WalletBalanceListProps) {
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
      {tokens.map((token) => (
        <TokenBalanceRow key={token.symbol} {...token} />
      ))}
    </div>
  )
}
