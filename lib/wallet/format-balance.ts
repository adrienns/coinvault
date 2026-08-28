export function formatTokenBalance(balance: string, decimals = 4): string {
  const value = Number.parseFloat(balance)
  if (!Number.isFinite(value)) {
    return "0.0000"
  }

  if (value === 0) {
    return "0.0000"
  }

  if (value < 0.0001) {
    return "<0.0001"
  }

  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
