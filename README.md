# Intelligent Crawler

URL verification interface for GenLayer smart contracts. Check if URLs are accessible, stable, and ready for use by intelligent oracles.

## Setup

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```

3. **Start development server**
   ```bash
   bun run dev
   ```

4. **Build for production**
   ```bash
   bun run build
   ```

## Environment Variables

- `BUN_PUBLIC_CONTRACT_ADDRESS` - GenLayer smart contract address
- `BUN_PUBLIC_GENLAYER_RPC_URL` - GenLayer RPC endpoint
- `BUN_PUBLIC_GENLAYER_CHAIN_ID` - Chain ID
- `BUN_PUBLIC_GENLAYER_CHAIN_NAME` - Network name
- `BUN_PUBLIC_GENLAYER_SYMBOL` - Token symbol

## Tech Stack

- **Runtime**: Bun
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: GenLayer smart contracts
