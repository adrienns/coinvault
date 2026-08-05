# CoinVault

A decentralized staking and governance platform for Ethereum. Users can deposit ETH, stake for rewards, and participate in on-chain governance.

This repository is used as a frontend take-home assessment for CoinVault engineering candidates.

---

## Overview

CoinVault is a Next.js application that interacts with Ethereum smart contracts on the Holesky testnet. The product covers four core flows:

| Flow | Description |
| --- | --- |
| Deposit / Withdraw | Convert ETH into dETH (and back) |
| Stake / Unstake | Convert dETH into sETH to earn staking rewards |
| Leaderboard | View staking rankings and protocol statistics |
| Governance | Create proposals, vote, and execute outcomes |

Wallet connection is already implemented. The candidate assignment is to surface live token balances after a user connects.

---

## Take-Home Assignment

### Objective

The landing page already includes a Connect Wallet button. After a user connects an Ethereum wallet, the Connected Wallet panel in the top-right corner must display real-time balances for the following tokens:

| Token | Source |
| --- | --- |
| ETH | Native wallet balance |
| dETH | Deposited ETH token (`DepositETH` ERC-20) |
| sETH | Staked ETH token (`StakedETH` ERC-20) |

Token balances must be visible on every page of the application (Dashboard, Deposit, Stake, Leaderboard, and Governance).

### Requirements

1. Read live balances from the connected wallet and the relevant contracts.
2. Render ETH, dETH, and sETH in the Connected Wallet panel (top-right).
3. Keep balances in sync after connect, disconnect, network changes, and deposit/stake activity.
4. Show the same balances on all application pages, including mobile layouts.
5. Handle loading, empty, and error states in a user-friendly way.

### Acceptance Criteria

- Connecting a wallet populates ETH, dETH, and sETH with actual on-chain values (not placeholders).
- Balances update without a full page reload.
- Values remain visible while navigating between routes.
- Disconnected users continue to see the Connect Wallet button, with no stale balances.

### Submission

Please complete the assignment by the end of today and submit one of the following:

1. A short video demonstrating wallet connection and live balance updates across pages, or
2. A public Git repository with your solution.

Share the video or repository link with the hiring contact.

---

## Tech Stack

- Framework: Next.js 15, React 18, TypeScript
- Styling: Tailwind CSS, shadcn/ui
- Web3: ethers.js
- Contracts: Solidity ERC-20 tokens (Holesky testnet)
- State: React Context and hooks

---

## Getting Started

### Prerequisites

- Node.js 18 or later (20 recommended)
- npm
- MetaMask (or another Ethereum-compatible wallet)
- Access to the [Holesky testnet](https://holesky.etherscan.io/)

### Installation

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Smart Contracts

The frontend integrates with four Holesky contracts:

| Contract | Token / Role | Purpose |
| --- | --- | --- |
| `DepositETH` | dETH | Issued when users deposit ETH |
| `StakedETH` | sETH | Issued when users stake dETH |
| `Governance` | — | Proposal creation, voting, and execution |
| `StakingDashboard` | — | Protocol statistics and leaderboard data |

Contract ABIs live in `lib/abis/`. Addresses can be overridden with `NEXT_PUBLIC_*` environment variables.

---

## Project Structure

```
Frontend/
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── layout/           # Navbar, sidebar, and app shell
│   └── ui/               # shadcn/ui primitives
├── contracts/            # Smart contract source
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and contract ABIs
│   └── abis/
├── public/               # Static assets
├── styles/               # Global styles
└── backend/              # Supporting API
```

---

## Network

| Setting | Value |
| --- | --- |
| Network | Holesky Testnet |
| Chain ID | 17000 |
| Explorer | https://holesky.etherscan.io |

Ensure your wallet is connected to Holesky before testing deposit, stake, or balance features.
